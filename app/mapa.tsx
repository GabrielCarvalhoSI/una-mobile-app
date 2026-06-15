import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Platform,
  Alert
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

// Coordenadas dos centros da UFPE estabelecidas no Backlog
const POINTS = [
  { id: '1', sigla: 'CIn', nome: 'Centro de Informática', latitude: -8.0558, longitude: -34.9515, qtd: 15 },
  { id: '2', sigla: 'CAC', nome: 'Centro de Artes e Comunicação', latitude: -8.0532, longitude: -34.9518, qtd: 10 },
  { id: '3', sigla: 'CCSA', nome: 'Centro de Ciências Soc. Aplicadas', latitude: -8.0515, longitude: -34.9505, qtd: 5 },
  { id: '4', sigla: 'CFCH', nome: 'Centro de Filosofia e Ciências Hum.', latitude: -8.0525, longitude: -34.9535, qtd: 0 },
  { id: '5', sigla: 'CCEN', nome: 'Centro de Ciências Exatas e da Natureza', latitude: -8.0522, longitude: -34.9510, qtd: 8 },
  { id: '6', sigla: 'CETENE', latitude: -8.0550, longitude: -34.9490, qtd: 12 }
];

export default function MapScreen() {
  const router = useRouter();
  
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<typeof POINTS[0] | null>(POINTS[0]);
  // Controle de abertura e fechamento do modal ao clicar no marcador
  const handleMarkerPress = (point: typeof POINTS[0]) => {
    if (selectedPoint?.id === point.id) {
      setSelectedPoint(null); 
    } else {
      setSelectedPoint(point); 
    }
  };

  const handleToggleLocation = async () => {
    if (locationEnabled) {
      setLocationEnabled(false);
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Aviso', 'A permissão de localização é opcional, mas necessária para mostrar sua posição no mapa.');
      return;
    }

    setLocationEnabled(true);
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={{ width: 40 }} /> 
        <Image 
          source={require('../assets/images/una.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/perfil')}>
          <Text style={styles.profileIconText}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          mapType={Platform.OS === 'android' ? 'none' : 'standard'}
          showsUserLocation={locationEnabled}
          showsMyLocationButton={locationEnabled}
          initialRegion={{
            latitude: -8.0545,
            longitude: -34.9520,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          onPress={() => setSelectedPoint(null)}
        >
          {/* Fallback de mapa via OpenStreetMap apenas para Android */}
          {Platform.OS === 'android' && (
            <UrlTile
              urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              tileSize={256}
            />
          )}

          {POINTS.map((point) => (
            <Marker
              key={point.id}
              coordinate={{ latitude: point.latitude, longitude: point.longitude }}
              onPress={(e) => {
                e.stopPropagation();
                handleMarkerPress(point);
              }}
            >
              <View style={[styles.markerBadge, selectedPoint?.id === point.id && styles.markerBadgeSelected]}>
                <Text style={styles.markerText}>{point.sigla}</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Botões Flutuantes */}
        <TouchableOpacity 
          style={[styles.locationToggleBtn, locationEnabled && styles.locationToggleBtnActive]} 
          onPress={handleToggleLocation}
        >
          <Text style={styles.locationToggleText}>
            {locationEnabled ? 'Desabilitar localização 🚫' : 'Permitir localização 📍'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportBtn} onPress={() => router.push('/reclame')}>
          <Text style={styles.reportBtnText}>⚠ Relatar um problema</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Inferior */}
      {selectedPoint && (
        <View style={styles.bottomPanel}>
          <Text style={styles.pointName}>Ponto - {selectedPoint.sigla}</Text>
          <Text style={styles.pointQtd}>Quantidade : {selectedPoint.qtd}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnAction} onPress={() => router.push('/retirada')}>
              <Text style={styles.btnActionText}>Retirar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnAction} onPress={() => router.push('/doacao')}>
              <Text style={styles.btnActionText}>Doar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6F2',
    zIndex: 10,
  },
  logo: { width: 80, height: 40 },
  profileIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0E6F2', alignItems: 'center', justifyContent: 'center' },
  profileIconText: { fontSize: 20 },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  locationToggleBtn: { position: 'absolute', top: 20, right: 20, backgroundColor: '#D147A3', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, zIndex: 10 },
  locationToggleBtnActive: { backgroundColor: '#D93838' },
  locationToggleText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  reportBtn: { position: 'absolute', bottom: 30, left: 20, backgroundColor: '#FF8C5A', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 15, zIndex: 10 },
  reportBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  markerBadge: { backgroundColor: '#D147A3', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15, borderWidth: 2, borderColor: '#FFFFFF' },
  markerBadgeSelected: { backgroundColor: '#5D2689', transform: [{ scale: 1.1 }] },
  markerText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  bottomPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#5D2689', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingVertical: 35, paddingHorizontal: 20, alignItems: 'center', zIndex: 20 },
  pointName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  pointQtd: { color: '#D1BED5', fontSize: 16, marginBottom: 25 },
  actionButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingHorizontal: 10 },
  btnAction: { borderWidth: 1, borderColor: '#D1BED5', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 45, backgroundColor: 'rgba(255,255,255,0.05)' },
  btnActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});