import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function PerfilScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3B0059" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Image source={require('../assets/images/una.png')} style={styles.logo} resizeMode="contain" />
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>{profile?.full_name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{profile?.full_name || 'Usuária'}</Text>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Pontos acumulados:</Text>
          <Text style={styles.statsValue}>{profile?.points_earned || 0}</Text>
        </View>

        <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
          <Text style={styles.btnLogoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0E6F2' },
  backButton: { padding: 10 },
  backButtonText: { fontSize: 32, color: '#5D2689', fontWeight: '300' },
  logo: { width: 80, height: 40 },
  content: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#D147A3', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  avatarInitial: { fontSize: 40, color: '#FFFFFF', fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#3B0059', marginBottom: 30 },
  statsCard: { backgroundColor: '#FFFFFF', width: '100%', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 40, elevation: 3 },
  statsLabel: { fontSize: 16, color: '#8A6E91', marginBottom: 10 },
  statsValue: { fontSize: 36, fontWeight: 'bold', color: '#5D2689' },
  btnLogout: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#D93838', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnLogoutText: { color: '#D93838', fontSize: 16, fontWeight: 'bold' }
});