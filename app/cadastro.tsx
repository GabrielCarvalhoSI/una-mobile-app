import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Image, Alert } from 'react-native';
import { router } from 'expo-router';

export default function CadastroScreen() {
  // Estados para capturar os dados do formulário
  const [apelido, setApelido] = useState('');
  const [pronome, setPronome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [termosAceitos, setTermosAceitos] = useState(false);

  // Função que será chamada ao clicar em Finalizar
  const handleCadastro = async () => {
    if (!apelido || !pronome || !dataNascimento || !email || !senha || !confirmaSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmaSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (!termosAceitos) {
      Alert.alert('Erro', 'Você precisa aceitar os termos de uso.');
      return;
    }

    const dadosCadastro = {
      nome: apelido,
      pronome,
      data_nascimento: dataNascimento,
      email,
      senha,
    };

    console.log('Dados prontos para o backend:', dadosCadastro);
    
    // O desenvolvedor do backend só precisará inserir a chamada fetch/axios aqui.
    // Exemplo: await api.post('/usuarios', dadosCadastro);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Image 
          source={require('../assets/images/una.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>

      {/* Formulário */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Precisamos de algumas informações</Text>

        <Text style={styles.label}>Seu Apelido</Text>
        <TextInput style={styles.input} value={apelido} onChangeText={setApelido} />

        <Text style={styles.label}>Pronome</Text>
        <TextInput style={styles.input} value={pronome} onChangeText={setPronome} />

        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput style={styles.input} value={dataNascimento} onChangeText={setDataNascimento} placeholder="DD/MM/AAAA" />

        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" 
          autoCapitalize="none" 
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />

        <Text style={styles.label}>Confirmação da senha</Text>
        <TextInput style={styles.input} value={confirmaSenha} onChangeText={setConfirmaSenha} secureTextEntry />
      </View>

      {/* Termos de uso e Botão */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.termsContainer} 
          onPress={() => setTermosAceitos(!termosAceitos)}
        >
          <View style={[styles.checkbox, termosAceitos && styles.checkboxChecked]} />
          <Text style={styles.termsText}>Li e concordo com os termos de uso</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CDB4DB',
    paddingHorizontal: 24,
    paddingTop: 48,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    fontSize: 32,
    color: '#FFF',
  },
  logo: {
    width: 40,
    height: 40,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A154B',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A154B',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFF',
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  footer: {
    paddingBottom: 24,
    marginTop: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4A154B',
    marginRight: 10,
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: '#4A154B',
  },
  termsText: {
    fontSize: 14,
    color: '#4A154B',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#3C0945',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});