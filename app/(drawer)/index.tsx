import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useMessageContext } from '@/contexts/MessageContext';
import { format } from 'date-fns';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function MessagesScreen() {
  const { user } = useAuth();
  const { getChatrooms } = useMessageContext();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [chatrooms, setChatrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChatrooms = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data } = await getChatrooms(user.id);
      
      const formattedChatrooms = data.map((item: any) => {
        const chatroom = item.chatrooms;
        const lastMessage = chatroom.messages[0] || {};
        
        return {
          id: chatroom.id,
          name: chatroom.name || 'Chat Room',
          lastMessage: lastMessage.content || 'No messages yet',
          lastMessageTime: lastMessage.created_at ? 
            format(new Date(lastMessage.created_at), 'h:mm a') : '',
          isGroup: chatroom.is_group,
          unreadCount: Math.floor(Math.random() * 5), // Placeholder for unread count
        };
      });
      
      setChatrooms(formattedChatrooms);
    } catch (error) {
      console.error('Error loading chatrooms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, getChatrooms]);

  useEffect(() => {
    loadChatrooms();
  }, [loadChatrooms]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadChatrooms();
  };

  const navigateToChat = (chatroomId: string) => {
    router.push(`/chat/${chatroomId}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.chatroomItem, 
        { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }
      ]} 
      onPress={() => navigateToChat(item.id)}
    >
      <View style={styles.avatar}>
        {item.isGroup ? (
          <View style={[styles.groupAvatar, { backgroundColor: isDark ? '#333' : '#E1E1E1' }]}>
            <Ionicons name="people" size={24} color={isDark ? '#CCC' : '#666'} />
          </View>
        ) : (
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }}
            style={styles.avatarImage}
          />
        )}
      </View>
      
      <View style={styles.chatroomInfo}>
        <View style={styles.chatroomHeader}>
          <Text style={[styles.chatroomName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {item.name}
          </Text>
          <Text style={styles.timestamp}>{item.lastMessageTime}</Text>
        </View>
        
        <View style={styles.messagePreview}>
          <Text 
            style={[styles.lastMessage, { color: isDark ? '#BBBBBB' : '#666666' }]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="chatbubbles-outline" 
        size={60} 
        color={isDark ? '#555' : '#CCC'} 
      />
      <Text style={[styles.emptyText, { color: isDark ? '#AAAAAA' : '#666666' }]}>
        No messages yet
      </Text>
      <Text style={[styles.emptySubtext, { color: isDark ? '#777777' : '#999999' }]}>
        Start a conversation with your buddies
      </Text>
      <TouchableOpacity 
        style={[styles.newChatButton, { backgroundColor: '#007AFF' }]}
        onPress={() => router.push('/buddies')}
      >
        <Text style={styles.newChatButtonText}>Start New Chat</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
      <FlatList
        data={chatrooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={isDark ? '#FFFFFF' : '#000000'}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/buddies')}
      >
        <Ionicons name="create-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  chatroomItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  avatar: {
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  groupAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatroomInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatroomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  chatroomName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  newChatButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
