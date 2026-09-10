import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getChatrooms as fetchChatrooms } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useAuth } from './AuthContext';

type Message = Database['public']['Tables']['messages']['Row'];

interface MessageContextType {
  messages: { [key: string]: Message[] };
  loading: boolean;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  markAsRead: (senderId: string) => Promise<void>;
  getUnreadCount: (senderId: string) => number;
  getChatrooms: (userId: string) => Promise<{ data: any[], count: number | null }>;
  fetchMessages: (senderId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const cleanup = subscribeToMessages();
      return () => {
        cleanup();
      };
    }
    return () => {};
  }, [user]);

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            setMessages((prev) => ({
              ...prev,
              [newMessage.sender_id]: [
                ...(prev[newMessage.sender_id] || []),
                newMessage,
              ],
            }));
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as Message;
            setMessages((prev) => ({
              ...prev,
              [updatedMessage.sender_id]: prev[updatedMessage.sender_id].map(
                (msg) => (msg.id === updatedMessage.id ? updatedMessage : msg)
              ),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const fetchMessages = async (senderId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${senderId},receiver_id.eq.${senderId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((prev) => ({
        ...prev,
        [senderId]: data || [],
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    try {
      const { data, error } = await (supabase.from('messages') as any).insert({
        sender_id: user?.id,
        receiver_id: receiverId,
        content,
        status: 'sent',
        type: 'text',
      }).select();

      if (error) throw error;

      const newMsg = data?.[0];
      if (!newMsg) return;

      // Update local state
      setMessages((prev) => ({
        ...prev,
        [receiverId]: [
          ...(prev[receiverId] || []),
          {
            ...newMsg,
            status: 'sent',
          },
        ],
      }));

      // Update message status to delivered
      setTimeout(async () => {
        const { error: updateError } = await (supabase
          .from('messages') as any)
          .update({ status: 'delivered' })
          .eq('id', newMsg.id);

        if (updateError) throw updateError;

        setMessages((prev) => ({
          ...prev,
          [receiverId]: prev[receiverId].map((msg: any) =>
            msg.id === newMsg.id ? { ...msg, status: 'delivered' } : msg
          ),
        }));
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (senderId: string) => {
    try {
      const { error } = await (supabase
        .from('messages') as any)
        .update({ status: 'read' })
        .eq('sender_id', senderId)
        .eq('receiver_id', user?.id as string)
        .eq('status', 'delivered');

      if (error) throw error;

      setMessages((prev) => ({
        ...prev,
        [senderId]: prev[senderId].map((msg) =>
          msg.status === 'delivered' ? { ...msg, status: 'read' } : msg
        ),
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  };

  const getUnreadCount = (senderId: string) => {
    return (
      messages[senderId]?.filter(
        (msg) => msg.sender_id === senderId && msg.status === 'delivered'
      ).length || 0
    );
  };

  const getChatrooms = async (userId: string) => {
    try {
      return await fetchChatrooms(userId);
    } catch (error) {
      console.error('Error getting chatrooms:', error);
      return { data: [], count: 0 };
    }
  };

  const value = {
    messages,
    loading,
    sendMessage,
    markAsRead,
    getUnreadCount,
    getChatrooms,
    fetchMessages,
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessageContext() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
} 