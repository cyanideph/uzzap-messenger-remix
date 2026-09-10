import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ProfileCard } from './ProfileCard';

type DrawerItemType = {
  icon: string;
  label: string;
  route: string;
  badge?: number;
};

export function DrawerContent(props: any) {
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const pathname = usePathname();

  const drawerItems: DrawerItemType[] = [
    {
      icon: 'chatbubbles-outline',
      label: 'Messages',
      route: '/',
      badge: 4,
    },
    {
      icon: 'people-outline',
      label: 'Buddies',
      route: '/buddies',
    },
    {
      icon: 'search-outline',
      label: 'Explore',
      route: '/explore',
    },
    {
      icon: 'person-outline',
      label: 'Profile',
      route: '/profile',
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      route: '/settings',
    },
    {
      icon: 'help-circle-outline',
      label: 'Help',
      route: '/help',
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)');
  };

  const isActiveRoute = (route: string) => {
    if (route === '/' && pathname === '/') return true;
    return pathname === route || 
      (route !== '/' && pathname.startsWith(route));
  };

  return (
    <DrawerContentScrollView 
      {...props}
      contentContainerStyle={{ flex: 1 }}
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F7F7F7' }]}
    >
      <View style={styles.drawerContent}>
        {/* Profile Card */}
        <ProfileCard />

        {/* Drawer Items */}
        <ScrollView style={styles.drawerItems}>
          {drawerItems.map((item, index) => (
            <DrawerItem
              key={index}
              icon={({ color, size }) => (
                <View style={styles.drawerItemIconContainer}>
                  <Ionicons name={item.icon as any} color={color} size={size} />
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
              )}
              label={item.label}
              onPress={() => router.push(item.route as any)}
              activeBackgroundColor={isDark ? '#333' : '#E3F2FD'}
              activeTintColor="#007AFF"
              inactiveTintColor={isDark ? '#FFFFFF' : '#212121'}
              focused={isActiveRoute(item.route)}
              style={styles.drawerItem}
              labelStyle={[
                styles.drawerItemLabel,
                isActiveRoute(item.route) && styles.activeDrawerItemLabel
              ]}
            />
          ))}
        </ScrollView>

        {/* Sign Out Button */}
        <View style={[styles.bottomSection, { borderTopColor: isDark ? '#333' : '#E0E0E0' }]}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={styles.appVersion}>App Version 1.0.0</Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  drawerItems: {
    flex: 1,
    marginTop: 10,
  },
  drawerItem: {
    borderRadius: 0,
  },
  drawerItemIconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  drawerItemLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeDrawerItemLabel: {
    fontWeight: '700',
  },
  bottomSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  signOutText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#FF3B30',
    fontWeight: '500',
  },
  appVersion: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 10,
  },
}); 