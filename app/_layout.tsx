import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        setAuthenticated(!!user);
        if (!user) {
          await AsyncStorage.removeItem('userToken');
        }
      }
      setReady(true);
    };
    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session) {
          await AsyncStorage.setItem('userToken', session.access_token);
        }
        if (event === 'SIGNED_OUT') {
          await AsyncStorage.removeItem('userToken');
          setAuthenticated(false);
        }
        if (event === 'SIGNED_IN' && session) {
          await AsyncStorage.setItem('userToken', session.access_token);
          setAuthenticated(true);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const inPublicRoute = ['index', 'login', 'cadastro'].includes(segments[0] as string)
      || segments.length === 0;

    if (!authenticated && !inPublicRoute) {
      router.replace('/login');
    }
  }, [ready, authenticated, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="cadastro" />
      <Stack.Screen name="mapa" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="retirada" />
      <Stack.Screen name="doacao" />
      <Stack.Screen name="reclame" />
    </Stack>
  );
}
