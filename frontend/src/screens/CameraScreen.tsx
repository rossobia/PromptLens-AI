import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Button, Image, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { useRouter } from 'expo-router';
import { analyzePrompt } from '../services/aiService'; 
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen() {
  const router = useRouter();
  const [promptText, setPromptText] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  
  // Arayüz yüklenme ve sonuç durumları
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);

  // Görüntüyü yakalayıp Backend'e gönderen ana fonksiyon
  const handleCaptureAndProcess = async () => {
    if (!cameraRef.current) return;
    if (!promptText.trim()) {
        alert("Lütfen önce sahneyi nasıl hayal ettiğinizi yazın! (Örn: anime)");
        return;
    }

    setIsProcessing(true); // Yükleniyor ekranını aç

    try {
      console.log("📸 Fotoğraf çekiliyor...");
      const options = { quality: 0.7, base64: true };
      const photo = await cameraRef.current.takePictureAsync(options);
      
      const base64Image = `data:image/jpeg;base64,${photo.base64}`;
      console.log("✅ Fotoğraf yakalandı ve Base64 formatına çevrildi.");

      console.log(`📡 Resim backend'e gönderiliyor. İstek: "${promptText}"`);
      const aiResult = await analyzePrompt(promptText, base64Image);

      if (aiResult && aiResult.status === "success" && aiResult.image) {
          console.log("🛬 Filtreli resim başarıyla teslim alındı!");
          setProcessedImage(aiResult.image); // Ekrana gelen filtreli resmi basıyoruz
      } else {
          alert("Yapay zeka resmi işleyemedi, lütfen tekrar deneyin.");
          console.log("❌ Backend yanıt hatası:", aiResult);
      }

    } catch (error) {
      console.error("İşlem sırasında hata:", error);
      alert("Bağlantı hatası oluştu.");
    } finally {
      setIsProcessing(false); // Yükleniyor ekranını kapat
    }
  };

  if (!permission) return <View style={styles.container} />;
  
  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white', marginBottom: 20 }}>Kamerayı kullanmak için izninize ihtiyacımız var.</Text>
        <Button onPress={requestPermission} title="İzin Ver" />
      </View>
    );
  }

  // Yapay zeka işlemi bittiyse gösterilecek filtreli Sonuç Ekranı
  if (processedImage) {
      return (
          <SafeAreaView style={styles.container}>
              <Image source={{ uri: processedImage }} style={StyleSheet.absoluteFillObject} />
              <View style={styles.resultHeader}>
                  <TouchableOpacity onPress={() => setProcessedImage(null)} style={styles.iconButton}>
                      <MaterialIcons name="close" size={28} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.logoText}>SONUÇ</Text>
                  <View style={{width: 44}} /> 
              </View>
              <BlurView intensity={50} tint="dark" style={[styles.footer, { position: 'absolute', bottom: 0, width: '100%' }]}>
                  <TouchableOpacity style={[styles.actionButton, { width: 200, backgroundColor: colors.secondary, borderRadius: 20, padding: 12 }]} >
                      <Text style={[styles.actionText, { color: colors.background, fontSize: 16, marginTop: 0 }]}>Galeriye Kaydet</Text>
                  </TouchableOpacity>
              </BlurView>
          </SafeAreaView>
      )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back">
            <View style={styles.cameraOverlay} />
        </CameraView>

        {/* Yükleniyor (Processing) Katmanı */}
        {isProcessing && (
            <BlurView intensity={80} tint="dark" style={styles.processingOverlay}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={styles.processingText}>Yapay Zeka Sahneyi Çiziyor...</Text>
            </BlurView>
        )}

        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="menu" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.logoText}>PROMPT LENS</Text>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="hdr-on" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.mainArea}>
          <BlurView intensity={30} tint="dark" style={[styles.badge, { borderColor: 'rgba(0,240,255,0.5)' }]}>
            <MaterialIcons name="check-circle" size={16} color="#00FF00" />
            <Text style={styles.badgeText}>AI MOTORU AKTİF</Text>
          </BlurView>
          
          {!isProcessing && (
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                <View style={styles.centerDot} />
              </View>
          )}
        </View>

        <BlurView intensity={50} tint="dark" style={styles.footer}>
          <View style={styles.usageTag}>
            <Text style={styles.usageText}>3/3 ücretsiz kullanım kaldı</Text>
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="edit" size={20} color={colors.secondary} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput}
              placeholder="Sahneyi anlatın..."
              placeholderTextColor={colors.textSecondary}
              value={promptText}
              onChangeText={setPromptText}
              editable={!isProcessing} 
            />
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialIcons name="photo-library" size={28} color={colors.textSecondary} />
              <Text style={styles.actionText}>Galeri</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shutterContainer} onPress={handleCaptureAndProcess} disabled={isProcessing}>
              <View style={styles.shutterGlow} />
              <View style={styles.shutterButton}>
                <MaterialIcons name="camera" size={36} color={colors.background} />
              </View>
              <Text style={styles.shutterText}>Deklanşör</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/subscription')}>
              <MaterialIcons name="auto-awesome" size={28} color={colors.textSecondary} />
              <Text style={styles.actionText}>Geliştir</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cameraOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  processingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, justifyContent: 'center', alignItems: 'center' },
  processingText: { color: colors.secondary, marginTop: 16, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  resultHeader: { position: 'absolute', top: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  iconButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
  logoText: { color: colors.secondary, fontSize: 20, fontWeight: 'bold', letterSpacing: 1, textShadowColor: 'rgba(0,240,255,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  mainArea: { flex: 1, alignItems: 'center', paddingTop: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
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