import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  
  // 🔥 GİRİŞ ANİMASYONLARI
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // 🌌 ARKA PLAN HAREKET ANİMASYONLARI
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Ekran açıldığında jilet gibi süzülerek gelme efekti
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true })
    ]).start();

    // 2. Arka plandaki 1. ışımanın (Sol Üst) sonsuz nefes alma ve hareket döngüsü
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(floatAnim1, { toValue: 0, duration: 4000, useNativeDriver: true })
      ])
    ).start();

    // 3. Arka plandaki 2. ışımanın (Sağ Alt) biraz daha yavaş ve farklı hareket döngüsü
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, { toValue: 1, duration: 5500, useNativeDriver: true }),
        Animated.timing(floatAnim2, { toValue: 0, duration: 5500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  // Animasyon değerlerini pozisyona (Y ekseninde kayma) ve boyuta (scale) çevirme
  const translateY1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });
  const scale1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  
  const translateY2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });
  const scale2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  return (
    <SafeAreaView style={styles.container}>
      {/* 🌌 HAREKETLİ DEKORATİF YAPAY ZEKA IŞIMALARI */}
      {/* 🔥 Madde 1: Sarı rengin opaklığını %8'e düşürdük, artık göz yormuyor */}
      <Animated.View style={[styles.glowCore, { 
        top: -height * 0.1, left: -width * 0.2, 
        backgroundColor: '#FFCC00', opacity: 0.08,
        transform: [{ translateY: translateY1 }, { scale: scale1 }] 
      }]} />
      
      {/* İkinci ışıma teknolojik bir mor/mavi */}
      <Animated.View style={[styles.glowCore, { 
        bottom: -height * 0.1, right: -width * 0.2, 
        backgroundColor: '#4F46E5', opacity: 0.12,
        transform: [{ translateY: translateY2 }, { scale: scale2 }] 
      }]} />

      <Animated.View style={[styles.mainContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        
        {/* 📸 LOGO VE MARKA ALANI */}
        <View style={styles.logoContainer}>
          <View style={styles.lensRing}>
            <View style={styles.lensCore}>
              {/* Logodaki sarı tonunu daha soft yaptık */}
              <MaterialIcons name="camera" size={42} color="rgba(255, 204, 0, 0.8)" /> 
            </View>
          </View>
          {/* 🔥 Madde 3: İsim Prompt Lens olarak güncellendi */}
          <Text style={styles.title}>Prompt Lens</Text> 
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>VİZYON • YAPAY ZEKA • SİHİR</Text>
          </View>
        </View>

        {/* 🛡️ İZİN PANELİ */}
        <BlurView intensity={50} tint="dark" style={styles.glassPanel}>
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="camera-alt" size={24} color="#FFF" />
            </View>
            <View style={styles.connectorLine}>
               <View style={styles.connectorDot} />
               <View style={styles.connectorDot} />
               <View style={styles.connectorDot} />
            </View>
            <View style={styles.iconCircle}>
              <MaterialIcons name="photo-library" size={24} color="#FFF" />
            </View>
          </View>
          
          <Text style={styles.headerText}>Sihri Başlatın</Text>
          <Text style={styles.description}>
            Prompt Lens'in dünyayı analiz edip yapay zeka ile yeniden yaratabilmesi için kamera ve galeri erişimine ihtiyacı var.
          </Text>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.replace('/camera')} 
          >
            <Text style={styles.buttonText}>İzin Ver ve Başla</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#0B0C10" />
          </TouchableOpacity>
        </BlurView>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0B0C10', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  glowCore: { 
    position: 'absolute', 
    width: width * 0.8, 
    height: width * 0.8, 
    borderRadius: width * 0.4,
  }, 
  mainContent: { 
    width: '90%', 
    maxWidth: 400,
    alignItems: 'center',
    zIndex: 10
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 50 
  },
  lensRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Dış çemberi sarıdan beyaza çektik, sarı azalmış oldu
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  lensCore: { 
    width: 76, 
    height: 76, 
    borderRadius: 38, 
    backgroundColor: '#1C1C1E', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2C2C2E',
    shadowColor: 'rgba(255, 204, 0, 0.2)', // Logo gölgesindeki sarı etkisi minimuma indirildi
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  title: { 
    fontSize: 36, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    letterSpacing: 1,
    marginBottom: 8
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  badgeText: { 
    fontSize: 12, 
    color: 'rgba(255, 255, 255, 0.6)', 
    letterSpacing: 3, 
    fontWeight: '600'
  },
  glassPanel: { 
    width: '100%',
    padding: 30, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)', 
    backgroundColor: 'rgba(20, 20, 22, 0.65)',
    alignItems: 'center',
    overflow: 'hidden'
  },
  iconRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24, 
  },
  iconCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  connectorLine: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  connectorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },
  headerText: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  description: { 
    fontSize: 15, 
    color: 'rgba(255, 255, 255, 0.6)', 
    textAlign: 'center', 
    marginBottom: 32, 
    lineHeight: 24 
  },
  primaryButton: { 
    backgroundColor: '#FFCC00',
    width: '100%',
    paddingVertical: 18, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // Buton gölgesini de biraz yumuşattık
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: { 
    color: '#0B0C10',
    fontWeight: '800', 
    fontSize: 16,
    letterSpacing: 0.5,
    marginRight: 8
  }
});