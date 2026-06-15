import { useRouter } from 'expo-router';
import {
    Alert,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';



export default function RetiradaScreen() {
  const router = useRouter();

  const handleConfirmarRetirada = () => {
    // Simulação da lógica FM08: Atualizar estoque (-1) e registrar
    Alert.alert(
      "Retirada Confirmada",
      "Você retirou 1 item com sucesso. O estoque do ponto foi atualizado.",
      [
        { text: "OK", onPress: () => router.push('/mapa') } // Volta para o mapa
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Botão Voltar */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Painel Centralizado (Branco) */}
        <View style={styles.confirmationCard}>
   
          <View style={styles.svgContainer}>
            <Image 
                source={require('../assets/images/Mulher 1.png')} 
                style={{ width: 280, height: 280 }} 
                resizeMode="contain" 
                 />
          </View>

          {/* Texto de Confirmação (Texto do Figma) */}
          <Text style={styles.confirmationText}>
            Você confirma a retirada de 1 item deste ponto? O limite é de um item por vez.
          </Text>
        </View>

        {/* Grupo de Botões (Lavanda) */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.btnOutline} 
            onPress={() => router.back()}
          >
            <Text style={styles.btnOutlineText}>Não, cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnPurple} 
            onPress={handleConfirmarRetirada}
          >
            <Text style={styles.btnPurpleText}>Sim, confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1BED5', // Fundo lavanda padrão Una
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  backButton: {
    padding: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 32,
    color: '#3B0059', // Roxo escuro Una
    fontWeight: '300',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o card verticalmente
    paddingBottom: 40, // Espaço para os botões não colarem no card
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },
  svgContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmationText: {
    fontSize: 18,
    color: '#3B0059',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    width: '100%',
    gap: 15,
    paddingHorizontal: 10,
  },
  btnPurple: {
    backgroundColor: '#3B0059',
    width: '100%',
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  btnPurpleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    width: '100%',
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B0059',
  },
  btnOutlineText: {
    color: '#3B0059',
    fontSize: 16,
    fontWeight: '700',
  },
});