import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nome } }
    });
    setLoading(false);

    if (error) {
      Alert.alert('Erro no Cadastro', error.message);
    } else {
      Alert.alert('Sucesso', 'Conta criada com sucesso!', [{ text: 'OK', onPress: () => router.push('/login') }]);
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