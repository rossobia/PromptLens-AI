import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  Animated, Dimensions, TextInput, KeyboardAvoidingView, Platform 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// 🔥 SAHTE VERİTABANI (Backend bağlanana kadar sistemi burada test edeceğiz)
let MOCK_USERS = [
  { email: 'demo', password: 'demo', isPro: false }
];

export default function LoginScreen() {
  const router = useRouter();
  
  // -- EKRAN DURUMLARI (STATE) --
  const [isLoginMode, setIsLoginMode] = useState(true); // true = Giriş Yap, false = Kayıt Ol
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProSelected, setIsProSelected] = useState(false); // Kayıt olurken PRO seçimi
  const [errorMessage, setErrorMessage] = useState('');

  // -- ANİMASYON MOTORLARI --
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ekran Açılış Animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true })
    ]).start();

    // Arka Plan Nefes Alma Animasyonları
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim1, { toValue: 1, duration: 4000, useNativeDriver: true }),
      Animated.timing(floatAnim1, { toValue: 0, duration: 4000, useNativeDriver: true })
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim2, { toValue: 1, duration: 5500, useNativeDriver: true }),
      Animated.timing(floatAnim2, { toValue: 0, duration: 5500, useNativeDriver: true })
    ])).start();
  }, []);

  const translateY1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, 15] });
  const scale1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const translateY2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const scale2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });

  // -- GİRİŞ YAPMA MANTIĞI --
  // -- GİRİŞ YAPMA MANTIĞI --
  const handleLogin = () => {
    setErrorMessage('');
    if (!email || !password) { setErrorMessage('Lütfen tüm alanları doldurun.'); return; }

    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
      // 🔥 'as any' ekleyerek TypeScript'i susturuyoruz
      (global as any).isPro = user.isPro;
      
      // 🔥 İŞTE BURAYI DEĞİŞTİRDİK: Eski kullanıcı doğrudan kameraya uçar!
      router.replace('/camera' as any); 
    } else {
      setErrorMessage('E-posta veya şifre yanlış!');
    }
  };

  // -- KAYIT OLMA MANTIĞI --
  const handleRegister = () => {
    setErrorMessage('');
    if (!email || !password) { setErrorMessage('Lütfen tüm alanları doldurun.'); return; }

    const emailExists = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      setErrorMessage('Bu e-posta adresi zaten alınmış!');
      return;
    }

    // 🔥 Yeni kullanıcıyı veritabanına ekle
    MOCK_USERS.push({ email: email.toLowerCase(), password, isPro: isProSelected });
    
    // 🔥 Yine 'as any' ile global'i eziyoruz
    (global as any).isPro = isProSelected;
    
    // 🔥 Route hatasını eziyoruz
    router.replace('/onboarding-screen' as any);
  };

  const submitAction = isLoginMode ? handleLogin : handleRegister;

  return (
    <SafeAreaView style={styles.container}>
      {/* 🌌 HAREKETLİ ARKA PLAN IŞIMALARI */}
      <Animated.View style={[styles.glowCore, { 
        top: -height * 0.05, left: -width * 0.3, backgroundColor: '#FFCC00', opacity: 0.08,
        transform: [{ translateY: translateY1 }, { scale: scale1 }] 
      }]} />
      <Animated.View style={[styles.glowCore, { 
        bottom: -height * 0.1, right: -width * 0.2, backgroundColor: '#4F46E5', opacity: 0.12,
        transform: [{ translateY: translateY2 }, { scale: scale2 }] 
      }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* LENS LOGO & BAŞLIK */}
          <View style={styles.headerContainer}>
            <View style={styles.lensCore}>
              <MaterialIcons name="camera" size={32} color="rgba(255, 204, 0, 0.9)" /> 
            </View>
            <Text style={styles.title}>Prompt Lens</Text>
            <Text style={styles.subtitle}>{isLoginMode ? 'Yapay Zeka Dünyasına Dönüş Yapın' : 'Lensin Bir Parçası Olun'}</Text>
          </View>

          {/* GİRİŞ / KAYIT FORMU */}
          <BlurView intensity={40} tint="dark" style={styles.glassPanel}>
            
            {/* SEKMELER */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, isLoginMode && styles.activeTab]} 
                onPress={() => { setIsLoginMode(true); setErrorMessage(''); }}
              >
                <Text style={[styles.tabText, isLoginMode && styles.activeTabText]}>Giriş Yap</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, !isLoginMode && styles.activeTab]} 
                onPress={() => { setIsLoginMode(false); setErrorMessage(''); }}
              >
                <Text style={[styles.tabText, !isLoginMode && styles.activeTabText]}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>

            {/* HATA MESAJI */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={16} color="#FF4C4C" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* INPUTLAR */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="E-posta Adresi" 
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                placeholder="Şifre" 
                placeholderTextColor="rgba(255,255,255,0.3)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* 🔥 KAYIT OLURKEN PRO SEÇENEĞİ */}
            {!isLoginMode && (
              <TouchableOpacity 
                style={[styles.proToggleContainer, isProSelected && styles.proToggleActive]} 
                activeOpacity={0.8}
                onPress={() => setIsProSelected(!isProSelected)}
              >
                <View style={styles.proToggleTextGroup}>
                  <Text style={styles.proToggleTitle}>PRO Üyelik İstiyorum</Text>
                  <Text style={styles.proToggleDesc}>Tüm filtreler ve yapay zeka özellikleri</Text>
                </View>
                <MaterialIcons 
                  name={isProSelected ? "check-circle" : "radio-button-unchecked"} 
                  size={24} 
                  color={isProSelected ? "#FFCC00" : "rgba(255,255,255,0.3)"} 
                />
              </TouchableOpacity>
            )}

            {/* ANA AKSİYON BUTONU */}
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={submitAction}>
              <Text style={styles.buttonText}>{isLoginMode ? 'Giriş Yap' : 'Hesabı Oluştur'}</Text>
              <MaterialIcons name={isLoginMode ? "login" : "person-add"} size={20} color="#0B0C10" />
            </TouchableOpacity>

          </BlurView>

          {/* DEMO KULLANICI BİLGİLERİ */}
          {isLoginMode && (
            <View style={styles.demoInfoBox}>
              <Text style={styles.demoTitle}>Varsayılan Kullanıcı:</Text>
              <Text style={styles.demoText}>E-posta: <Text style={{color: '#FFF'}}>demo</Text></Text>
              <Text style={styles.demoText}>Şifre: <Text style={{color: '#FFF'}}>demo</Text></Text>
            </View>
          )}

        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C10', justifyContent: 'center' },
  keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glowCore: { position: 'absolute', width: width * 1, height: width * 1, borderRadius: width * 0.5 },
  mainContent: { width: '90%', maxWidth: 400, alignItems: 'center', zIndex: 10 },
  
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  lensCore: { 
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1C1C1E', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2C2C2E',
    shadowColor: 'rgba(255, 204, 0, 0.15)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 15, elevation: 10, marginBottom: 16
  },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: 0.5 },

  glassPanel: { width: '100%', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(20, 20, 22, 0.65)', overflow: 'hidden' },
  
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: 'rgba(255,255,255,0.4)', fontWeight: '600', fontSize: 14 },
  activeTabText: { color: '#FFF' },

  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 76, 76, 0.1)', padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255, 76, 76, 0.3)' },
  errorText: { color: '#FF4C4C', fontSize: 13, marginLeft: 8, fontWeight: '500' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14, marginBottom: 16, paddingHorizontal: 16, height: 54 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 15, height: '100%' },

  proToggleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 204, 0, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 204, 0, 0.2)', padding: 16, borderRadius: 14, marginBottom: 20 },
  proToggleActive: { backgroundColor: 'rgba(255, 204, 0, 0.15)', borderColor: '#FFCC00' },
  proToggleTextGroup: { flex: 1 },
  proToggleTitle: { color: '#FFF', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  proToggleDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  primaryButton: { backgroundColor: '#FFCC00', width: '100%', paddingVertical: 16, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#0B0C10', fontWeight: '800', fontSize: 16, letterSpacing: 0.5, marginRight: 8 },

  demoInfoBox: { marginTop: 30, alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', width: '100%' },
  demoTitle: { color: 'rgba(255, 204, 0, 0.8)', fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 1 },
  demoText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 2 }
});