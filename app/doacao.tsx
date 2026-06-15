import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Importação do SVG (Assumindo configuração react-native-svg-transformer)


export default function DoacaoScreen() {
  const router = useRouter();
  const [quantidade, setQuantidade] = useState('');

  const handleConfirmarDoacao = () => {
    const qtdNum = parseInt(quantidade);
    // Validação FM09
    if (isNaN(qtdNum) || qtdNum <= 0) {
      Alert.alert("Erro", "Por favor, informe uma quantidade válida para doação.");
      return;
    }

    // Simulação da lógica FM09: Registrar doação no sistema
    Alert.alert(
      "Doação Registrada",
      `Obrigada! Sua doação de ${qtdNum} item(ns) foi registrada neste ponto.`,
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
          {/* Ilustração SVG (Mulher 2) */}
          <View style={styles.svgContainer}>
            <Image 
                source={require('../assets/images/Mulher 2.png')} 
                style={{ width: 280, height: 280 }} 
                resizeMode="contain" 
            />
          </View>

          {/* Texto de Confirmação (Adaptado do Figma para o fluxo de doação) */}
          <Text style={styles.confirmationText}>
            Você confirma a doação para este ponto? Informe a quantidade abaixo:
          </Text>

          {/* Campo de Entrada (FM09 exige input) */}
          <TextInput
            style={styles.inputQuantidade}
            placeholder="Ex: 5"
            keyboardType="number-pad"
            value={quantidade}
            onChangeText={setQuantidade}
            maxLength={3}
          />
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
            onPress={handleConfirmarDoacao}
          >
            <Text style={styles.btnPurpleText}>Sim, confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Estilos idênticos à Retirada para consistência visual
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D1BED5', 
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
    color: '#3B0059', 
    fontWeight: '300',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', 
    paddingBottom: 40,
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
    marginBottom: 15,
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
    marginBottom: 20,
  },
  inputQuantidade: {
    backgroundColor: '#FAF5FF',
    width: '80%',
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E6D4EA',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3B0059',
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