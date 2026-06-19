import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEM_TYPES = [
  { label: 'Absorvente externo', value: 'pad' },
  { label: 'Absorvente interno', value: 'tampon' },
  { label: 'Calcinha absorvente', value: 'panty_liner' },
];

export default function RetiradaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pointId = params.point_id as string;
  const siglaPonto = params.sigla as string || 'Ponto';
  const qtd = Number(params.qtd) || 0;

  const [itemType, setItemType] = useState<string>('pad');
  const [loading, setLoading] = useState(false);

  const handleConfirmarRetirada = async () => {
    if (qtd < 1) {
      Alert.alert('Aviso', 'Este ponto está sem estoque no momento.');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/transactions/withdrawal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ point_id: pointId, item_type: itemType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Erro na retirada.');
      Alert.alert('Retirada Confirmada', data.message, [{ text: 'OK', onPress: () => router.push('/mapa') }]);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Retirada — {siglaPonto}</Text>

        <View style={styles.confirmationCard}>
          <Image source={require('../assets/images/Mulher 1.png')} style={{ width: 220, height: 220 }} resizeMode="contain" />
          <Text style={styles.stockText}>Estoque disponível: {qtd}</Text>
          <Text style={styles.confirmationText}>
            Você confirma a retirada de 1 item deste ponto? O limite é de um item por dia.
          </Text>
        </View>

        <Text style={styles.selectorLabel}>Tipo de item:</Text>
        <View style={styles.selectorRow}>
          {ITEM_TYPES.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[styles.selectorBtn, itemType === item.value && styles.selectorBtnActive]}
              onPress={() => setItemType(item.value)}
            >
              <Text style={[styles.selectorBtnText, itemType === item.value && styles.selectorBtnTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.btnOutline} onPress={() => router.back()}>
            <Text style={styles.btnOutlineText}>Não, cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPurple} onPress={handleConfirmarRetirada} disabled={loading}>
            <Text style={styles.btnPurpleText}>{loading ? 'Aguarde...' : 'Sim, confirmar'}</Text>
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#3B0059', marginBottom: 16 },
  confirmationCard: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 5, marginBottom: 20 },
  stockText: { fontSize: 16, fontWeight: 'bold', color: '#D147A3', marginBottom: 8 },
  confirmationText: { fontSize: 15, color: '#3B0059', textAlign: 'center', fontWeight: '600', lineHeight: 22 },
  selectorLabel: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '700', color: '#3B0059', marginBottom: 8 },
  selectorRow: { width: '100%', gap: 8, marginBottom: 20 },
  selectorBtn: { padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#9E66C3', backgroundColor: 'transparent' },
  selectorBtnActive: { backgroundColor: '#9E66C3' },
  selectorBtnText: { color: '#9E66C3', fontWeight: '600', textAlign: 'center' },
  selectorBtnTextActive: { color: '#FFFFFF' },
  buttonGroup: { width: '100%', gap: 12 },
  btnPurple: { backgroundColor: '#3B0059', width: '100%', height: 52, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  btnPurpleText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnOutline: { width: '100%', height: 52, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#3B0059' },
  btnOutlineText: { color: '#3B0059', fontSize: 16, fontWeight: '700' },
});
