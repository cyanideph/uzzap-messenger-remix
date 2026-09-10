import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('display_name', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.mobile_number?.includes(searchQuery)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const viewProfile = (userId: string) => {
    router.push(`/buddy/${userId}` as any);
  };

  const startChat = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.userItem, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} 
      onPress={() => viewProfile(item.id)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      {item.avatar_url ? (
        <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#333' : '#E1E1E1' }]}>
          <Text style={[styles.avatarInitial, { color: isDark ? '#CCC' : '#555' }]}>
            {item.display_name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
      
      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.displayName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {item.display_name}
        </Text>
        {item.mobile_number && (
          <Text style={[styles.mobileNumber, { color: isDark ? '#BBB' : '#666' }]}>
            {item.mobile_number}
          </Text>
        )}
        
        {item.bio && (
          <Text 
            style={[styles.bio, { color: isDark ? '#BBB' : '#666' }]} 
            numberOfLines={1}
          >
            {item.bio}
          </Text>
        )}
      </View>
      
      {/* Action Button */}
      <TouchableOpacity 
        style={[styles.chatButton, { backgroundColor: '#007AFF' }]}
        onPress={() => startChat(item.id)}
      >
        <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
        <Ionicons name="search" size={20} color={isDark ? '#999' : '#666'} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
          placeholder="Search users..."
          placeholderTextColor={isDark ? '#999' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={isDark ? '#999' : '#666'} />
          </TouchableOpacity>
        )}
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={isDark ? '#FFFFFF' : '#000000'}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="search" 
                size={60} 
                color={isDark ? '#555' : '#CCC'} 
              />
              <Text style={[styles.emptyText, { color: isDark ? '#AAAAAA' : '#666666' }]}>
                {searchQuery.length > 0 ? 'No matching users found' : 'No users found'}
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? '#777777' : '#999999' }]}>
                {searchQuery.length > 0 
                  ? 'Try a different search term'
                  : 'Pull down to refresh the list'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  mobileNumber: {
    fontSize: 14,
    marginBottom: 2,
  },
  bio: {
    fontSize: 14,
  },
  chatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  },
});
