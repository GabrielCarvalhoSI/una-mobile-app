import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          router.replace('/mapa');
          return;
        }
        await AsyncStorage.removeItem('userToken');
      }
      setChecking(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        })
      ]).start();
    };
    checkAuth();
  }, []);

  if (checking) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3B0059" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/una.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Animated.View style={[styles.buttonGroup, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={styles.btnWhite} onPress={() => router.push('/login')}>
          <Text style={styles.btnWhiteText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnWhite} onPress={() => router.push('/cadastro')}>
          <Text style={styles.btnWhiteText}>Cadastrar/Registrar Conta</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1BED5',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 180,
  },
  buttonGroup: {
    width: '100%',
    gap: 15,
  },
  btnWhite: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWhiteText: {
    color: '#3B0059',
    fontSize: 16,
    fontWeight: '700',
  },
});