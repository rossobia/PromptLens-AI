// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Animated, Easing, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeviceEventEmitter } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// GÜNCEL UYGULAMA RENK PALETİ
const NEON_CYAN = '#00F0FF';
const DARK_TITANIUM = '#0B0C10';
const SOFT_GRAY = '#8A8D9E';
const PRO_GOLD = '#FFD700';

const PRO_FEATURES = [
  { id: 'imagine', name: 'Hayal Et', icon: 'auto-awesome', desc: 'Kelimelerin gücünü piksellere dökün. Aklınızdan geçen fantastik dünyaları 8K çözünürlükte çizin.' },
  { id: 'remove', name: 'Sihirli Silgi', icon: 'auto-fix-high', desc: 'Arka plandaki istenmeyen nesneleri akıllı maskeleme ile iz bırakmadan, yapay zeka ile yok edin.' },
  { id: 'smart', name: 'Akıllı Stil', icon: 'tune', desc: 'Metin komutlarıyla fotoğraflarınıza anlık, benzersiz ve sinematik atmosferler katın.' },
  { id: 'limitless', name: 'Sınırsız İşlem & 4K', icon: 'all-inclusive', desc: 'Günlük limitlere takılmadan, en yüksek çözünürlükte (Ultra HD) filigransız çıktılar alın.' }
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // 🔥 DEMO ÜYELİK MOTORU: Giriş yapıldığında kullanılacak mock state simülasyonu
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Arka plandaki büyülü neon parlamalar için animasyon değerleri
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Premium arka plan nabız efekti
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();
  }, []);

  const handleSubscribe = () => {
    Animated.spring(successScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
    setIsSubscribed(true);
    
    // 🔥 KESİN ÇÖZÜM: Tüm uygulamanın görebileceği global PRO kilidini açıyoruz
    global.isPro = true;
  };

  const handleClose = () => {
    // Eğer abone olduysa kamerayı sıfırlasın veya ana ekrana başarılı dönsün diye ayarlandı
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* 1. MADDE: Tam Ekran StatusBar Entegrasyonu */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* SİNEMATİK ARKA PLAN AMBİYANSI */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: DARK_TITANIUM }]} />
        {/* Hareketli Premium Glow Halkaları */}
        <Animated.View style={[styles.ambientGlowCyan, { transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={[styles.ambientGlowGold, { transform: [{ scale: pulseAnim }] }]} />
      </View>

      {!isSubscribed ? (
        // --- ABONE OLMA EKRANI ---
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          
          {/* ÜST KAPATMA BUTONU (Çentikten bağımsız) */}
          <TouchableOpacity 
            onPress={handleClose} 
            style={[styles.closeButton, { top: insets.top + 10 }]}
          >
            <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          {/* 4. MADDE: Aşağıdan Çıkan Yenilenmiş Cam Efektli Kart (Full-Bleed Sheet) */}
          <BlurView intensity={80} tint="dark" style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.dragHandle} />

            {/* BAŞLIK VE PRO ROZETİ ALANI */}
            <View style={styles.headerContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.mainTitle}>PROMPT LENS</Text>
                {/* 3. MADDE: Birebir Aynı Tasarım PRO Logosu */}
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>Sınırları ortadan kaldırın. Yapay zeka motorunun tüm gücünü serbest bırakın.</Text>
            </View>

            {/* 2. MADDE: Gerçek Yapay Zeka Özelliklerimizin Sıralı Listesi */}
            <ScrollView style={styles.featuresScroll} showsVerticalScrollIndicator={false}>
              {PRO_FEATURES.map((feature) => (
                <View key={feature.id} style={styles.featureCard}>
                  <View style={styles.featureIconBox}>
                    <MaterialIcons name={feature.icon} size={24} color={feature.id === 'limitless' ? PRO_GOLD : NEON_CYAN} />
                  </View>
                  <View style={styles.featureTextBox}>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* FİYATLANDIRMA VE ATEŞLEYİCİ BUTON */}
            <View style={styles.checkoutArea}>
              <View style={styles.priceTagContainer}>
                <Text style={styles.priceCurrency}>₺</Text>
                <Text style={styles.priceMainText}>99,99</Text>
                <Text style={styles.pricePeriodText}>/ aylık</Text>
              </View>
              <Text style={styles.infoMiniText}>İstediğiniz an tek tıkla iptal edebilirsiniz. Taahhüt yoktur.</Text>

              {/* ABONE OL BUTONU */}
              <TouchableOpacity style={styles.subscribeBtn} activeOpacity={0.8} onPress={handleSubscribe}>
                <Text style={styles.subscribeBtnText}>PREMIUM ÜYELİĞE GEÇ</Text>
                <MaterialIcons name="bolt" size={22} color={DARK_TITANIUM} style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              <Text style={styles.legalTermsText}>
                Satın alımı onaylayarak Kullanım Şartları ve Gizlilik Sözleşmesi'ni kabul etmiş olursunuz.
              </Text>
            </View>

            {/* 1. MADDE fiks: Alt Çizgiyi Swallov Eden Güvenli Bölge Yaması */}
            <View style={{ position: 'absolute', bottom: -50, left: 0, right: 0, height: 50, backgroundColor: 'rgba(15, 16, 22, 0.95)' }} />
          </BlurView>
        </View>
      ) : (
        // --- 6. MADDE: SARIŞAN KUSURSUZ BAŞARI (SUCCESS) EKRANI ---
        <Animated.View style={[styles.successContainer, { transform: [{ scale: successScale }] }]}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconInner}>
              <MaterialIcons name="workspace-premium" size={60} color={DARK_TITANIUM} />
            </View>
          </View>
          <Text style={styles.successTitle}>Aramıza Hoş Geldiniz!</Text>
          <View style={[styles.proBadge, { alignSelf: 'center', marginVertical: 10, paddingHorizontal: 20, paddingVertical: 6 }]}>
            <Text style={[styles.proBadgeText, { fontSize: 14 }]}>PRO AKTİF</Text>
          </View>
          <Text style={styles.successDesc}>
            Aboneliğiniz demo hesabı üzerinden başarıyla tanımlandı. Sihirli Silgi, Hayal Et ve Akıllı Stil araçlarındaki tüm kilitler kırıldı.
          </Text>
          <TouchableOpacity style={styles.successCloseBtn} onPress={handleClose}>
            <Text style={styles.successCloseBtnText}>Uygulamaya Dön</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_TITANIUM },
  
  // AMBİYANS IŞIKLARI (Hayal et ekranındaki gibi premium bir hava katar)
  ambientGlowCyan: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(0, 240, 255, 0.15)', filter: 'blur(40px)' },
  ambientGlowGold: { position: 'absolute', top: 200, right: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(255, 215, 0, 0.1)', filter: 'blur(50px)' },

  closeButton: { position: 'absolute', right: 16, backgroundColor: 'rgba(0,0,0,0.4)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', zIndex: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },

  // CAM EFEKTLİ BOTTOM SHEET
  bottomSheet: { width: '100%', maxHeight: SCREEN_HEIGHT * 0.95, borderTopLeftRadius: 35, borderTopRightRadius: 35, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', padding: 24, overflow: 'hidden', backgroundColor: 'rgba(11, 12, 16, 0.75)' },  dragHandle: { width: 44, height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2.5, alignSelf: 'center', marginBottom: 20 },

  // BAŞLIK BLOKLARI
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 },
  mainTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  
  proBadge: { backgroundColor: PRO_GOLD, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, shadowColor: PRO_GOLD, shadowOpacity: 0.5, shadowRadius: 5 },
  proBadgeText: { color: DARK_TITANIUM, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  subtitle: { color: SOFT_GRAY, fontSize: 13, textAlign: 'center', lineHeight: 18, paddingHorizontal: 15 },

  // ÖZELLİK LİSTESİ KARTLARI
  featuresScroll: { maxHeight: SCREEN_HEIGHT * 0.50, marginBottom: 15 },
  featureCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  featureIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  featureTextBox: { flex: 1, marginLeft: 14 },
  featureName: { color: '#FFF', fontSize: 14, fontWeight: '800', marginBottom: 3 },
  featureDesc: { color: SOFT_GRAY, fontSize: 11, lineHeight: 15 },

  // SATIN ALMA ALANI
  checkoutArea: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 15, alignItems: 'center' },
  priceTagContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  priceCurrency: { fontSize: 20, fontWeight: '900', color: PRO_GOLD, marginRight: 2 },
  priceMainText: { fontSize: 42, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  pricePeriodText: { fontSize: 14, color: SOFT_GRAY, marginLeft: 4, fontWeight: '700' },
  infoMiniText: { color: SOFT_GRAY, fontSize: 11, marginBottom: 15, textAlign: 'center' },

  // PREMIUM ABONE BUTONU (Sapsarı Premium Teması)
  subscribeBtn: { flexDirection: 'row', backgroundColor: PRO_GOLD, width: '100%', paddingVertical: 16, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: PRO_GOLD, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8, marginBottom: 15 },
  subscribeBtnText: { color: DARK_TITANIUM, fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  legalTermsText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, textAlign: 'center', paddingHorizontal: 15, lineHeight: 14 },

  // BAŞARI (SUCCESS) EKRANI STİLLERİ
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: DARK_TITANIUM },
  successIconOuter: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,215,0,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successIconInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: PRO_GOLD, justifyContent: 'center', alignItems: 'center', shadowColor: PRO_GOLD, shadowOpacity: 0.5, shadowRadius: 15 },
  successTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 10 },
  successDesc: { color: SOFT_GRAY, fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: 15, paddingHorizontal: 15 },
  successCloseBtn: { marginTop: 40, backgroundColor: '#FFF', paddingHorizontal: 35, paddingVertical: 16, borderRadius: 25, shadowColor: '#FFF', shadowOpacity: 0.2, shadowRadius: 10 },
  successCloseBtnText: { color: DARK_TITANIUM, fontWeight: '900', fontSize: 15 }
});