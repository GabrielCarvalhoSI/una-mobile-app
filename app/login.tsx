import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const formFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(formFadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/una.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Animated.View style={[styles.formContainer, { opacity: formFadeAnim }]}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Usuário</Text>
          <TextInput 
            style={styles.input} 
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput 
            style={styles.input} 
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.btnPurple} onPress={() => router.push('/mapa')}>
          <Text style={styles.btnPurpleText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1BED5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 32,
    color: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: -60,
  },
  logo: {
    width: 150,
    height: 130,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    color: '#3B0059',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  btnPurple: {
    backgroundColor: '#3B0059',
    width: 200,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  btnPurpleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  forgotPassword: {
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#3B0059',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});