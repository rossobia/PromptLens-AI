import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { useRouter } from 'expo-router'; // 1. Yönlendirme kütüphanesi eklendi

export default function CameraScreen() {
  const router = useRouter(); // 2. Router fonksiyonun içine tanımlandı

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Arka Plandaki Sahte Kamera Görüntüsü (Şimdilik Koyu Zemin) */}
      <View style={styles.cameraBackground}>
        <View style={styles.cameraOverlay} />
      </View>

      {/* Üst Kısım: Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.logoText}>PROMPT LENS</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="hdr-on" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Orta Kısım: Anime Modu Rozeti & Odak Vizörü */}
      <View style={styles.mainArea}>
        <BlurView intensity={30} tint="dark" style={styles.badge}>
          <MaterialIcons name="auto-awesome" size={16} color={colors.secondary} />
          <Text style={styles.badgeText}>ANİME MODU</Text>
        </BlurView>

        {/* Vizör (Odak Kareleri) */}
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <View style={styles.centerDot} />
        </View>
      </View>

      {/* Alt Kısım: Footer Kontrolleri (Cam Efektli Bottom Sheet) */}
      <BlurView intensity={50} tint="dark" style={styles.footer}>
        <View style={styles.usageTag}>
          <Text style={styles.usageText}>3/3 ücretsiz kullanım kaldı</Text>
        </View>

        {/* Prompt Giriş Alanı */}
        <View style={styles.inputContainer}>
          <MaterialIcons name="edit" size={20} color={colors.secondary} style={styles.inputIcon} />
          <TextInput 
            style={styles.textInput}
            placeholder="Sahneyi anlatın..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Butonlar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="photo-library" size={28} color={colors.textSecondary} />
            <Text style={styles.actionText}>Galeri</Text>
          </TouchableOpacity>

          {/* Deklanşör Butonu */}
          <TouchableOpacity style={styles.shutterContainer}>
            <View style={styles.shutterGlow} />
            <View style={styles.shutterButton}>
              <MaterialIcons name="camera" size={36} color={colors.background} />
            </View>
            <Text style={styles.shutterText}>Deklanşör</Text>
          </TouchableOpacity>

          {/* 3. "Geliştir" Butonuna Tıklanma (onPress) ve Yönlendirme Eklendi */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/subscription')}
          >
            <MaterialIcons name="auto-awesome" size={28} color={colors.textSecondary} />
            <Text style={styles.actionText}>Geliştir</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cameraBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0a0d14' },
  cameraOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  logoText: { color: colors.secondary, fontSize: 20, fontWeight: 'bold', letterSpacing: 1, textShadowColor: 'rgba(0,240,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  
  mainArea: { flex: 1, alignItems: 'center', paddingTop: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  badgeText: { color: colors.text, marginLeft: 8, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  
  viewfinder: { width: 280, height: 280, marginTop: 60, justifyContent: 'center', alignItems: 'center', opacity: 0.4 },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: colors.secondary, shadowColor: colors.secondary, shadowOpacity: 0.8, shadowRadius: 5 },
  topLeft: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 },
  topRight: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 },
  centerDot: { width: 8, height: 8, backgroundColor: colors.secondary, borderRadius: 4, shadowColor: colors.secondary, shadowOpacity: 1, shadowRadius: 10 },
  
  footer: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, alignItems: 'center', overflow: 'hidden', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  usageTag: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 16 },
  usageText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  
  inputContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 19, 25, 0.5)', borderRadius: 30, borderWidth: 1, borderColor: 'rgba(0,240,255,0.3)', marginBottom: 24 },
  inputIcon: { paddingLeft: 16 },
  textInput: { flex: 1, color: colors.text, padding: 16, fontSize: 14, fontFamily: 'monospace' },
  
  bottomBar: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 10 },
  actionButton: { alignItems: 'center', justifyContent: 'center', width: 64 },
  actionText: { color: colors.textSecondary, fontSize: 10, marginTop: 6, fontWeight: '600' },
  
  shutterContainer: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  shutterGlow: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: colors.secondary, opacity: 0.2, shadowColor: colors.secondary, shadowOpacity: 0.5, shadowRadius: 10 },
  shutterButton: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  shutterText: { color: colors.secondary, fontSize: 10, marginTop: 12, fontWeight: 'bold', letterSpacing: 1, textShadowColor: 'rgba(0,240,255,0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }
});