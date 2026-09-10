import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { RegionsProvider } from '@/contexts/RegionsContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ChatroomProvider } from '@/contexts/ChatroomContext';
import { MessageProvider } from '@/contexts/MessageContext';
import { BuddyProvider } from '@/contexts/BuddyContext';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <RegionsProvider>
            <SettingsProvider>
              <ChatroomProvider>
                <MessageProvider>
                  <BuddyProvider>
                    <Stack>
                      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                      <Stack.Screen name="chatroom/[id]" options={{ headerShown: false }} />
                      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
                      <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
                      <Stack.Screen name="help" options={{ headerShown: false }} />
                      <Stack.Screen name="regions" options={{ headerShown: false }} />
                    </Stack>
                  </BuddyProvider>
                </MessageProvider>
              </ChatroomProvider>
            </SettingsProvider>
          </RegionsProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
