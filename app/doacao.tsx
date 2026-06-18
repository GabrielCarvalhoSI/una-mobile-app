import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function RetiradaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Recebe os mocks passados pela tela da lista
  const siglaPonto = params.sigla || 'CIn';
  const [estoque, setEstoque] = useState(Number(params.qtd) || 15);

  const handleConfirmarRetirada = () => {
    if (estoque > 0) {
      setEstoque(estoque - 1);
      Alert.alert("Retirada Confirmada", "Você retirou 1 item com sucesso. O estoque do ponto foi atualizado.", [
        { text: "OK", onPress: () => router.push('/mapa') }
      ]);
    } else {
      Alert.alert("Aviso", "Este ponto está sem estoque no momento.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Retirada - {siglaPonto}</Text>
        
        <View style={styles.confirmationCard}>
          <View style={styles.svgContainer}>
            <Image source={require('../assets/images/Mulher 1.png')} style={{ width: 250, height: 250 }} resizeMode="contain" />
          </View>
          <Text style={styles.stockText}>Estoque atual: {estoque}</Text>
          <Text style={styles.confirmationText}>
            Você confirma a retirada de 1 item deste ponto? O limite é de um item por vez.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.btnOutline} onPress={() => router.back()}>
            <Text style={styles.btnOutlineText}>Não, cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPurple} onPress={handleConfirmarRetirada}>
            <Text style={styles.btnPurpleText}>Sim, confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D1BED5', paddingHorizontal: 25, paddingTop: 60 },
  backButton: { padding: 10, alignSelf: 'flex-start', marginBottom: 5 },
  backButtonText: { fontSize: 32, color: '#3B0059', fontWeight: '300' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#3B0059', marginBottom: 20 },
  confirmationCard: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 5, marginBottom: 30 },
  svgContainer: { marginBottom: 15, alignItems: 'center', justifyContent: 'center' },
  stockText: { fontSize: 18, fontWeight: 'bold', color: '#D147A3', marginBottom: 10 },
  confirmationText: { fontSize: 16, color: '#3B0059', textAlign: 'center', fontWeight: '600', lineHeight: 24 },
  buttonGroup: { width: '100%', gap: 15 },
  btnPurple: { backgroundColor: '#3B0059', width: '100%', height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  btnPurpleText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnOutline: { backgroundColor: 'transparent', width: '100%', height: 55, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#3B0059' },
  btnOutlineText: { color: '#3B0059', fontSize: 16, fontWeight: '700' }
});