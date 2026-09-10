import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRegions } from '@/contexts/RegionsContext';
import { getSettings } from '@/lib/supabase';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { regions, provinces, fetchRegions, fetchProvinces } = useRegions();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    if (user) {
      try {
        const data = await getSettings(user.id);
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchRegions();
    
    if (profile?.region_id) {
      fetchProvinces(profile.region_id);
    }
    
    loadSettings();
  }, [user, profile, fetchRegions, fetchProvinces, loadSettings]);

  const getRegionName = () => {
    if (!profile?.region_id || !regions) return 'Not set';
    const region = regions.find(r => r.id === profile.region_id);
    return region?.name || 'Not found';
  };

  const getProvinceName = () => {
    if (!profile?.province_id || !profile?.region_id || !provinces) return 'Not set';
    const provinceList = provinces[profile.region_id];
    if (!provinceList) return 'Not found';
    const province = provinceList.find(p => p.id === profile.province_id);
    return province?.name || 'Not found';
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileHeader, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderBottomColor: isDark ? '#333' : '#E5E5E5' }]}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? '#333' : '#E1E1E1' }]}>
                <Text style={[styles.avatarInitial, { color: isDark ? '#CCC' : '#555' }]}>
                  {profile?.display_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={[styles.displayName, { color: isDark ? '#FFFFFF' : '#333' }]}>
              {profile?.display_name || 'User'}
            </Text>
            <Text style={[styles.mobileNumber, { color: isDark ? '#BBB' : '#666' }]}>
              {profile?.mobile_number || 'No mobile number'}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: profile?.status === 'online' ? '#34C759' : profile?.status === 'away' ? '#FF9500' : '#8E8E93' }]} />
              <Text style={[styles.statusText, { color: isDark ? '#AAA' : '#8E8E93' }]}>
                {profile?.status || 'offline'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }]} 
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={[styles.sectionContainer, { borderTopColor: isDark ? '#333' : '#E5E5E5', borderBottomColor: isDark ? '#333' : '#E5E5E5', backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333' }]}>
            Account Information
          </Text>
          <View style={[styles.infoItem, { borderBottomColor: isDark ? '#333' : '#F0F0F0' }]}>
            <Ionicons name="mail-outline" size={20} color={isDark ? '#AAA' : '#666'} style={styles.infoIcon} />
            <Text style={[styles.infoLabel, { color: isDark ? '#BBB' : '#666' }]}>Email</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333' }]}>
              {user?.email || 'No email'}
            </Text>
          </View>
          <View style={[styles.infoItem, { borderBottomColor: isDark ? '#333' : '#F0F0F0' }]}>
            <Ionicons name="location-outline" size={20} color={isDark ? '#AAA' : '#666'} style={styles.infoIcon} />
            <Text style={[styles.infoLabel, { color: isDark ? '#BBB' : '#666' }]}>Region</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333' }]}>
              {getRegionName()}
            </Text>
          </View>
          <View style={[styles.infoItem, { borderBottomColor: isDark ? '#333' : '#F0F0F0' }]}>
            <Ionicons name="map-outline" size={20} color={isDark ? '#AAA' : '#666'} style={styles.infoIcon} />
            <Text style={[styles.infoLabel, { color: isDark ? '#BBB' : '#666' }]}>Province</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333' }]}>
              {getProvinceName()}
            </Text>
          </View>
        </View>

        <View style={[styles.sectionContainer, { borderTopColor: isDark ? '#333' : '#E5E5E5', borderBottomColor: isDark ? '#333' : '#E5E5E5', backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#333' }]}>
            Privacy & Security
          </Text>
          <View style={[styles.infoItem, { borderBottomColor: isDark ? '#333' : '#F0F0F0' }]}>
            <Ionicons name="eye-outline" size={20} color={isDark ? '#AAA' : '#666'} style={styles.infoIcon} />
            <Text style={[styles.infoLabel, { color: isDark ? '#BBB' : '#666' }]}>Visibility</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333' }]}>
              {settings?.visibility || 'Public'}
            </Text>
          </View>
          <View style={[styles.infoItem, { borderBottomColor: isDark ? '#333' : '#F0F0F0' }]}>
            <Ionicons name="notifications-outline" size={20} color={isDark ? '#AAA' : '#666'} style={styles.infoIcon} />
            <Text style={[styles.infoLabel, { color: isDark ? '#BBB' : '#666' }]}>Notifications</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#FFFFFF' : '#333' }]}>
              {settings?.notifications_enabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]} 
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={styles.signOutIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    position: 'relative',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mobileNumber: {
    fontSize: 16,
    marginBottom: 6,
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
    fontSize: 14,
    textTransform: 'capitalize',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    width: 100,
    fontSize: 16,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  signOutIcon: {
    marginRight: 10,
  },
  signOutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});
