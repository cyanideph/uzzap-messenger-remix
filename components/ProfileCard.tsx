import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export const ProfileCard = () => {
  const { profile } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    router.push('/profile');
  };

  if (!profile) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      {profile.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#333' : '#E0E0E0' }]}>
          <Text style={[styles.avatarText, { color: isDark ? '#CCC' : '#555' }]}>
            {profile.display_name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
      )}

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.displayName, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
          {profile.display_name || 'User'}
        </Text>
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusDot, 
              { 
                backgroundColor: 
                  profile.status === 'online' ? '#34C759' : 
                  profile.status === 'away' ? '#FF9500' : '#8E8E93' 
              }
            ]} 
          />
          <Text style={[styles.statusText, { color: isDark ? '#BBB' : '#666' }]}>
            {profile.status || 'offline'}
          </Text>
        </View>
      </View>

      {/* Edit Button */}
      <Ionicons 
        name="chevron-forward" 
        size={16} 
        color={isDark ? '#999' : '#666'} 
        style={styles.icon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  displayName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  icon: {
    marginLeft: 4,
  },
}); 