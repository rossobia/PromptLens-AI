import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { useRouter } from 'expo-router'; // YÖNLENDİRME KÜTÜPHANESİ EKLENDİ

export default function OnboardingScreen() {
  // ROUTER BURAYA TANIMLANIR (return'den hemen önce)
  const router = useRouter(); 

  return (
    <SafeAreaView style={styles.container}>
      {/* Dekoratif Arkaplan Işıkları */}
      <View style={[styles.glow, { top: -50, left: -50, backgroundColor: colors.secondary, opacity: 0.15 }]} />
      <View style={[styles.glow, { bottom: -50, right: -50, backgroundColor: '#9333ea', opacity: 0.2 }]} />

      <View style={styles.mainContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoInner}>
            <MaterialIcons name="camera" size={48} color={colors.text} />
          </View>
          <Text style={styles.title}>PromptLens</Text>
          <Text style={styles.subtitle}>OPTICS + AI</Text>
        </View>

        <BlurView intensity={30} tint="dark" style={styles.glassPanel}>
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}><MaterialIcons name="photo-camera" size={24} color={colors.secondary} /></View>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.iconCircle}><MaterialIcons name="photo-library" size={24} color={colors.secondary} /></View>
          </View>
          
          <Text style={styles.headerText}>Erişim İzni Gerekli</Text>
          <Text style={styles.description}>PromptLens'in dünyayı analiz edip zenginleştirebilmesi için kamera ve galeri iznine ihtiyacı var.</Text>
          
          {/* İŞTE BUTONUMUZ VE YÖNLENDİRME KODUMUZ BURADA */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.replace('/camera')} 
          >
            <MaterialIcons name="check-circle" size={20} color={colors.text} />
            <Text style={styles.buttonText}>İzin Ver</Text>
          </TouchableOpacity>

        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150 }, 
  mainContent: { width: '90%', maxWidth: 400 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoInner: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(28,32,38,0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 16 },
  title: { fontSize: 40, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: colors.secondary, letterSpacing: 4, marginTop: 8 },
  glassPanel: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(28,32,38,0.6)' },
  iconRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 16 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#272a30', justifyContent: 'center', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#32353b' },
  headerText: { fontSize: 24, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  primaryButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  buttonText: { color: colors.text, fontWeight: '600', fontSize: 16 }
});