import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform, Alert, FlatList, Modal, Linking, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Point {
  id: string;
  sigla: string;
  nome: string;
  latitude: number;
  longitude: number;
  qtd: number;
  endereco: string;
  foto?: string;
}

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export default function ListScreen() {
  const router = useRouter();
  const [points, setPoints] = useState<Point[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [sortOrder, setSortOrder] = useState<'distancia' | 'alfabetica'>('alfabetica');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [showNavModal, setShowNavModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        router.replace('/login');
        return;
      }
      const coords = location?.coords;
      const query = coords ? `?lat=${coords.latitude}&lng=${coords.longitude}` : '';
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/collection-points${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 401) {
        await AsyncStorage.removeItem('userToken');
        router.replace('/login');
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao buscar pontos.');
      const formatted = data.map((pt: any) => ({
        ...pt,
        endereco: [pt.campus, pt.floor, pt.room].filter(Boolean).join(' — ') || pt.nome,
        foto: 'https://via.placeholder.com/150/D147A3/FFFFFF',
      }));
      setPoints(formatted);
    } catch {
      Alert.alert('Erro', 'Falha ao buscar os pontos de coleta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPoints(); }, []);

  const handleEnableLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Aviso', 'Permissão de localização negada.');
        return false;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      return true;
    } catch (error) { return false; }
  };

  const sortedPoints = useMemo(() => {
    let list = [...points];
    if (sortOrder === 'distancia' && location) {
      list.sort((a, b) => getDistanceInKm(location.coords.latitude, location.coords.longitude, a.latitude, a.longitude) - getDistanceInKm(location.coords.latitude, location.coords.longitude, b.latitude, b.longitude));
    } else {
      list.sort((a, b) => a.sigla.localeCompare(b.sigla));
    }
    return list;
  }, [points, sortOrder, location]);

  const renderDistance = (lat: number, lng: number) => {
    if (!location) return null;
    const dist = getDistanceInKm(location.coords.latitude, location.coords.longitude, lat, lng);
    return dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={{ width: 40 }} /> 
        <Image source={require('../assets/images/una.png')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/perfil')}>
          <Text style={styles.profileIconText}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
        <Text style={styles.controlsLabel}>Pontos de Coleta</Text>
        <View style={styles.controlsActions}>
          {!location && (
            <TouchableOpacity style={styles.locBtn} onPress={handleEnableLocation}>
              <Text style={styles.locBtnText}>📍 Ativar GPS</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.selectButton} onPress={() => setShowSortModal(true)}>
            <Text style={styles.selectButtonText}>
              {sortOrder === 'distancia' ? 'Mais próximos' : 'Alfabética'} ▾
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedPoints}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchPoints}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cardItem} onPress={() => setSelectedPoint(item)}>
            <Image source={{ uri: item.foto }} style={styles.cardImage} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.sigla}</Text>
              <Text style={styles.cardAddress}>{item.endereco}</Text>
              {location && <Text style={styles.cardDistance}>📍 A {renderDistance(item.latitude, item.longitude)}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedPoint && !showNavModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalBox}>
            {selectedPoint && (
              <>
                <Text style={styles.detailsTitle}>{selectedPoint.sigla}</Text>
                <Text style={styles.detailsAddress}>{selectedPoint.endereco}</Text>
                <Text style={styles.detailsQtd}>Estoque: {selectedPoint.qtd}</Text>
                <View style={styles.detailsActionRow}>
                  <TouchableOpacity style={styles.btnAction} onPress={() => { const p = selectedPoint; setSelectedPoint(null); router.push(`/retirada?point_id=${p!.id}&sigla=${p!.sigla}&qtd=${p!.qtd}`); }}>
                    <Text style={styles.btnActionText}>Retirar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnAction} onPress={() => { const p = selectedPoint; setSelectedPoint(null); router.push(`/doacao?point_id=${p!.id}&sigla=${p!.sigla}`); }}>
                    <Text style={styles.btnActionText}>Doar</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.btnClose} onPress={() => setSelectedPoint(null)}>
                  <Text style={styles.btnCloseText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Ordenação */}
      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.sortModalBox}>
            <TouchableOpacity style={styles.sortOption} onPress={() => { setSortOrder('alfabetica'); setShowSortModal(false); }}>
              <Text style={styles.sortOptionText}>Ordem Alfabética</Text>
            </TouchableOpacity>
            {location && (
              <TouchableOpacity style={styles.sortOption} onPress={() => { setSortOrder('distancia'); setShowSortModal(false); }}>
                <Text style={styles.sortOptionText}>Mais próximos</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF' },
  header: { height: Platform.OS === 'ios' ? 100 : 80, paddingTop: Platform.OS === 'ios' ? 40 : 30, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0E6F2' },
  logo: { width: 80, height: 40 },
  profileIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0E6F2', alignItems: 'center', justifyContent: 'center' },
  profileIconText: { fontSize: 20 },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E6D4EA' },
  controlsLabel: { fontSize: 18, fontWeight: 'bold', color: '#3B0059' },
  controlsActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  locBtn: { backgroundColor: '#E65C9C', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  locBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  selectButton: { backgroundColor: '#F0E6F2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  selectButtonText: { color: '#5D2689', fontWeight: '600', fontSize: 14 },
  listContent: { padding: 15, paddingBottom: 40 },
  cardItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3 },
  cardImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#3B0059', marginBottom: 5 },
  cardAddress: { fontSize: 13, color: '#8A6E91', marginBottom: 5 },
  cardDistance: { fontSize: 13, fontWeight: 'bold', color: '#D147A3' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  sortModalBox: { backgroundColor: '#FFFFFF', width: 250, borderRadius: 15, padding: 10, elevation: 5 },
  sortOption: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0E6F2' },
  sortOptionText: { fontSize: 16, color: '#3B0059', textAlign: 'center', fontWeight: '500' },
  detailsModalBox: { width: '85%', backgroundColor: '#FFFFFF', borderRadius: 25, padding: 25, alignItems: 'center', elevation: 10 },
  detailsTitle: { fontSize: 22, fontWeight: 'bold', color: '#3B0059', marginBottom: 5 },
  detailsAddress: { fontSize: 14, color: '#8A6E91', textAlign: 'center', marginBottom: 15 },
  detailsQtd: { fontSize: 18, fontWeight: 'bold', color: '#D147A3', marginBottom: 25 },
  detailsActionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  btnAction: { flex: 1, backgroundColor: '#5D2689', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  btnActionText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  btnClose: { paddingVertical: 10 },
  btnCloseText: { color: '#8A6E91', fontSize: 16, fontWeight: '600' }
});