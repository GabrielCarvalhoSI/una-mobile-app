import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Platform,
  Alert,
  FlatList,
  Modal,
  Linking,
  StatusBar
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

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

interface NavApp {
  id: string;
  name: string;
  url: string;
}

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
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
  const [availableNavApps, setAvailableNavApps] = useState<NavApp[]>([]);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/points`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setPoints(data);
    } catch (error) {
      setPoints([
        { id: '1', sigla: 'CIn', nome: 'Centro de Informática', latitude: -8.0558, longitude: -34.9515, qtd: 15, endereco: 'Av. Jorn. Aníbal Fernandes, s/n' },
        { id: '2', sigla: 'CAC', nome: 'Centro de Artes e Comunicação', latitude: -8.0532, longitude: -34.9518, qtd: 10, endereco: 'Av. da Arquitetura, s/n' },
        { id: '3', sigla: 'CCSA', nome: 'Centro de Ciências Soc. Aplicadas', latitude: -8.0515, longitude: -34.9505, qtd: 5, endereco: 'Av. dos Funcionários, s/n' },
        { id: '4', sigla: 'CFCH', nome: 'Centro de Filosofia e Ciências Hum.', latitude: -8.0525, longitude: -34.9535, qtd: 0, endereco: 'Av. da Arquitetura, s/n' },
        { id: '5', sigla: 'CCEN', nome: 'Centro de Ciências Exatas e da Natureza', latitude: -8.0522, longitude: -34.9510, qtd: 8, endereco: 'Av. Jorn. Aníbal Fernandes, s/n' },
        { id: '6', sigla: 'CETENE', nome: 'Centro de Tecnologias Estratégicas', latitude: -8.0550, longitude: -34.9490, qtd: 12, endereco: 'Av. Prof. Luiz Freire, 1' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleEnableLocation = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        let { status: askStatus } = await Location.requestForegroundPermissionsAsync();
        if (askStatus !== 'granted') {
          Alert.alert('Aviso', 'A listagem continuará em ordem alfabética.');
          return false;
        }
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      return true;
    } catch (error) {
      return false;
    }
  };

  const changeSortOrder = async (order: 'distancia' | 'alfabetica') => {
    if (order === 'distancia') {
      const allowed = await handleEnableLocation();
      if (!allowed) {
        setSortOrder('alfabetica');
        setShowSortModal(false);
        return;
      }
    }
    setSortOrder(order);
    setShowSortModal(false);
  };

  const sortedPoints = useMemo(() => {
    let list = [...points];
    if (sortOrder === 'distancia' && location) {
      list.sort((a, b) => {
        const distA = getDistanceInKm(location.coords.latitude, location.coords.longitude, a.latitude, a.longitude);
        const distB = getDistanceInKm(location.coords.latitude, location.coords.longitude, b.latitude, b.longitude);
        return distA - distB;
      });
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

  const checkAvailableNavApps = async () => {
    const appsToCheck = [
      { id: 'google', name: 'Google Maps', url: Platform.OS === 'ios' ? 'comgooglemaps://' : 'https://maps.google.com/' },
      { id: 'waze', name: 'Waze', url: 'waze://' },
      { id: 'uber', name: 'Uber', url: 'uber://' },
      { id: '99', name: '99', url: 'taxis99://' },
      { id: 'moovit', name: 'Moovit', url: 'moovit://' },
      { id: 'cittamobi', name: 'Cittamobi', url: 'cittamobi://' }
    ];

    if (Platform.OS === 'ios') {
      appsToCheck.unshift({ id: 'apple', name: 'Apple Maps', url: 'maps://' });
    }

    const available: NavApp[] = [];
    
    for (const app of appsToCheck) {
      try {
        const canOpen = await Linking.canOpenURL(app.url);
        if (canOpen) available.push(app);
      } catch (e) {
        // Ignora erros de verificação do sistema operacional
      }
    }

    if (available.length === 0) {
      available.push({ id: 'google', name: 'Navegador (Google Maps)', url: 'https://maps.google.com/' });
    }

    setAvailableNavApps(available);
    setShowNavModal(true);
  };

  const openSpecificApp = (appId: string) => {
    if (!selectedPoint) return;
    const { latitude, longitude, nome } = selectedPoint;
    const destName = encodeURIComponent(nome);
    let url = '';

    switch (appId) {
      case 'google':
        url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        break;
      case 'apple':
        url = `http://maps.apple.com/?daddr=${latitude},${longitude}`;
        break;
      case 'waze':
        url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
        break;
      case 'uber':
        url = `uber://?action=setPickup&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${destName}`;
        break;
      case '99':
        url = `taxis99://call?dest_lat=${latitude}&dest_lng=${longitude}`;
        break;
      case 'moovit':
        url = `moovit://directions?dest_lat=${latitude}&dest_lon=${longitude}&dest_name=${destName}`;
        break;
      case 'cittamobi':
        url = `cittamobi://`; 
        break;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível iniciar a rota.');
    });
    setShowNavModal(false);
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
        <TouchableOpacity style={styles.selectButton} onPress={() => setShowSortModal(true)}>
          <Text style={styles.selectButtonText}>
            Ordenar: {sortOrder === 'distancia' ? 'Mais próximos' : 'Alfabética'} ▾
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedPoints}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchPoints}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cardItem} onPress={() => setSelectedPoint(item)}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.sigla} - {item.nome}</Text>
              <Text style={styles.cardAddress}>{item.endereco}</Text>
              {location && <Text style={styles.cardDistance}>📍 A {renderDistance(item.latitude, item.longitude)}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.sortModalBox}>
            <TouchableOpacity style={styles.sortOption} onPress={() => changeSortOrder('alfabetica')}>
              <Text style={styles.sortOptionText}>Ordem Alfabética</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sortOption} onPress={() => changeSortOrder('distancia')}>
              <Text style={styles.sortOptionText}>Mais próximos (Distância)</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!selectedPoint && !showNavModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalBox}>
            {selectedPoint && (
              <>
                <Text style={styles.detailsTitle}>{selectedPoint.sigla}</Text>
                <Text style={styles.detailsAddress}>{selectedPoint.endereco}</Text>
                <Text style={styles.detailsQtd}>Estoque: {selectedPoint.qtd}</Text>
                
                <View style={styles.detailsActionRow}>
                  <TouchableOpacity style={styles.btnAction} onPress={() => { setSelectedPoint(null); router.push('/retirada'); }}>
                    <Text style={styles.btnActionText}>Retirar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnAction} onPress={() => { setSelectedPoint(null); router.push('/doacao'); }}>
                    <Text style={styles.btnActionText}>Doar</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.btnNav} onPress={checkAvailableNavApps}>
                  <Text style={styles.btnNavText}>🚗 Como chegar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnClose} onPress={() => setSelectedPoint(null)}>
                  <Text style={styles.btnCloseText}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showNavModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.navModalBox}>
            <Text style={styles.navModalTitle}>Abrir rota com:</Text>
            {availableNavApps.map((app) => (
              <TouchableOpacity key={app.id} style={styles.navOptionBtn} onPress={() => openSpecificApp(app.id)}>
                <Text style={styles.navOptionText}>{app.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.navOptionBtn, { borderBottomWidth: 0, marginTop: 10 }]} onPress={() => setShowNavModal(false)}>
              <Text style={[styles.navOptionText, { color: '#D93838' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  selectButton: { backgroundColor: '#F0E6F2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  selectButtonText: { color: '#5D2689', fontWeight: '600', fontSize: 14 },
  listContent: { padding: 15, paddingBottom: 40 },
  cardItem: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
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
  btnNav: { width: '100%', backgroundColor: '#D147A3', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  btnNavText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  btnClose: { paddingVertical: 10 },
  btnCloseText: { color: '#8A6E91', fontSize: 16, fontWeight: '600' },
  navModalBox: { width: 300, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, alignItems: 'center' },
  navModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#3B0059', marginBottom: 20 },
  navOptionBtn: { width: '100%', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0E6F2', alignItems: 'center' },
  navOptionText: { fontSize: 16, color: '#5D2689', fontWeight: '600' }
});