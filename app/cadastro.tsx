import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export default function CadastroScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: nome }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Erro ao cadastrar.');

      await AsyncStorage.setItem('userToken', data.access_token);
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token ?? '',
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso!', [{ text: 'OK', onPress: () => router.push('/mapa') }]);
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.message);
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
        <Text style={styles.title}>Crie sua conta</Text>
        <TextInput style={styles.input} placeholder="Nome Completo" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="E-mail" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.btnRegister} onPress={handleCadastro} disabled={loading}>
          <Text style={styles.btnRegisterText}>{loading ? 'Criando...' : 'Cadastrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Já tem conta? Faça Login</Text>
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
  btnRegister: { backgroundColor: '#D147A3', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  btnRegisterText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#3B0059', textAlign: 'center', fontWeight: '600', fontSize: 14 }
});