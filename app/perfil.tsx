import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  StatusBar,
  Animated,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Cabeçalho com Botão Voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Image 
          source={require('../assets/images/una.png')} 
          style={styles.miniLogo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.title}>Minhas Informações</Text>

          {/* Card de Informações */}
          <View style={styles.infoCard}>
            <View style={styles.infoGroup}>
              <Text style={styles.label}>Nome</Text>
              <Text style={styles.value}>Maria Silva</Text>
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>Pronome</Text>
              <Text style={styles.value}>Ela/Dela</Text>
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <Text style={styles.value}>15/05/1998</Text>
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>E-mail</Text>
              <Text style={styles.value}>maria.silva@email.com</Text>
            </View>
          </View>

          {/* Botão Editar (FM05 planejado) */}
          <TouchableOpacity 
            style={styles.btnPurple}
            onPress={() => alert('Funcionalidade de edição em desenvolvimento (FM05)')}
          >
            <Text style={styles.btnPurpleText}>Editar Perfil</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1BED5', // Fundo lavanda padrão
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 10,
  },
  backButtonText: {
    fontSize: 32,
    color: '#3B0059',
  },
  miniLogo: {
    width: 100,
    height: 80,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B0059',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#3B0059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },
  infoGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6F2',
    paddingBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#8A6E91',
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    color: '#3B0059',
    fontWeight: '500',
  },
  btnPurple: {
    backgroundColor: '#3B0059',
    width: '100%',
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnPurpleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});