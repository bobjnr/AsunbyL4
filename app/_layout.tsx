import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import 'react-native-reanimated';
import { CartProvider } from './menu/cartcontext';
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './auth/authContext';
import { Colors } from '@/constants/Colors';
import StripeProviderWrapper from '../app/components/stripeprovider';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().then(() => {
        // Always navigate to onboarding when app starts
        router.replace('/onboarding');
      });
    }
  }, [loaded]);

  if (!loaded) {
    return <View />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <StripeProviderWrapper>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack 
              screenOptions={{
                headerShown: false,
                // Incorporating relevant tab configuration
                contentStyle: Platform.select({
                  ios: {
                    // Preserve iOS-specific styling if needed
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                  },
                  default: {
                    backgroundColor: Colors[colorScheme ?? 'light'].background,
                  },
                }),
              }}
            >
              <Stack.Screen 
                name="onboarding"
                options={{ 
                  animation: 'fade',
                }} 
              />
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  animation: 'none',
                }} 
              />
              <Stack.Screen 
                name="auth/login" 
                options={{ 
                  animation: 'slide_from_right',
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="auth/signup" 
                options={{ 
                  animation: 'slide_from_right',
                  headerShown: false,
                }} 
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
          <Toast />
        </StripeProviderWrapper>
      </CartProvider>
    </AuthProvider>
  );
}