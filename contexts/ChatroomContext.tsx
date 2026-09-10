import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { useAuth } from './AuthContext';

type Chatroom = Database['public']['Tables']['chatrooms']['Row'] & {
  unread_count?: number;
  last_message?: {
    content: string;
    created_at: string;
  };
};

type Message = Database['public']['Tables']['messages']['Row'];

interface ChatroomContextType {
  chatrooms: Chatroom[];
  messages: Message[];
  loading: boolean;
  fetchChatrooms: () => Promise<void>;
  fetchMessages: (chatroomId: string) => Promise<void>;
  sendMessage: (chatroomId: string, content: string, type?: 'text' | 'image' | 'video' | 'audio') => Promise<void>;
  markAsRead: (chatroomId: string) => Promise<void>;
}

const ChatroomContext = createContext<ChatroomContextType | undefined>(undefined);

export function ChatroomProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChatrooms();
      const subscription = subscribeToMessages();
      
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
    
    return () => {};
  }, [user]);

  const fetchChatrooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chatrooms')
        .select(`
          *,
          messages!inner(
            content,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const chatroomsWithUnread = await Promise.all(
        (data as any[]).map(async (chatroom: any) => {
          const { count } = await supabase
            .from('message_status')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user?.id as string)
            .eq('is_read', false);

          return {
            ...chatroom,
            unread_count: count || 0,
            last_message: chatroom.messages?.[0],
          };
        })
      );

      setChatrooms(chatroomsWithUnread);
    } catch (error) {
      console.error('Error fetching chatrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatroomId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chatroom_id', chatroomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      await markAsRead(chatroomId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    chatroomId: string,
    content: string,
    type: 'text' | 'image' | 'video' | 'audio' = 'text'
  ) => {
    try {
      const { data, error } = await (supabase.from('messages') as any).insert({
        sender_id: user?.id,
        chatroom_id: chatroomId,
        content,
        type,
      }).select().single();

      if (error) throw error;
      
      // Also create message_status for other members
      const { data: members } = await supabase
        .from('chatroom_members')
        .select('user_id')
        .eq('chatroom_id', chatroomId)
        .neq('user_id', user?.id);
      
      if (members && members.length > 0) {
        await (supabase.from('message_status') as any).insert(
          members.map((m: any) => ({
            message_id: data.id,
            user_id: m.user_id,
            is_read: false
          }))
        );
      }

      await fetchMessages(chatroomId);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (chatroomId: string) => {
    try {
      // Get unread messages for this user in this chatroom
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('chatroom_id', chatroomId);
      
      if (unreadMessages && unreadMessages.length > 0) {
        const messageIds = (unreadMessages as any[]).map(m => m.id);
        
        await (supabase
          .from('message_status') as any)
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('user_id', user?.id as string)
          .in('message_id', messageIds)
          .eq('is_read', false);
      }

      await fetchChatrooms();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel('chatroom_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (payload.new) {
            const message = payload.new as Message;
            if (message.sender_id !== user?.id) {
              fetchChatrooms();
              if (message.chatroom_id === messages[0]?.chatroom_id) {
                fetchMessages(message.chatroom_id!);
              }
            }
          }
        }
      )
      .subscribe();
  };

  const value = {
    chatrooms,
    messages,
    loading,
    fetchChatrooms,
    fetchMessages,
    sendMessage,
    markAsRead,
  };

  return <ChatroomContext.Provider value={value}>{children}</ChatroomContext.Provider>;
}

export function useChatroom() {
  const context = useContext(ChatroomContext);
  if (context === undefined) {
    throw new Error('useChatroom must be used within a ChatroomProvider');
  }
  return context;
}