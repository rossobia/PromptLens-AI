import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PromptLens AI</Text>
      <Text style={styles.subtitle}>Giriş Yap</Text>
      
      <TextInput style={styles.input} placeholder="E-posta" placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Şifre" secureTextEntry={true} placeholderTextColor="#aaa" />
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Giriş</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#888', marginBottom: 30 },
  input: { width: '100%', height: 50, backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 15, color: '#fff', marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  button: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});