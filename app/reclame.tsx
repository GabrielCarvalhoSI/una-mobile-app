import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ReclameScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [ponto, setPonto] = useState('CIn'); // Pode ser recebido dinamicamente depois

  const categorias = [
    "Falta de absorvente", 
    "Não consigo retirar", 
    "QR Code faltando"
  ];

  const handleSelecionarOcorrencia = (categoriaSelecionada: string) => {
    // Aqui você enviaria o relato para o backend no futuro
    setModalVisible(true); // Abre a "tela" de confirmação 
  };

  const handleFechar = () => {
    setModalVisible(false);
    router.push('/mapa'); // Retorna ao mapa após confirmar
  };

return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Image 
          source={require('../assets/images/una.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.labelInput}>Ponto da ocorrência:</Text>
        <TextInput 
          style={styles.inputPonto}
          value={ponto}
          onChangeText={setPonto}
          editable={false} 
        />

        <Text style={styles.labelOcorrencia}>Selecione a ocorrência</Text>
        
        <View style={styles.buttonGroup}>
          {categorias.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.btnCategoria}
              onPress={() => handleSelecionarOcorrencia(cat)}
            >
              <Text style={styles.btnCategoriaText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={handleFechar}
      >
        <View style={styles.modalContainer}>
          <Image 
            source={require('../assets/images/una.png')} 
            style={styles.modalLogo}
            resizeMode="contain"
          />

          <Image 
            source={require('../assets/images/Mulher 3.png')} 
            style={styles.modalImage}
            resizeMode="contain"
          />

          <Text style={styles.modalTitle}>Obrigada por nos avisar!</Text>
          <Text style={styles.modalSubtitle}>
            Iremos trabalhar nisso para melhorar a sua experiência.
          </Text>

          <TouchableOpacity style={styles.btnPink} onPress={handleFechar}>
            <Text style={styles.btnPinkText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Estilos da Tela Principal
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF', // Fundo claro quase branco
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 32,
    color: '#5D2689', 
    fontWeight: '300',
  },
  logo: {
    width: 80,
    height: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  labelInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
  },
  inputPonto: {
    width: '80%',
    height: 45,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D147A3', // Borda rosa do Figma
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#3B0059',
    marginBottom: 40,
  },
  labelOcorrencia: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B0059',
    marginBottom: 20,
  },
  buttonGroup: {
    width: '100%',
    gap: 15, // Espaçamento entre os botões roxos
    alignItems: 'center',
  },
  btnCategoria: {
    backgroundColor: '#9E66C3', // Roxo médio do Figma
    width: '90%',
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCategoriaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Estilos do Modal de Confirmação
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAF5FF',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  modalLogo: {
    width: 100,
    height: 60,
    marginBottom: 40,
  },
  modalImage: {
    width: 250,
    height: 250,
    marginBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3B0059',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B0059',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  btnPink: {
    backgroundColor: '#E65C9C', // Rosa do botão fechar
    width: '60%',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPinkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});