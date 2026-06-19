import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert, Image, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ITEM_TYPES = [
  { label: 'Absorvente externo', value: 'pad' },
  { label: 'Absorvente interno', value: 'tampon' },
  { label: 'Calcinha absorvente', value: 'panty_liner' },
];

export default function DoacaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pointId = params.point_id as string;
  const siglaPonto = params.sigla as string || 'Ponto';

  const [itemType, setItemType] = useState<string>('pad');
  const [quantidade, setQuantidade] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleConfirmarDoacao = async () => {
    const qty = parseInt(quantidade, 10);
    if (!qty || qty < 1) {
      Alert.alert('Aviso', 'Informe uma quantidade válida.');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) { router.replace('/login'); return; }
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/transactions/donation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ point_id: pointId, item_type: itemType, quantity: qty }),
      });
      if (response.status === 401) {
        await AsyncStorage.removeItem('userToken');
        router.replace('/login');
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Erro na doação.');
      Alert.alert('Doação Confirmada', data.message, [{ text: 'OK', onPress: () => router.replace('/mapa') }]);
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
        <Text style={styles.title}>Doação — {siglaPonto}</Text>

        <View style={styles.confirmationCard}>
          <Image source={require('../assets/images/Mulher 2.png')} style={{ width: 200, height: 200 }} resizeMode="contain" />
          <Text style={styles.confirmationText}>
            Obrigada pela sua doação! Preencha abaixo o que você está doando.
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

        <Text style={styles.selectorLabel}>Quantidade:</Text>
        <TextInput
          style={styles.inputQtd}
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="number-pad"
          maxLength={3}
        />

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.btnOutline} onPress={() => router.back()}>
            <Text style={styles.btnOutlineText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPink} onPress={handleConfirmarDoacao} disabled={loading}>
            <Text style={styles.btnPinkText}>{loading ? 'Aguarde...' : 'Confirmar doação'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF', paddingHorizontal: 25, paddingTop: 60 },
  backButton: { padding: 10, alignSelf: 'flex-start', marginBottom: 5 },
  backButtonText: { fontSize: 32, color: '#3B0059', fontWeight: '300' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#3B0059', marginBottom: 16 },
  confirmationCard: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 5, marginBottom: 20 },
  confirmationText: { fontSize: 15, color: '#3B0059', textAlign: 'center', fontWeight: '500', lineHeight: 22 },
  selectorLabel: { alignSelf: 'flex-start', fontSize: 14, fontWeight: '700', color: '#3B0059', marginBottom: 8 },
  selectorRow: { width: '100%', gap: 8, marginBottom: 16 },
  selectorBtn: { padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#D147A3', backgroundColor: 'transparent' },
  selectorBtnActive: { backgroundColor: '#D147A3' },
  selectorBtnText: { color: '#D147A3', fontWeight: '600', textAlign: 'center' },
  selectorBtnTextActive: { color: '#FFFFFF' },
  inputQtd: { width: '100%', backgroundColor: '#F0E6F2', borderRadius: 12, padding: 14, fontSize: 18, textAlign: 'center', color: '#3B0059', marginBottom: 20 },
  buttonGroup: { width: '100%', gap: 12 },
  btnPink: { backgroundColor: '#D147A3', width: '100%', height: 52, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  btnPinkText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnOutline: { width: '100%', height: 52, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#3B0059' },
  btnOutlineText: { color: '#3B0059', fontSize: 16, fontWeight: '700' },
});
