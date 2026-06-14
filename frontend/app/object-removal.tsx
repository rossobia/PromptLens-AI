// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Dimensions, PanResponder, Pressable, Animated, Easing, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import Svg, { Path, Defs, Mask, G, Rect } from 'react-native-svg';
import ViewShot from 'react-native-view-shot';
import { BlurView } from 'expo-blur';
import { removeObjectWithMask } from '../src/services/aiService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CANVAS_SIZE = SCREEN_WIDTH; 

const PREMIUM_GOLD = '#FFA500';
const PREMIUM_GOLD_TEXT = '#0D0E15'; 
const NEON_MINT_GLOW = '#00FFA3';

export default function ObjectRemovalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialImageUri = typeof params.imageUri === 'string' ? params.imageUri : null;

  const [currentBaseImage, setCurrentBaseImage] = useState(initialImageUri);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [currentMode, setCurrentMode] = useState<'draw' | 'erase'>('draw');
  const [paths, setPaths] = useState<{ path: string; mode: 'draw' | 'erase' }[]>([]);
  const [currentPath, setCurrentPath] = useState('');

  const imageShotRef = useRef(null);
  const maskShotRef = useRef(null);

  const currentPathRef = useRef('');
  const modeRef = useRef<'draw' | 'erase'>('draw');
  modeRef.current = currentMode;

  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
