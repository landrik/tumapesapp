import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { store } from './src/store';
import { ThemeProvider } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useNotifications } from './src/hooks/useNotifications';

// Keep the native splash screen visible until the custom font has loaded,
// so there's no flash of the system font swapping to Inter after first
// render. Must be called at module scope, before the component mounts.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AppInner() {
  useNotifications();
  return <RootNavigator />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // If the fonts genuinely fail to load (e.g. corrupted cache), don't
    // leave the app stuck behind the splash screen forever — fall back to
    // the system font rather than blocking startup entirely.
    if (fontError) {
      console.warn('Custom font failed to load, falling back to system font:', fontError);
    }
  }, [fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // native splash screen is still showing
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Provider store={store}>
        <ThemeProvider>
          <SafeAreaProvider>
            <AppInner />
          </SafeAreaProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
