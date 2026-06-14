// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Dimensions, Animated, Easing, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import Slider from '@react-native-community/slider';
import * as ImageManipulator from 'expo-image-manipulator'; 
import { BlurView } from 'expo-blur';
import { segmentPortraitAPI } from '../src/services/aiService';

const SCREEN_WIDTH = Dimensions.get('window').width;

// PORTRE EKRANINA ÖZEL SİNEMATİK MERCAN VE KOYU KÜL TEMASI
const STUDIO_CORAL = '#FF6B6B';
const DARK_ASH = '#12121A';

export default function PortraitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = typeof params.imageUri === 'string' ? params.imageUri : null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [backgroundUri, setBackgroundUri] = useState(imageUri);
  const [subjectImage, setSubjectImage] = useState<string | null>(null); 
  const [blurAmount, setBlurAmount] = useState(10); 
  const viewShotRef = useRef(null);

  // PORTRE'YE ÖZEL LENS ODAKLAMA (FOCUS RING) ANİMASYONU
  const focusAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Odaklanma / Nefes alma efekti
    Animated.loop(
      Animated.sequence([
        Animated.timing(focusAnim, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(focusAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();

    // Dönen lens halkası efekti
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  useEffect(() => {
    if (imageUri && !subjectImage) { processImage(); }
  }, [imageUri]);

  const processImage = async () => {
    setIsProcessing(true);
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1080 } }], 
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const base64Data = await FileSystem.readAsStringAsync(manipResult.uri, { encoding: 'base64' });
      const imageBase64 = `data:image/jpeg;base64,${base64Data}`;
      
      const aiResult = await segmentPortraitAPI(imageBase64);
      
      if (aiResult?.status === "success") {
        setSubjectImage(aiResult.image);
      } else {
        alert("Portre modu şu an bu görselde çalışmadı. Farklı bir açıdan çekmeyi dene!");
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const savePortrait = async () => {
    setIsProcessing(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return alert("Galeri izni gerekli!");

      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      alert("🎉 Görsel kaydedildi!");
    } catch (e) { alert("Hata oluştu."); } finally { setIsProcessing(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* BULANIK BAŞLIK (HEADER) - PRO LOGOSU YOK */}
      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={styles.headerBlur}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={26} color="#E0E0E0" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>PORTRE</Text>
          
          {/* 🔥 HIZLI FİKS: Kaydet Butonunun çevresi BEYAZ çizgi oldu */}
          <TouchableOpacity 
              onPress={savePortrait} 
              style={[styles.saveHeaderButton, (!subjectImage || isProcessing) && styles.saveHeaderButtonDisabled]} 
              disabled={!subjectImage || isProcessing}
          >
              <MaterialIcons name="save-alt" size={16} color={(!subjectImage || isProcessing) ? '#8A8D9E' : STUDIO_CORAL} style={{ marginRight: 4 }} />
              <Text style={[styles.saveHeaderText, (!subjectImage || isProcessing) && styles.saveHeaderTextDisabled]}>KAYDET</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      <View style={styles.content}>
        
        {/* FOTOĞRAF ALANI (Tam Merkezde) */}
        <View style={styles.resultContainer}>
            <View style={styles.previewWrapper}>
                <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1.0 }} style={styles.previewContainer}>
                  
                  {/* KATMAN 1: Arka Plan (Bulanıklaşan Katman) */}
                  {backgroundUri && (
                    <Image 
                      source={{ uri: backgroundUri }} 
                      style={styles.fullImage} 
                      blurRadius={blurAmount} 
                    />
                  )}
                  
                  {/* KATMAN 2: Ön Plan (Keskin Kalan Katman) */}
                  {subjectImage && (
                    <Image source={{ uri: subjectImage }} style={[styles.fullImage, { position: 'absolute' }]} />
                  )}
                </ViewShot>
            </View>
        </View>

        {/* 🔥 HIZLI FİKS: Lens Odaklama Animasyonu ve Yazısı BEYAZ yapıldı */}
        {isProcessing && (
          <BlurView intensity={80} tint="dark" style={styles.loaderOverlay}>
             <View style={styles.processingCoreWrapper}>
                {/* 🔥 HIZLI FİKS: Lens Dış Halkası BEYAZ */}
                <Animated.View style={[styles.lensRing, { transform: [{ rotate }] }]} />
                {/* 🔥 HIZLI FİKS: Odaklanan İç Kısım BEYAZ */}
                <Animated.View style={[styles.lensFocus, { transform: [{ scale: focusAnim }] }]} />
                {/* 🔥 HIZLI FİKS: Merkez İkon BEYAZ */}
                <MaterialIcons name="center-focus-strong" size={40} color="#FFF" style={{ position: 'absolute' }} />
             </View>
             {/* 🔥 HIZLI FİKS: Yazı BEYAZ */}
             <Text style={styles.processingText}>Derinlik Algılanıyor..</Text>
          </BlurView>
        )}

      </View>

      {/* ALT MENÜ (Bulanıklık Ayarı Slider'ı) */}
      {subjectImage && !isProcessing && (
        <View style={styles.footerContainer}>
           <BlurView intensity={70} tint="dark" style={styles.controlPanel}>
              <View style={styles.dockHandle} />
              <Text style={styles.label}>Arka Plan Bulanıklığı (Bokeh)</Text>
              
              <View style={styles.sliderRow}>
                <MaterialIcons name="blur-off" size={20} color="#8A8D9E" />
                <Slider
                  style={{flex: 1, height: 40, marginHorizontal: 10}}
                  minimumValue={0}
                  maximumValue={20}
                  value={blurAmount}
                  onValueChange={setBlurAmount}
                  minimumTrackTintColor={STUDIO_CORAL}
                  maximumTrackTintColor="rgba(255,255,255,0.2)"
                  thumbTintColor={STUDIO_CORAL}
                />
                <MaterialIcons name="blur-on" size={24} color={STUDIO_CORAL} />
              </View>
           </BlurView>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_ASH }, 
  
  headerBlur: { width: '100%', position: 'absolute', top: 0, zIndex: 10 },
// 🔥 ÇÖZÜM: Menüyü çentikten kurtarmak için iOS'ta 60, Android'de 45 piksel boşluk bıraktık.
  // paddingVertical yerine paddingBottom kullandık ki üst boşlukla çakışmasın.
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, paddingTop: Platform.OS === 'ios' ? 60 : 45 },  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  
  // 🔥 YENİ: Kaydet Butonunun çevresi BEYAZ çizgi oldu (Hizalandı)
  saveHeaderButton: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFF', shadowColor: STUDIO_CORAL, shadowOpacity: 0.3, shadowRadius: 5 },
  saveHeaderButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)', shadowOpacity: 0 },
  saveHeaderText: { color: STUDIO_CORAL, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  saveHeaderTextDisabled: { color: '#8A8D9E' },

  content: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative' },
  
  resultContainer: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', paddingBottom: 100 }, 
  previewWrapper: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 20, elevation: 10 },
  previewContainer: { width: SCREEN_WIDTH * 0.9, height: (SCREEN_WIDTH * 0.9) * 1.33, backgroundColor: '#000' },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  // LENS ANİMASYONU STİLLERİ (HIZLI FİKS)
  loaderOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 20 },
  processingCoreWrapper: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center' },
  // 🔥 YENİ: Lens Dış Halkası BEYAZ
  lensRing: { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFF', borderStyle: 'dashed' },
  // 🔥 YENİ: Odaklanan İç Kısım BEYAZ
  lensFocus: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF', opacity: 0.2 },
  // 🔥 YENİ: Yazı BEYAZ
  processingText: { color: '#FFF', marginTop: 25, fontSize: 15, fontWeight: '800', letterSpacing: 1, textShadowColor: '#FFF', textShadowRadius: 10 },

  // ALT MENÜ STİLLERİ
  footerContainer: { position: 'absolute', bottom: 0, width: '100%', zIndex: 5 },
  controlPanel: { width: '100%', padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderTopLeftRadius: 35, borderTopRightRadius: 35, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  dockHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  
  label: { color: '#FFF', fontWeight: '800', marginBottom: 20, fontSize: 15, letterSpacing: 1 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }
});