// 🔥 ÇÖZÜM: Animasyonları sadece yükleme işlemi (isProcessing) başladığında tetikliyoruz
  useEffect(() => {
    if (isProcessing) {
      // Önce değerleri sıfırla ki kaldığı yerden atlayarak başlamasın
      spinAnim.setValue(0);
      pulseAnim.setValue(1);

      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      // İşlem bitince animasyonları durdur (Performans tasarrufu)
      spinAnim.stopAnimation();
      pulseAnim.stopAnimation();
    }
  }, [isProcessing]); // 👈 isProcessing her değiştiğinde burası çalışır

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const startPoint = `M${locationX},${locationY}`;
        currentPathRef.current = startPoint;
        setCurrentPath(startPoint);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const nextPoint = `${currentPathRef.current} L${Math.round(locationX)},${Math.round(locationY)}`;
        currentPathRef.current = nextPoint;
        setCurrentPath(nextPoint);
      },
      onPanResponderRelease: () => {
        if (currentPathRef.current) {
          const savedPath = currentPathRef.current;
          const savedMode = modeRef.current;
          setPaths((prev) => [...prev, { path: savedPath, mode: savedMode }]);
        }
        currentPathRef.current = '';
        setCurrentPath('');
      },
    })
  ).current;

  const handleClear = () => {
    setPaths([]);
    setCurrentPath('');
    setCurrentMode('draw');
  };

  const handleRemove = async () => {
    if (paths.filter(p => p.mode === 'draw').length === 0) {
      alert("Lütfen önce silinecek nesnenin üzerini boyayın!");
      return;
    }

    setIsProcessing(true);
    try {
      const capturedImageUri = await imageShotRef.current.capture();
      const capturedMaskUri = await maskShotRef.current.capture();

      const imageBase64Data = await FileSystem.readAsStringAsync(capturedImageUri, { encoding: 'base64' });
      const maskBase64Data = await FileSystem.readAsStringAsync(capturedMaskUri, { encoding: 'base64' });

      const imageBase64 = `data:image/jpeg;base64,${imageBase64Data}`;
      const maskBase64 = `data:image/jpeg;base64,${maskBase64Data}`;

      const aiResult = await removeObjectWithMask(imageBase64, maskBase64);

      if (aiResult?.status === "success") {
        setProcessedImage(aiResult.image);
      } else {
        alert("Yapay zeka nesneyi silemedi.");
      }
    } catch (error) {
      console.error("Hata Detayı:", error);
      alert("İşlem sırasında hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!processedImage) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert("Galeriye kaydetmek için izin vermeniz gerekiyor!");
        return;
      }
      
      const base64Code = processedImage.split(',')[1];
      const filename = FileSystem.documentDirectory + `SihirliSilgi_${Date.now()}.jpg`;
      
      await FileSystem.writeAsStringAsync(filename, base64Code, { encoding: 'base64' });
      await MediaLibrary.saveToLibraryAsync(filename);
      Alert.alert("🎉 Görsel kaydedildi!");
    } catch (error) {
      console.error(error);
      alert("Hata oluştu.");
    }
  };

  const handleContinueEditing = () => {
    setCurrentBaseImage(processedImage);
    setProcessedImage(null);
    handleClear();
  };

  const handleRevertToOriginal = () => {
    setCurrentBaseImage(initialImageUri);
    setProcessedImage(null);
    handleClear();
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* BAŞLIK (HEADER) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color="#E0E0E0" />
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
            <Text style={styles.headerTitle}>SİHİRLİ SİLGİ</Text>
            <View style={styles.proBadge}>
               <Text style={styles.proBadgeText}>PRO</Text>
            </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
         {!processedImage ? (
            <View style={styles.canvasWrapper}>
                <View style={styles.canvasContainer}>
                   <View style={{ position: 'absolute', left: -9999 }}>
                      <ViewShot ref={maskShotRef} options={{ format: "jpg", quality: 0.9 }} style={styles.exactCanvas}>
                         <View style={[styles.exactCanvas, { backgroundColor: 'black' }]}>
                            <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}>
                               {paths.map((p, i) => (
                                 <Path key={i} d={p.path} stroke={p.mode === 'draw' ? 'white' : 'black'} strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                               ))}
                               {currentPath ? (
                                 <Path d={currentPath} stroke={modeRef.current === 'draw' ? 'white' : 'black'} strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                               ) : null}
                            </Svg>
                         </View>
                      </ViewShot>
                   </View>

                   <ViewShot ref={imageShotRef} options={{ format: "jpg", quality: 0.9 }} style={styles.exactCanvas}>
                      {currentBaseImage && (
                         <Image source={{ uri: currentBaseImage }} style={styles.exactImage} onLoadEnd={() => setIsImageLoading(false)} />
                      )}
                   </ViewShot>

                   <View {...panResponder.panHandlers} style={styles.drawOverlay}>
                      <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}>
                         <Defs>
                            <Mask id="eraserMask">
                               <Rect width={CANVAS_SIZE} height={CANVAS_SIZE} fill="white" />
                               {paths.filter(p => p.mode === 'erase').map((p, i) => (
                                  <Path key={i} d={p.path} stroke="black" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                               ))}
                               {currentMode === 'erase' && currentPath ? (
                                  <Path d={currentPath} stroke="black" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                               ) : null}
                            </Mask>
                         </Defs>
                         <G mask="url(#eraserMask)">
                            {paths.filter(p => p.mode === 'draw').map((p, i) => (
                               <Path key={i} d={p.path} stroke="rgba(255, 50, 50, 0.6)" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            ))}
                            {currentMode === 'draw' && currentPath ? (
                               <Path d={currentPath} stroke="rgba(255, 50, 50, 0.6)" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            ) : null}
                         </G>
                      </Svg>
                   </View>
                </View>
            </View>
         ) : (
            /* ÜRETİM SONRASI SONUÇ EKRANI */
            <View style={styles.resultContainer}>
                <View style={styles.imageWrapper}>
                    <Pressable 
                        onPressIn={() => setShowOriginal(true)} 
                        onPressOut={() => setShowOriginal(false)}
                        style={StyleSheet.absoluteFill}
                    >
                        <Image source={{ uri: showOriginal ? currentBaseImage : processedImage }} style={styles.resultImage} />
                        
                        {/* SADECE ORİJİNAL BADGE KALDI */}
                        {showOriginal && (
                            <View style={styles.originalBadge}>
                                <Text style={styles.originalBadgeText}>ORİJİNAL</Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>
         )}
      </View>

      {/* ALT MENÜLER */}
      <View style={styles.footerContainer}>
          {processedImage ? (
             <BlurView intensity={70} tint="dark" style={styles.resultDock}>
                <View style={styles.dockHandle} />
                
                {/* 🔥 YENİ: BASILI TUTMA UYARISI BURAYA TAŞINDI */}
                <View style={styles.compareHintWrapper}>
                    <MaterialIcons name="touch-app" size={16} color="#8A8D9E" />
                    <Text style={styles.compareHintText}>Orijinal hali görmek için görsele basılı tutun.</Text>
                </View>
                
                {/* 🔥 YENİ: SİMETRİK VE EŞİT BOYUTLU BUTONLAR */}
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={handleContinueEditing} style={styles.actionButtonHalfGold}>
                        <MaterialIcons name="edit" size={18} color={PREMIUM_GOLD_TEXT} />
                        <Text style={styles.actionTextHalfGold}>Devam Et</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={handleRevertToOriginal} style={styles.actionButtonHalfDanger}>
                        <MaterialIcons name="restore" size={18} color="#FF3366" />
                        <Text style={styles.actionTextHalfDanger}>Geri Al</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleSaveToGallery} style={styles.saveButton}>
                    <MaterialIcons name="file-download" size={20} color= "#FF3366" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Görseli Kaydet</Text>
                </TouchableOpacity>
             </BlurView>
          ) : (
             <View style={styles.drawFooter}>
                <BlurView intensity={60} tint="dark" style={styles.toolbarGlass}>
                   <TouchableOpacity style={[styles.toolButton, currentMode === 'draw' && styles.activeToolButtonDraw]} onPress={() => setCurrentMode('draw')}>
                      <MaterialIcons name="brush" size={24} color={currentMode === 'draw' ? '#FFF' : '#8A8D9E'} />
                      <Text style={[styles.toolText, currentMode === 'draw' && styles.activeToolText]}>Fırça</Text>
                   </TouchableOpacity>

                   <TouchableOpacity style={[styles.toolButton, currentMode === 'erase' && styles.activeToolButtonErase]} onPress={() => setCurrentMode('erase')}>
                      <MaterialIcons name="cleaning-services" size={24} color={currentMode === 'erase' ? '#0D0E15' : '#8A8D9E'} />
                      <Text style={[styles.toolText, currentMode === 'erase' && styles.activeToolText]}>Silgi</Text>
                   </TouchableOpacity>

                   <TouchableOpacity style={styles.toolButtonDanger} onPress={handleClear}>
                      <MaterialIcons name="delete-sweep" size={24} color="#FF3366" />
                   </TouchableOpacity>
                </BlurView>

                <TouchableOpacity onPress={handleRemove} style={styles.removeButton} disabled={isProcessing} activeOpacity={0.8}>
                   <Text style={styles.removeButtonText}>BOYANAN ALANI SİL</Text>
                   <MaterialIcons name="auto-fix-high" size={22} color="#0D0E15" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
             </View>
          )}
      </View>

      {/* YÜKLEME EKRANI */}
      {isProcessing && (
        <BlurView intensity={100} tint="dark" style={styles.processingOverlay}>
          <View style={styles.processingCoreWrapper}>
              <Animated.View style={[styles.glowWhite, { transform: [{ scale: pulseAnim }] }]} />
              <Animated.View style={[styles.scanningRingWhite, { transform: [{ rotate: spin }] }]} />
              <MaterialIcons name="auto-fix-high" size={48} color="#FFF" style={{ zIndex: 10, textShadowColor: '#FFF', textShadowRadius: 10 }} />
          </View>
          <Text style={styles.processingTextWhite}>Nesne Siliniyor..</Text>
        </BlurView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0E15' }, 
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 40 : 16 },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleWrapper: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  proBadge: { backgroundColor: '#FFD700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8, shadowColor: PREMIUM_GOLD, shadowOpacity: 0.5, shadowRadius: 5 }, 
  proBadgeText: { color: PREMIUM_GOLD_TEXT, fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  content: { flex: 1, width: '100%', justifyContent: 'center' },
  
  canvasWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  canvasContainer: { width: CANVAS_SIZE, height: CANVAS_SIZE, position: 'relative', backgroundColor: '#161821', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  exactCanvas: { width: CANVAS_SIZE, height: CANVAS_SIZE, backgroundColor: '#000' },
  exactImage: { width: CANVAS_SIZE, height: CANVAS_SIZE, resizeMode: 'cover' },
  drawOverlay: { position: 'absolute', top: 0, left: 0, width: CANVAS_SIZE, height: CANVAS_SIZE, zIndex: 10 },
  
  resultContainer: { flex: 1, width: '100%', backgroundColor: '#000', flexDirection: 'column' }, 
  imageWrapper: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  resultImage: { width: '100%', height: '100%', resizeMode: 'contain' }, 

  originalBadge: { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: "#FF3366", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, shadowColor: PREMIUM_GOLD, shadowOpacity: 0.5, shadowRadius: 5 },
  originalBadgeText: { color: PREMIUM_GOLD_TEXT, fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  footerContainer: { width: '100%' },
  
  drawFooter: { padding: 20, alignItems: 'center', width: '100%', paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  toolbarGlass: { flexDirection: 'row', borderRadius: 25, padding: 8, marginBottom: 20, width: '100%', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  toolButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 18, flexDirection: 'row', gap: 6, flex: 1 },
  activeToolButtonDraw: { backgroundColor: '#ff4444', shadowColor: '#ff4444', shadowOpacity: 0.4, shadowRadius: 10 },
  activeToolButtonErase: { backgroundColor: '#00E5FF' }, 
  toolText: { color: '#8A8D9E', fontSize: 14, fontWeight: '700' },
  activeToolText: { color: '#0D0E15', fontWeight: '900' },
  toolButtonDanger: { padding: 12, paddingHorizontal: 20, borderRadius: 18, backgroundColor: 'rgba(255, 51, 102, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 51, 102, 0.3)', marginLeft: 8 },
  
  removeButton: { flexDirection: 'row', backgroundColor: NEON_MINT_GLOW, padding: 18, borderRadius: 25, width: '100%', justifyContent: 'center', alignItems: 'center', shadowColor: NEON_MINT_GLOW, shadowOpacity: 0.5, shadowRadius: 15, elevation: 8 },
  removeButtonText: { color: '#0D0E15', fontWeight: '900', fontSize: 16, letterSpacing: 1 },

  resultDock: { width: '100%', padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderTopLeftRadius: 35, borderTopRightRadius: 35, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  dockHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  
  // 🔥 YENİ: BASILI TUTUN UYARISI
  compareHintWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 8, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  compareHintText: { color: '#8A8D9E', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 15 },
  
  // 🔥 YENİ: SİMETRİK BUTONLAR (DEVAM ET VE İPTAL)
  actionButtonHalfGold: { flex: 1, flexDirection: 'row', backgroundColor: PREMIUM_GOLD, paddingVertical: 16, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 6, shadowColor: PREMIUM_GOLD, shadowOpacity: 0.3, shadowRadius: 10, gap: 4 },
  actionTextHalfGold: { color: PREMIUM_GOLD_TEXT, fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  
  actionButtonHalfDanger: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(255, 51, 102, 0.1)', paddingVertical: 16, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 6, borderWidth: 1, borderColor: 'rgba(255, 51, 102, 0.3)', gap: 4 },
  actionTextHalfDanger: { color: '#FF3366', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  
  saveButton: { width: '100%', flexDirection: 'row', backgroundColor: "#ffffff" , padding: 18, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: PREMIUM_GOLD, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  saveButtonText: { color: PREMIUM_GOLD_TEXT, fontWeight: '900', fontSize: 16, letterSpacing: 1 },

  processingOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  processingCoreWrapper: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
  glowWhite: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF', opacity: 0.25 },
  scanningRingWhite: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#FFF', borderStyle: 'dashed', opacity: 0.6 },
  processingTextWhite: { color: '#FFF', marginTop: 30, fontSize: 16, fontWeight: '800', letterSpacing: 1, textShadowColor: '#FFF', textShadowRadius: 10 }
});