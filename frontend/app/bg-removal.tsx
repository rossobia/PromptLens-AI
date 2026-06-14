// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Dimensions, Animated, Easing, Platform, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import * as ImageManipulator from 'expo-image-manipulator'; 
import { BlurView } from 'expo-blur';
import { removeBackgroundAPI } from '../src/services/aiService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CANVAS_SIZE = Math.floor(SCREEN_WIDTH); 

const CYBER_BLUE = '#00E5FF';
const DARK_NAVY = '#0A0F1A';

export default function BackgroundRemovalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = typeof params.imageUri === 'string' ? params.imageUri : null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<'transparent' | 'black' | 'white'>('transparent');
  const [showOriginal, setShowOriginal] = useState(false);
  const viewShotRef = useRef(null);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60]
  });

  useEffect(() => {
    if (imageUri && !processedImage) {
      processImage();
    }
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
      
      const aiResult = await removeBackgroundAPI(imageBase64);
      if (aiResult?.status === "success") {
        setProcessedImage(aiResult.image); 
      } else {
        alert("Arka plan silinemedi. (Yapay zeka motoru yanıt vermedi)");
      }
    } catch (error) {
      console.error(error);
      alert("İşlem sırasında bağlantı hatası oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToGallery = async () => {
    if (!processedImage) return;
    try {
      setIsProcessing(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return alert("Galeri izni gerekli!");
      
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      alert("🎉 Görsel kaydedildi!");
    } catch (error) {
      alert("Hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* BULANIK BAŞLIK (HEADER) */}
      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={styles.headerBlur}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <MaterialIcons name="arrow-back" size={26} color="#E0E0E0" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>ARKA PLAN</Text>
            
            <TouchableOpacity 
                onPress={saveToGallery} 
                style={[styles.saveHeaderButton, (!processedImage || isProcessing) && styles.saveHeaderButtonDisabled]} 
                disabled={!processedImage || isProcessing}
            >
                <MaterialIcons name="save-alt" size={16} color={(!processedImage || isProcessing) ? '#8A8D9E' : CYBER_BLUE} style={{ marginRight: 4 }} />
                <Text style={[styles.saveHeaderText, (!processedImage || isProcessing) && styles.saveHeaderTextDisabled]}>KAYDET</Text>
            </TouchableOpacity>
          </View>
      </BlurView>

      <View style={styles.content}>
        {processedImage ? (
            /* 🔥 ÇÖZÜM: paddingBottom ile fotoğraf menünün üzerinde, tam ortada hizalandı */
            <View style={[styles.resultContainer, { paddingBottom: 160 }]}>
                <View style={styles.imageWrapper}>
                    <Pressable 
                        onPressIn={() => setShowOriginal(true)} 
                        onPressOut={() => setShowOriginal(false)}
                        style={{ alignItems: 'center', justifyContent: 'center' }}
                    >
                        <View style={[styles.canvasWrapper, { backgroundColor: bgColor === 'transparent' ? '#161821' : bgColor }]}>
                            {bgColor === 'transparent' && (
                                <View style={styles.transparentGridPattern}>
                                    <MaterialIcons name="grid-on" size={CANVAS_SIZE} color="rgba(255,255,255,0.03)" style={{ position: 'absolute' }} />
                                </View>
                            )}

                            <ViewShot 
                                ref={viewShotRef} 
                                collapsable={false}
                                renderToHardwareTextureAndroid={true} 
                                options={{ format: bgColor === 'transparent' ? "png" : "jpg", quality: 1.0 }} 
                                style={{ 
                                    width: CANVAS_SIZE, 
                                    height: CANVAS_SIZE, 
                                    backgroundColor: bgColor === 'transparent' ? 'transparent' : bgColor,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}
                            >
                                <Image source={{ uri: processedImage }} style={styles.exactImage} />

                                {/* 🔥 HATA BURADAYDI: Çerçeve kodu ViewShot'ın İÇİNE geri alındı */}
                                {bgColor !== 'transparent' && (
                                    <View style={[StyleSheet.absoluteFillObject, { borderWidth: 3, borderColor: bgColor, zIndex: 10 }]} />
                                )}
                            </ViewShot>
                        </View>
                        
                        {showOriginal && (
                            <View style={styles.originalBadge}>
                                <Text style={styles.originalBadgeText}>ORİJİNAL</Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>
        ) : (
            <View style={[styles.canvasWrapper, { backgroundColor: '#161821' }]}>
               {imageUri && <Image source={{ uri: imageUri }} style={styles.exactImage} blurRadius={isProcessing ? 10 : 0} />}
            </View>
        )}

        {isProcessing && (
            <BlurView intensity={80} tint="dark" style={styles.processingOverlay}>
               <View style={styles.processingCoreWrapper}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }], zIndex: 10 }}>
                      <MaterialIcons name="content-cut" size={48} color={CYBER_BLUE} style={{ textShadowColor: CYBER_BLUE, textShadowRadius: 15 }} />
                  </Animated.View>
                  
                  <Animated.View style={[styles.laserScanner, { transform: [{ translateY: scanTranslateY }] }]} />
               </View>
               <Text style={styles.processingText}>Arka Plan Kaldırılıyor..</Text>
            </BlurView>
        )}
      </View>

      {processedImage && !isProcessing && (
          <View style={styles.footerContainer}>
            <BlurView intensity={70} tint="dark" style={styles.footerDock}>
                <View style={styles.dockHandle} />
                <Text style={styles.footerTitle}>Arka Plan Rengi</Text>
                
                <View style={styles.colorOptionsRow}>
                   <TouchableOpacity style={[styles.colorPill, bgColor === 'transparent' && styles.activeColorPillTransparent]} onPress={() => setBgColor('transparent')}>
                      <View style={[styles.colorCircle, { backgroundColor: '#2A2D3A' }]}>
                         <MaterialIcons name="texture" size={18} color="#8A8D9E" />
                      </View>
                      <Text style={[styles.colorText, bgColor === 'transparent' && styles.activeColorTextTransparent]}>Şeffaf</Text>
                   </TouchableOpacity>

                   <TouchableOpacity style={[styles.colorPill, bgColor === 'black' && styles.activeColorPillBlack]} onPress={() => setBgColor('black')}>
                      <View style={[styles.colorCircle, { backgroundColor: '#000', borderWidth: 1, borderColor: '#333' }]} />
                      <Text style={[styles.colorText, bgColor === 'black' && styles.activeColorTextWhite]}>Siyah</Text>
                   </TouchableOpacity>

                   <TouchableOpacity style={[styles.colorPill, bgColor === 'white' && styles.activeColorPillWhite]} onPress={() => setBgColor('white')}>
                      <View style={[styles.colorCircle, { backgroundColor: '#FFF' }]} />
                      <Text style={[styles.colorText, bgColor === 'white' && styles.activeColorTextBlack]}>Beyaz</Text>
                   </TouchableOpacity>
                </View>
            </BlurView>
          </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_NAVY }, 
  
  headerBlur: { width: '100%', position: 'absolute', top: 0, zIndex: 10 },
// 🔥 ÇÖZÜM: Menüyü çentikten kurtarmak için iOS'ta 60, Android'de 45 piksel boşluk bıraktık.
  // paddingVertical yerine paddingBottom kullandık ki üst boşlukla çakışmasın.
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, paddingTop: Platform.OS === 'ios' ? 60 : 45 },  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  
  saveHeaderButton: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: CYBER_BLUE, shadowColor: CYBER_BLUE, shadowOpacity: 0.3, shadowRadius: 5 },
  saveHeaderButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.1)', shadowOpacity: 0 },
  saveHeaderText: { color: CYBER_BLUE, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  saveHeaderTextDisabled: { color: '#8A8D9E' },

  content: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative' },
  
  canvasWrapper: { width: CANVAS_SIZE, height: CANVAS_SIZE, overflow: 'hidden', borderRadius: 20 }, 
  transparentGridPattern: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: -1 },
  exactImage: { width: '100%', height: '100%', resizeMode: 'contain' }, 
  
  processingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 20, borderRadius: 20 },
  processingCoreWrapper: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: 20, backgroundColor: 'rgba(0, 229, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  laserScanner: { position: 'absolute', width: '100%', height: 3, backgroundColor: '#FFF', shadowColor: CYBER_BLUE, shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  processingText: { color: '#FFF', marginTop: 30, fontSize: 15, fontWeight: '800', letterSpacing: 1, textShadowColor: CYBER_BLUE, textShadowRadius: 10 },
  
  resultContainer: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }, 
  imageWrapper: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  
  originalBadge: { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: CYBER_BLUE, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, shadowColor: CYBER_BLUE, shadowOpacity: 0.5, shadowRadius: 5 },
  originalBadgeText: { color: DARK_NAVY, fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  footerContainer: { position: 'absolute', bottom: 0, width: '100%', zIndex: 5 },
  footerDock: { width: '100%', padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderTopLeftRadius: 35, borderTopRightRadius: 35, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  dockHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  
  footerTitle: { color: '#FFF', fontWeight: '800', marginBottom: 20, fontSize: 15, letterSpacing: 1 },
  colorOptionsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 },
  
  colorPill: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  colorCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  colorText: { color: '#8A8D9E', fontSize: 13, fontWeight: '700' },

  activeColorPillTransparent: { backgroundColor: 'rgba(0, 229, 255, 0.1)', borderColor: CYBER_BLUE, shadowColor: CYBER_BLUE, shadowOpacity: 0.2, shadowRadius: 10 },
  activeColorTextTransparent: { color: CYBER_BLUE, fontWeight: '900' },
  
  activeColorPillBlack: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: '#FFF' },
  activeColorTextWhite: { color: '#FFF', fontWeight: '900' },
  
  activeColorPillWhite: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#FFF' },
  activeColorTextBlack: { color: '#FFF', fontWeight: '900' },
});