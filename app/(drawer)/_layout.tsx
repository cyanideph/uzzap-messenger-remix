import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContent } from '@/components/DrawerContent';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();

  const getScreenOptions = (icon: string, label: string) => ({
    drawerLabel: label,
    drawerIcon: ({ size, color }: { size: number; color: string }) => (
      <Ionicons name={icon as any} size={size} color={color} />
    ),
    headerStyle: {
      backgroundColor: isDark ? '#121212' : '#FFFFFF',
    },
    headerTintColor: isDark ? '#FFFFFF' : '#000000',
    headerLeft: () => (
      <TouchableOpacity 
        style={{ marginLeft: 16 }}
        onPress={() => {
          // @ts-ignore
          navigation.toggleDrawer();
        }}
      >
        <Ionicons name="menu" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>
    ),
  });

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#007AFF',
        drawerInactiveTintColor: isDark ? '#FFFFFF' : '#000000',
        drawerStyle: {
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={getScreenOptions('chatbubbles-outline', 'Messages')}
      />
      <Drawer.Screen
        name="buddies"
        options={getScreenOptions('people-outline', 'Buddies')}
      />
      <Drawer.Screen
        name="explore"
        options={getScreenOptions('search-outline', 'Explore')}
      />
      <Drawer.Screen
        name="profile"
        options={getScreenOptions('person-outline', 'Profile')}
      />
      <Drawer.Screen
        name="settings"
        options={getScreenOptions('settings-outline', 'Settings')}
      />
    </Drawer>
  );
} 