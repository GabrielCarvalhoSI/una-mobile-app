import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro de autenticação.');
      }

      // Armazena o token de sessão para uso nas próximas requisições
      await AsyncStorage.setItem('userToken', data.access_token);
      router.push('/mapa');

    } catch (error: any) {
      Alert.alert('Erro no Login', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/una.png')} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Bem-vinda de volta!</Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.btnLogin} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnLoginText}>{loading ? 'Aguarde...' : 'Entrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/cadastro')}>
          <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF', justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 120, height: 60 },
  formContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 15, elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#3B0059', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#F0E6F2', borderRadius: 10, padding: 15, marginBottom: 15, fontSize: 16, color: '#3B0059' },
  btnLogin: { backgroundColor: '#3B0059', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  btnLoginText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#D147A3', textAlign: 'center', fontWeight: '600', fontSize: 14 }
});