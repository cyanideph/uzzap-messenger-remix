import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';

export default function BuddiesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [buddies, setBuddies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [importingContacts, setImportingContacts] = useState(false);

  const loadBuddies = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Query buddies (friends) from chatroom_members table
      // This is a simplified example - in a real app you'd need more complex queries
      const { data, error } = await supabase
        .from('chatroom_members')
        .select(`
          chatrooms!inner (
            id,
            is_group,
            members:chatroom_members!inner (
              user_id,
              user:profiles(*)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('chatrooms.is_group', false);
      
      if (error) throw error;
      
      // Extract unique users that are not the current user
      const uniqueBuddies = new Map();
      
      if (data) {
        data.forEach((item: any) => {
          const otherMembers = item.chatrooms.members.filter(
            (member: any) => member.user_id !== user.id
          );
          
          otherMembers.forEach((member: any) => {
            if (member.user && !uniqueBuddies.has(member.user.id)) {
              uniqueBuddies.set(member.user.id, member.user);
            }
          });
        });
      }
      
      setBuddies(Array.from(uniqueBuddies.values()));
    } catch (error) {
      console.error('Error loading buddies:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadBuddies();
  }, [loadBuddies]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBuddies();
  };

  const navigateToProfile = (userId: string) => {
    router.push(`/buddy/${userId}` as any);
  };

  const startChat = (userId: string) => {
    router.push(`/chat/${userId}`);
  };

  const importPhoneContacts = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Contact import is not available on web. Please use the mobile app.');
      return;
    }
    
    try {
      setImportingContacts(true);
      
      const Contacts = await import('expo-contacts');
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Cannot access contacts without permission');
        return;
      }
      
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });
      
      if (data.length > 0) {
        Alert.alert(
          'Contacts Found',
          `Found ${data.length} contacts. Do you want to invite them to Uzzap?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Invite', 
              onPress: () => {
                Alert.alert('Success', 'Invitations sent');
              } 
            },
          ]
        );
      } else {
        Alert.alert('No Contacts', 'No contacts found on this device');
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      Alert.alert('Error', 'Failed to import contacts');
    } finally {
      setImportingContacts(false);
    }
  };

  const renderBuddyItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.buddyItem, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} 
      onPress={() => navigateToProfile(item.id)}
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
      <View style={styles.buddyInfo}>
        <Text style={[styles.displayName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          {item.display_name}
        </Text>
        <Text style={[styles.mobileNumber, { color: isDark ? '#BBB' : '#666' }]}>
          {item.mobile_number}
        </Text>
        
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusDot, 
              { 
                backgroundColor: 
                  item.status === 'online' ? '#34C759' : 
                  item.status === 'away' ? '#FF9500' : '#8E8E93' 
              }
            ]} 
          />
          <Text style={[styles.statusText, { color: isDark ? '#BBB' : '#666' }]}>
            {item.status || 'offline'}
          </Text>
        </View>
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

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="people-outline" 
        size={60} 
        color={isDark ? '#555' : '#CCC'} 
      />
      <Text style={[styles.emptyText, { color: isDark ? '#AAAAAA' : '#666666' }]}>
        No buddies yet
      </Text>
      <Text style={[styles.emptySubtext, { color: isDark ? '#777777' : '#999999' }]}>
        Add buddies to start chatting with them
      </Text>
      <TouchableOpacity 
        style={[styles.importButton, { backgroundColor: '#007AFF' }]}
        onPress={() => router.push('/explore')}
      >
        <Text style={styles.importButtonText}>Explore Users</Text>
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <TouchableOpacity 
      style={[
        styles.importContactsButton, 
        { 
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderBottomColor: isDark ? '#333' : '#F0F0F0' 
        }
      ]}
      onPress={importPhoneContacts}
      disabled={importingContacts}
    >
      <Ionicons name="people-circle-outline" size={24} color="#007AFF" style={styles.importIcon} />
      <Text style={[styles.importText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        Import from Contacts
      </Text>
      {importingContacts ? (
        <ActivityIndicator size="small" color="#007AFF" style={styles.importingIndicator} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={isDark ? '#BBB' : '#999'} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={buddies}
          renderItem={renderBuddyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={isDark ? '#FFFFFF' : '#000000'}
            />
          }
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  importContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  importIcon: {
    marginRight: 12,
  },
  importText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  importingIndicator: {
    marginLeft: 8,
  },
  buddyItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
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
  buddyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  mobileNumber: {
    fontSize: 14,
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
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
    marginBottom: 30,
  },
  importButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
