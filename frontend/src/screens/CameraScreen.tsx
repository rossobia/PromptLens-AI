// @ts-nocheck
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Button, Image, ActivityIndicator, ScrollView, Dimensions, Animated, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker'; 
import * as MediaLibrary from 'expo-media-library';
import { GestureHandlerRootView, PinchGestureHandler, TapGestureHandler, FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';
import Svg, { Defs, Filter, FeColorMatrix, Image as SvgImage } from 'react-native-svg';
import { getSmartFilterParameters } from '../services/aiService'; 
import ViewShot from 'react-native-view-shot';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// 🔥 MÜKEMMEL ODAKLANMA MOTORU: Kullanıcı bu ekrana geri döndüğü salise çalışır


const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = 80; 
const CENTER_PADDING = (SCREEN_WIDTH - ITEM_WIDTH) / 2; 

const NEON_CYAN = '#00F0FF';
const DARK_TITANIUM = '#0B0C10';
const SOFT_GRAY = '#8A8D9E';
const PRO_GOLD = '#FFD700';

const APP_MODES = [
  { id: 'remove', name: 'Sihirli Silgi', icon: 'auto-fix-high', isPro: true },
  { id: 'bgremove', name: 'Arka Plan', icon: 'flip-to-back', isPro: false }, 
  { id: 'portrait', name: 'Portre', icon: 'portrait', isPro: false },
  { id: 'photo', name: 'Kamera', icon: 'camera-alt', isPro: false },
  { id: 'imagine', name: 'Hayal Et', icon: 'auto-awesome', isPro: true },
  { id: 'studio', name: 'Stüdyo', icon: 'color-lens', isPro: false },
  
];

const ZOOM_LEVELS = [
  { label: '0.5x', value: 0 },
  { label: '1x', value: 0.1 }, 
  { label: '2x', value: 0.3 }  
];

const LIVE_FILTERS = [
  { id: 'normal', name: 'Orijinal', tint: 'transparent', thumbColor: '#555' },
  { id: 'smart', name: 'Akıllı Stil', tint: 'rgba(0,240,255,0.05)', thumbColor: NEON_CYAN, isSmart: true },
  { id: 'noir', name: 'Kara Film', tint: 'rgba(0,0,0,0.5)', thumbColor: '#1A1A1A' },
  { id: 'sepia', name: 'Sepya', tint: 'rgba(112,66,20,0.3)', thumbColor: '#704214' },
  { id: 'dramatic', name: 'Dramatik', tint: 'rgba(0,0,0,0.2)', thumbColor: '#333' },
  { id: 'warm', name: 'Sıcak', tint: 'rgba(255,140,0,0.15)', thumbColor: '#FF8C00' },
  { id: 'cool', name: 'Soğuk', tint: 'rgba(0,150,255,0.15)', thumbColor: '#0096FF' },
  { id: 'vintage', name: 'Nostaljik', tint: 'rgba(255,200,100,0.15)', thumbColor: '#FFC864' },
  { id: 'vivid', name: 'Canlı', tint: 'transparent', thumbColor: '#FF00FF' }
];

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const isReadyForScroll = useRef(false);
  // 🔥 İŞTE BUNU EKLİYORUZ: Sisteme 'isPro'nun ne olduğunu öğretiyoruz
  const [isPro, setIsPro] = useState(false); 
    useFocusEffect(
    useCallback(() => {
      if (global.isPro) {
        setIsPro(true);
      }
    }, [])
  );

  const [activeMode, setActiveMode] = useState('photo'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [facing, setFacing] = useState('back');

  const [zoomLevel, setZoomLevel] = useState(ZOOM_LEVELS[1].value); 
  const baseZoom = useRef(ZOOM_LEVELS[1].value); 
  const [displayZoom, setDisplayZoom] = useState('1.0x'); 
  const [isManualZooming, setIsManualZooming] = useState(false); 
  const zoomTextOpacity = useRef(new Animated.Value(0)).current;
  let zoomTimeout = useRef(null);

  const [flashMode, setFlashMode] = useState('off');
  const [timer, setTimer] = useState(0); 
  const [showSettings, setShowSettings] = useState(false);
  
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const reviewAnim = useRef(new Animated.Value(0)).current; 

  const [countdown, setCountdown] = useState<number | null>(null);
  const shutterFlashAnim = useRef(new Animated.Value(0)).current;
  const reviewShotRef = useRef(null);

  const [showLiveFilters, setShowLiveFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState(LIVE_FILTERS[0]);
  const [showSmartStyleInput, setShowSmartStyleInput] = useState(false);
  const [smartPrompt, setSmartPrompt] = useState('');
  const [smartTint, setSmartTint] = useState('transparent');

  const [focusPoint, setFocusPoint] = useState<{ x: number, y: number } | null>(null);
  const focusAnim = useRef(new Animated.Value(1)).current;
  const focusOpacity = useRef(new Animated.Value(0)).current;

  const initialIndex = APP_MODES.findIndex(m => m.id === 'photo');
  const indicatorPosition = useRef(new Animated.Value(initialIndex * ITEM_WIDTH)).current;
  // 🔥 EKRANDAKİ DÜZELTİLMİŞ HALİNİ (VIEWSHOT) ALIP DİĞER SAYFALARA YOLLAR
  const handleReviewAction = async (routePath) => {
      try {
          const processedUri = await reviewShotRef.current.capture();
          // 🔥 DİKKAT: Burada fotoğrafı sıfırlayan kodları tamamen SİLDİK!
          // Böylece geri tuşuna basarsan direkt bu ekrana, fotoğrafına dönersin.
          router.push({ pathname: routePath, params: { imageUri: processedUri } });
      } catch (e) {
          alert("İşlem sırasında hata oluştu!");
      }
  };

  useEffect(() => {
      const index = APP_MODES.findIndex(m => m.id === activeMode);
      Animated.spring(indicatorPosition, {
          toValue: index * ITEM_WIDTH,
          friction: 8,
          tension: 50,
          useNativeDriver: true
      }).start();
  }, [activeMode]);

  useEffect(() => {
     if (scrollViewRef.current) {
        // Ekran açıldığında Kameraya (photo) kaydır ve sonra kaydırma algılayıcısını aktif et
        setTimeout(() => { 
            scrollViewRef.current?.scrollTo({ x: initialIndex * ITEM_WIDTH, animated: false }); 
            setTimeout(() => { isReadyForScroll.current = true; }, 300); // Kalkan: 300ms bekle
        }, 100);
     }
  }, []);

  // 🔥 ÇÖZÜM 2: ÖN KAMERA AÇILDIĞINDA 1X GİBİ EN GENİŞ AÇIYI SABİTLEME
  useEffect(() => {
      if (facing === 'front') {
          // Ön kamera genelde sabit odaklıdır ve 0.1 zoom (1x back) garip durabilir.
          // En geniş açıya (0 zoom level) çekerek yakın açılmayı engelliyoruz.
          setZoomLevel(0);
          setDisplayZoom('1.0x'); 
      }
  }, [facing]);

  const handleScrollEnd = (event) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const currentIndex = Math.round(scrollPosition / ITEM_WIDTH);
      if (APP_MODES[currentIndex] && APP_MODES[currentIndex].id !== activeMode) {
          setActiveMode(APP_MODES[currentIndex].id);
      }
  };

  const openGalleryForMode = async (modeId) => {
      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 });
      if (!result.canceled && result.assets[0].uri) {
        let screen = '/object-removal';
        if (modeId === 'bgremove') screen = '/bg-removal';
        if (modeId === 'portrait') screen = '/portrait-screen';
        if (modeId === 'studio') screen = '/studio-screen'; 
        router.push({ pathname: screen, params: { imageUri: result.assets[0].uri } });
      }
  };

  const takePhoto = async () => {
      if (!cameraRef.current) return;
      
      shutterFlashAnim.setValue(1);
      Animated.timing(shutterFlashAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();

      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if(!photo) return;
        setCapturedPhoto(photo.uri); 
        Animated.spring(reviewAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
      } catch (error) { alert("Hata oluştu."); } finally { setIsProcessing(false); }
  };

  const handleMainAction = async () => {
      const currentModeData = APP_MODES.find(m => m.id === activeMode);
      
      // 🔥 Eğer mod PRO ise VE kullanıcı PRO DEĞİLSE abonelik ekranına gönder
      if (currentModeData?.isPro && !isPro) { router.push('/subscription-screen'); return; }
      
      // Eğer kullanıcı PRO ise kilitleri bypass et ve özellikleri aç:
      if (activeMode === 'imagine') { router.push('/imagine-screen'); return; }
      if (activeMode !== 'photo') { openGalleryForMode(activeMode); return; }

      if (timer > 0) {
          // ... eski timer kodların aynen kalıyor ...
          setShowSettings(false);
          setShowLiveFilters(false);
          setShowSmartStyleInput(false);
          setCountdown(timer);
          let currentCount = timer;
          const interval = setInterval(() => {
              currentCount -= 1;
              if (currentCount > 0) {
                  setCountdown(currentCount);
              } else {
                  clearInterval(interval);
                  setCountdown(null);
                  takePhoto();
              }
          }, 1000);
          return;
      }
      takePhoto();
  };

  const handleFilterSelect = (filter) => {
      // 🔥 KULLANICI PRO DEĞİLSE VE AKILLI STİLE TIKLADIYSA ABONELİK EKRANINA UÇUR
      if (filter.isSmart && !isPro) {
          router.push('/subscription-screen');
          return;
      }

      setActiveFilter(filter);
      if(filter.isSmart) {
          setShowSmartStyleInput(true);
          setShowLiveFilters(false);
      }
  };

  const applySmartPrompt = async () => {
      if(!smartPrompt.trim()) return;
      setShowSmartStyleInput(false);
      setIsProcessing(true);
      try {
          const aiResult = await getSmartFilterParameters(smartPrompt);
          if (aiResult?.status === "success" && aiResult.parameters) {
             const p = aiResult.parameters;
             if (p.warmth > 20) setSmartTint('rgba(255, 140, 0, 0.2)');
             else if (p.warmth < -20) setSmartTint('rgba(0, 150, 255, 0.2)');
             else if (p.saturation < -50) setSmartTint('rgba(0, 0, 0, 0.5)');
             else setSmartTint('rgba(0, 240, 255, 0.1)');
          }
      } catch(e) {} finally { setIsProcessing(false); }
  };

  const onPinchStateChange = (event) => {
      if (activeMode !== 'photo' || facing === 'front') return;
      if (event.nativeEvent.state === State.BEGAN) {
          baseZoom.current = zoomLevel; 
          setIsManualZooming(true);
          Animated.timing(zoomTextOpacity, { toValue: 1, duration: 100, useNativeDriver: true }).start();
      } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
          if(zoomTimeout.current) clearTimeout(zoomTimeout.current);
          zoomTimeout.current = setTimeout(() => {
              Animated.timing(zoomTextOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
              setIsManualZooming(false); 
          }, 1000);
      }
  };

  const onPinchEvent = (event) => {
      if (activeMode !== 'photo' || facing === 'front') return;
      const scale = event.nativeEvent.scale;
      let delta = (scale - 1) * 0.15; 
      let newZoom = baseZoom.current + delta; 
      
      newZoom = Math.max(0, Math.min(newZoom, 1)); 
      setZoomLevel(newZoom);
      
      let displayVal;
      if (newZoom <= 0.1) {
          displayVal = 0.5 + (newZoom / 0.1) * 0.5;
      } else {
          displayVal = 1.0 + ((newZoom - 0.1) / 0.9) * 4.0; 
      }
      
      setDisplayZoom(`${displayVal.toFixed(1)}x`);
  };

  const onSwipeUp = (event) => {
      if (event.nativeEvent.state === State.ACTIVE) {
          openGalleryForMode(activeMode === 'photo' ? 'studio' : activeMode);
      }
  };

  const onTapFocus = (event) => {
      if (event.nativeEvent.state === State.ACTIVE) {
          if (showSettings || showLiveFilters || showSmartStyleInput) {
              setShowSettings(false);
              setShowLiveFilters(false);
              setShowSmartStyleInput(false);
              return;
          }

          if (activeMode !== 'photo' || facing === 'front') return;

          const { x, y } = event.nativeEvent;
          setFocusPoint({ x, y });
          focusAnim.setValue(1.5);
          focusOpacity.setValue(1);
          Animated.parallel([
              Animated.spring(focusAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
              Animated.sequence([
                  Animated.delay(1000),
                  Animated.timing(focusOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
              ])
          ]).start();
      }
  };

  const toggleCameraFacing = () => {
      setFacing(current => (current === 'back' ? 'front' : 'back'));
  };
// 🔥 ÖN KAMERA ZOOM SORUNU ÇÖZÜMÜ
  useEffect(() => {
    if (facing === 'front') {
        setZoomLevel(0); // Ön kamera en geniş açı (0)
        setDisplayZoom('1.0x'); // Ekranda 1x yazsın
    }
  }, [facing]); //facing her değiştiğinde çalışır

  useEffect(() => {
  if (permission && !permission.granted) {
    requestPermission();
  }
}, [permission]);

if (!permission) {
  return null;
}

if (!permission.granted) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white" }}>
        Kamera izni bekleniyor...
      </Text>
    </View>
  );
}

  // 🔥 1. ADIM: currentTint değişkenini yukarı taşıdık ki inceleme ekranında da bilelim
  const currentTint = activeFilter.id === 'smart' ? smartTint : activeFilter.tint;

  if (capturedPhoto) {
    const handleReviewAction = async (routePath) => {
        try {
            const processedUri = await reviewShotRef.current.capture();
            router.push({ pathname: routePath, params: { imageUri: processedUri } });
        } catch (e) {
            alert("İşlem sırasında hata oluştu!");
        }
    };

    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <Animated.View style={[styles.container, { 
            opacity: reviewAnim, 
            transform: [{ scale: reviewAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] 
        }]}>
            {/* 🔥 GÜNCELLENMİŞ TEPE MENÜSÜ: SAFEAREAVIEW İLE BUTONLARI AŞAĞI ALDIK */}
            {/* 🔥 ANA KAMERA ÜST MENÜSÜ (Tüm Telefonlara Otomatik Uyumlu) */}
            {/* 🔥 ANA KAMERA ÜST MENÜSÜ (Manuel Sayılarla Aşağı İtildi) */}
            {/* iOS için 60, Android için 45 verdik. Bu sayıları artırdıkça menü komple aşağı iner! */}
            {/* 🔥 FOTOĞRAF İNCELEME EKRANI ÜST MENÜSÜ (X ve Kaydet Tuşu) */}
            <View style={{ position: 'absolute', top: 0, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 45, zIndex: 30 }}>
                {/* SOL ÜST: X BUTONU */}
                <TouchableOpacity onPress={() => { setCapturedPhoto(null); reviewAnim.setValue(0); }} style={styles.iconButton}>
                    <MaterialIcons name="close" size={28} color="white" />
                </TouchableOpacity>

                {/* SAĞ ÜST: MİNİK KAYDET BUTONU */}
                <TouchableOpacity onPress={async () => { 
                        try {
                            const uri = await reviewShotRef.current.capture();
                            await MediaLibrary.saveToLibraryAsync(uri); 
                            alert("🎉 Görsel kaydedildi!"); 
                        } catch(e) { alert("Hata oluştu!"); }
                    }} 
                    style={{ backgroundColor: '#FFF', width: 85, height: 32, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <MaterialIcons name="save-alt" size={16} color={DARK_TITANIUM} />
                    <Text style={{ color: DARK_TITANIUM, fontWeight: '800', fontSize: 11 }}>Kaydet</Text>
                </TouchableOpacity>
            </View>
            
            <ViewShot ref={reviewShotRef} options={{ format: "jpg", quality: 1.0 }} style={[StyleSheet.absoluteFillObject, { zIndex: -2 }]}>
                <Image source={{ uri: capturedPhoto }} style={[StyleSheet.absoluteFillObject, { transform: [{ scaleX: facing === 'front' ? -1 : 1 }] }]} resizeMode="cover" />
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: currentTint }]} pointerEvents="none" />
            </ViewShot>

            <BlurView intensity={70} tint="dark" style={[styles.footerResult, { position: 'absolute', bottom: 0, width: '100%', paddingBottom: Platform.OS === 'ios' ? 40 : 20, paddingTop: 25 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 10 }}>
                    <TouchableOpacity style={styles.reviewButton} onPress={() => handleReviewAction('/object-removal')}>
                        <MaterialIcons name="auto-fix-high" size={26} color={NEON_CYAN} />
                        <Text style={styles.reviewButtonText}>Obje Sil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reviewButton} onPress={() => handleReviewAction('/bg-removal')}>
                        <MaterialIcons name="flip-to-back" size={26} color="#FF6B6B" />
                        <Text style={styles.reviewButtonText}>Arka Plan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reviewButton} onPress={() => handleReviewAction('/studio-screen')}>
                        <MaterialIcons name="color-lens" size={26} color="#FFD700" />
                        <Text style={styles.reviewButtonText}>Stüdyo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reviewButton} onPress={() => handleReviewAction('/portrait-screen')}>
                        <MaterialIcons name="portrait" size={26} color="#00E676" />
                        <Text style={styles.reviewButtonText}>Portre</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Animated.View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: DARK_TITANIUM }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: DARK_TITANIUM }}>
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            
            {/* ÜST MENÜ */}
{/* 🔥 ANA KAMERA ÜST MENÜSÜ (Manuel Sayılar Burada Çalışacak) */}
            <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 45 : 45 }]}>
                {/* SOL: ÇIKIŞ BUTONU */}
                <TouchableOpacity style={styles.iconButton} onPress={() => {
                    global.isPro = false; // Çıkış yaptığımız için global hafızadaki PRO durumunu sıfırlıyoruz
                    router.replace('/login-screen'); // Geri dönülmemesi için push yerine replace ile Login'e atıyoruz
                }}>
                    <MaterialIcons name="logout" size={24} color="#FFF" />
                </TouchableOpacity>

                {/* ORTA: YAZILAR */}
                <View style={[styles.centerHeaderContainer, { top: Platform.OS === 'ios' ? -5 : 45, alignItems: 'center' }]} pointerEvents="box-none">
                    <Text style={styles.logoText}>PROMPT LENS</Text>
                    
                    {/* 🔥 2. MADDE: Eğer kullanıcı PRO ise sadece 'PRO' yazar, değilse 'PRO'YA GEÇ' yazar */}
                    <TouchableOpacity style={styles.proBadge} onPress={() => router.push('/subscription-screen')}>
                        <MaterialIcons name="star" size={12} color={DARK_TITANIUM} style={{marginRight: 4}} />
                        <Text style={styles.proBadgeText}>{isPro ? "PRO" : "PRO'YA GEÇ"}</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.topSwipeUpHint}>
                        <MaterialIcons name="keyboard-arrow-up" size={12} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.topSwipeUpText}>Galeriyi açmak için kaydır</Text>
                    </View>
                </View>
                
                {/* SAĞ: AYARLAR VE ÖN KAMERA */}
                <View style={{ alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => { setShowSettings(!showSettings); setShowLiveFilters(false); setShowSmartStyleInput(false); }}>
                        <MaterialIcons name="tune" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                        <MaterialIcons name="flip-camera-android" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {showSettings && (
                <BlurView intensity={70} tint="dark" style={styles.settingsDropdown}>
                    <TouchableOpacity style={styles.settingItem} onPress={() => setFlashMode(prev => prev === 'off' ? 'on' : 'off')}>
                        <Ionicons name={flashMode === 'on' ? 'flash' : 'flash-off'} size={24} color={flashMode === 'on' ? PRO_GOLD : '#FFF'} />
                        <Text style={styles.settingText}>Flaş {flashMode === 'on' ? 'Açık' : 'Kapalı'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem} onPress={() => setTimer(prev => prev === 0 ? 3 : prev === 3 ? 10 : 0)}>
                        <MaterialIcons name="timer" size={24} color={timer > 0 ? NEON_CYAN : '#FFF'} />
                        <Text style={styles.settingText}>{timer === 0 ? 'Kapalı' : `${timer} Saniye`}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.settingItem} onPress={() => { setShowLiveFilters(true); setShowSettings(false); }}>
                        <MaterialIcons name="filter-b-and-w" size={24} color={showLiveFilters ? NEON_CYAN : '#FFF'} />
                        <Text style={[styles.settingText, showLiveFilters && { color: NEON_CYAN }]}>Filtreler</Text>
                    </TouchableOpacity>
                </BlurView>
            )}

            {showSmartStyleInput && activeMode === 'photo' && (
                <View style={styles.smartPromptContainer}>
                    <BlurView intensity={80} tint="dark" style={styles.smartPromptBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'center' }}>
                            <MaterialIcons name="auto-awesome" size={20} color={NEON_CYAN} style={{marginRight: 5}}/>
                            <Text style={{color: '#FFF', fontSize: 16, fontWeight: '800'}}>Akıllı Stil</Text>
                            <View style={[styles.proBadge, { marginTop: 0, marginLeft: 8 }]}><Text style={styles.proBadgeText}>PRO</Text></View>
                        </View>
                        <TextInput style={styles.smartInput} placeholder="Nasıl bir his istiyorsun?" placeholderTextColor={SOFT_GRAY} value={smartPrompt} onChangeText={setSmartPrompt} autoFocus />
                        <TouchableOpacity style={styles.smartApplyBtn} onPress={applySmartPrompt}><Text style={styles.smartApplyBtnText}>Uygula</Text></TouchableOpacity>
                        <TouchableOpacity style={{marginTop: 15}} onPress={() => setShowSmartStyleInput(false)}><Text style={{color: SOFT_GRAY, fontSize: 12, fontWeight: 'bold'}}>İptal Et</Text></TouchableOpacity>
                    </BlurView>
                </View>
            )}

            <View style={{ flex: 1, overflow: 'hidden' }}>
                <FlingGestureHandler direction={Directions.UP} onHandlerStateChange={onSwipeUp}>
                    <Animated.View style={StyleSheet.absoluteFillObject}>
                        <TapGestureHandler onHandlerStateChange={onTapFocus}>
                            <Animated.View style={StyleSheet.absoluteFillObject}>
                                <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
                                    <Animated.View style={StyleSheet.absoluteFillObject}>
                                        
                                        {activeMode === 'photo' ? (
                                            <CameraView 
    ref={cameraRef} 
    style={StyleSheet.absoluteFillObject} 
    facing={facing} 
    // 🔥 ÇÖZÜM 1: Ön kamerada zoom her zaman zorunlu olarak 0'a kilitlenir.
    zoom={facing === 'front' ? 0 : zoomLevel}
    // 🔥 ÇÖZÜM 2: Ön kamerada flaş/ışık bug yaratıp renkleri bozduğu için sadece arka kamerada aktif ediyoruz.
    enableTorch={facing === 'back' && flashMode === 'on'}
    autoFocus={focusPoint ? "off" : "on"} 
>
                                                <View style={styles.cameraOverlay} />
                                                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: currentTint }]} pointerEvents="none" />
                                                
                                                {focusPoint && (
                                                    <Animated.View style={[styles.focusRing, { left: focusPoint.x - 30, top: focusPoint.y - 30, opacity: focusOpacity, transform: [{ scale: focusAnim }] }]} />
                                                )}

                                                {countdown !== null && (
                                                    <View style={styles.countdownContainer}>
                                                        <Text style={styles.countdownText}>{countdown}</Text>
                                                    </View>
                                                )}

                                                <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'white', opacity: shutterFlashAnim, zIndex: 999 }]} pointerEvents="none" />
                                            </CameraView>
                                        ) : (
                                            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: DARK_TITANIUM, justifyContent: 'center', alignItems: 'center' }]}>
                                                {/* 🔥 İKON DİNAMİK OLDU: Hayal et modunda büyü ikonuna, diğerlerinde galeri ikonuna dönüşür */}
                                                <MaterialIcons 
                                                    name={activeMode === 'imagine' ? "auto-awesome" : "photo-library"} 
                                                    size={80} 
                                                    color="rgba(255,255,255,0.05)" 
                                                />
                                                {/* 🔥 YAZI DİNAMİK OLDU */}
                                                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: '700', marginTop: 20, textAlign: 'center', letterSpacing: 0.5 }}>
                                                    {activeMode === 'imagine' ? "Hayal edin" : "İşlem yapılacak fotoğrafı seçin"}
                                                </Text>
                                            </View>
                                        )}
                                        
                                        {(!isProcessing && activeMode === 'photo' && !focusPoint && countdown === null && !showLiveFilters && !showSmartStyleInput) && (
                                            <View style={styles.viewfinderContainer}>
                                                <View style={styles.viewfinder}>
                                                    <View style={[styles.corner, styles.topLeft]} /><View style={[styles.corner, styles.topRight]} />
                                                    <View style={[styles.corner, styles.bottomLeft]} /><View style={[styles.corner, styles.bottomRight]} />
                                                    <View style={styles.centerDot} />
                                                </View>
                                            </View>
                                        )}
                                    </Animated.View>
                                </PinchGestureHandler>
                            </Animated.View>
                        </TapGestureHandler>
                    </Animated.View>
                </FlingGestureHandler>
            </View>

            {/* 🔥 ÇÖZÜM 1: KONTROLLER SABİTLENDİ VE YUKARI ÇEKİLDİ (bottom: 200) */}
            <View style={styles.floatingControlsArea} pointerEvents="box-none">
                {showLiveFilters && activeMode === 'photo' && (
                    <View style={styles.floatingFiltersContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                            {LIVE_FILTERS.map((filter) => (
                                <TouchableOpacity key={filter.id} style={styles.liveFilterBtn} onPress={() => handleFilterSelect(filter)}>
                                    <View style={[styles.liveFilterCircle, { backgroundColor: filter.thumbColor }, activeFilter.id === filter.id && { borderColor: NEON_CYAN, borderWidth: 3 }]}>
                                        <MaterialIcons name={filter.id === 'smart' ? 'auto-awesome' : 'camera'} size={24} color={activeFilter.id === filter.id ? NEON_CYAN : '#FFF'} />
                                    </View>
                                    <Text style={[styles.liveFilterText, activeFilter.id === filter.id && { color: NEON_CYAN }]}>{filter.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {isManualZooming && activeMode === 'photo' && (
                    <Animated.View style={[styles.zoomIndicator, { opacity: zoomTextOpacity }]}>
                        <Text style={styles.zoomIndicatorText}>{displayZoom}</Text>
                    </Animated.View>
                )}

                {!isManualZooming && activeMode === 'photo' && !showLiveFilters && facing === 'back' && (
                    <View style={styles.floatingZoomContainer}>
                        {ZOOM_LEVELS.map((zoom) => (
                            <TouchableOpacity 
                                key={zoom.label} 
                                style={[styles.zoomButton, zoomLevel === zoom.value && styles.activeZoomButton]}
                                onPress={() => {
                                    setZoomLevel(zoom.value);
                                    setDisplayZoom(zoom.label);
                                }}
                            >
                                <Text style={[styles.zoomText, zoomLevel === zoom.value && styles.activeZoomText]}>{zoom.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {isProcessing && (
                <View style={styles.processingOverlay}>
                    <ActivityIndicator size="large" color={NEON_CYAN} />
                </View>
            )}

            <View style={styles.footerMain}>
                <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
                    {activeMode === 'photo' ? (
                        <TouchableOpacity style={styles.shutterOuter} onPress={handleMainAction} activeOpacity={0.7} disabled={countdown !== null}>
                            <View style={styles.shutterInner} />
                        </TouchableOpacity>
                    ) : (
                       <TouchableOpacity 
                        style={[styles.galleryOpenBtn, (APP_MODES.find(m => m.id === activeMode)?.isPro && !isPro) && { backgroundColor: '#FFCC00' }]} 
                        onPress={handleMainAction}
                    >
                        <MaterialIcons 
                            name={(APP_MODES.find(m => m.id === activeMode)?.isPro && !isPro) ? "workspace-premium" : "photo-library"} 
                            size={24} 
                            color="#0B0C10" 
                        />
                        <Text style={styles.galleryOpenText}>
    {(APP_MODES.find(m => m.id === activeMode)?.isPro && !isPro) 
        ? "PRO'YA GEÇ" 
        : (activeMode === 'imagine' ? "Hemen Dene" : "Galeriden Seç")}
</Text>
                    </TouchableOpacity>
                    )}
                </View>

                <View style={styles.modeCarouselContainer}>
                    <ScrollView 
                         ref={scrollViewRef}
                         horizontal 
                         showsHorizontalScrollIndicator={false} 
                         snapToInterval={ITEM_WIDTH} 
                         decelerationRate="fast"
                         onMomentumScrollEnd={handleScrollEnd}
                         onScrollEndDrag={handleScrollEnd}
                         scrollEventThrottle={16}
                         // 🔥 ÇÖZÜM: BAŞLANGIÇ POZİSYONU EKLEDİK (initialIndex * ITEM_WIDTH = 240)
                        contentOffset={{ x: initialIndex * ITEM_WIDTH, y: 0 }} 
                        contentContainerStyle={{ paddingHorizontal: CENTER_PADDING, alignItems: 'center' }}
                    >
                        <View style={{ flexDirection: 'row', position: 'relative' }}>
                            {/* 🔥 ÇÖZÜM 3: YENİ TASARIM AKTİF ÇİZGİ (İKONUN ALTINDA) */}
                            <Animated.View style={[styles.slidingIndicator, { transform: [{ translateX: indicatorPosition }] }]} />
                            
                            {APP_MODES.map((mode, index) => (
                                <TouchableOpacity 
                                    key={mode.id} 
                                    style={styles.modeItemWrapper}
                                    onPress={() => {
                                        setActiveMode(mode.id);
                                        if (scrollViewRef.current) {
                                            scrollViewRef.current.scrollTo({ x: index * ITEM_WIDTH, animated: true });
                                        }
                                    }}
                                >
                                    <Text style={[styles.modeItemTextTop, activeMode === mode.id && styles.activeModeItemTextTop]}>{mode.name}</Text>
                                    <MaterialIcons name={mode.icon} size={activeMode === mode.id ? 28 : 22} color={activeMode === mode.id ? NEON_CYAN : '#FFF'} style={{ opacity: activeMode === mode.id ? 1 : 0.6 }} />
                                    {mode.isPro && <View style={styles.tinyProDot} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
        </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DARK_TITANIUM },
  cameraOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.02)' },
  processingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  
  header: { position: 'absolute', top: 0, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 16, zIndex: 20 },
  iconButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  logoText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  // 🔥 PRO BADGE: İçindeki yazıyı ve ikonu tam merkeze sabitledik
  proBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', // Yazıyı yatayda tam ortalar
    backgroundColor: PRO_GOLD, 
    paddingHorizontal: 12, // Kenarlardan biraz daha boşluk verdik ki simetrik dursun
    paddingVertical: 4, 
    borderRadius: 10, 
    marginTop: 4, 
    shadowColor: PRO_GOLD, 
    shadowOpacity: 0.5, 
    shadowRadius: 5 
  },

  // 🔥 KAYDIR İPUCU: Yazıyı hafifçe sola kaydırdık
  topSwipeUpHint: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 8,
    // 🔥 ÇÖZÜM: marginRight yerine X ekseninde eksi değere doğru itiyoruz.
    transform: [{ translateX: -15 }] 
  },
  proBadgeText: { color: DARK_TITANIUM, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  topSwipeUpHint: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  topSwipeUpText: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600', marginLeft: 4 },

  settingsDropdown: { position: 'absolute', top: Platform.OS === 'ios' ? 90 : 100, right: 16, width: 160, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 30 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 14, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  settingText: { color: '#FFF', marginLeft: 12, fontSize: 13, fontWeight: '700' },

  viewfinderContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' },
  viewfinder: { width: 280, height: 280, justifyContent: 'center', alignItems: 'center', opacity: 0.3 },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#FFF' },
  topLeft: { top: 0, left: 0, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
  topRight: { top: 0, right: 0, borderTopWidth: 1.5, borderRightWidth: 1.5 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
  centerDot: { width: 6, height: 6, backgroundColor: NEON_CYAN, borderRadius: 3, shadowColor: NEON_CYAN, shadowOpacity: 1, shadowRadius: 5 },

  // 🔥 ÇÖZÜM 1: KONTROLLER DAHA YUKARI ALINDI (Alt menüden bağımsız)
  floatingControlsArea: { position: 'absolute', bottom: 200, width: '100%', alignItems: 'center', justifyContent: 'flex-end', zIndex: 10 },
  floatingZoomContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 6, paddingVertical: 4 },
  zoomButton: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
  activeZoomButton: { backgroundColor: 'rgba(255,255,255,0.2)' },
  zoomText: { color: SOFT_GRAY, fontSize: 12, fontWeight: '700' },
  activeZoomText: { color: NEON_CYAN, fontSize: 13, fontWeight: '900' },

  zoomIndicator: { backgroundColor: 'transparent' },
  zoomIndicatorText: { color: NEON_CYAN, fontSize: 18, fontWeight: '900', letterSpacing: 1, textShadowColor: '#000', textShadowRadius: 10 },

  floatingFiltersContainer: { width: '100%', paddingVertical: 10 },
  liveFilterBtn: { alignItems: 'center', marginRight: 15 },
  liveFilterCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 5 },
  liveFilterText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginTop: 8, textShadowColor: '#000', textShadowRadius: 5 },

  smartPromptContainer: { position: 'absolute', top: '35%', width: '100%', alignItems: 'center', zIndex: 50 },
  smartPromptBox: { width: '85%', padding: 25, borderRadius: 25, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  smartInput: { width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFF', padding: 15, borderRadius: 15, fontSize: 14, textAlign: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  smartApplyBtn: { backgroundColor: NEON_CYAN, width: '100%', padding: 12, borderRadius: 15, alignItems: 'center' },
  smartApplyBtnText: { color: DARK_TITANIUM, fontWeight: '900', fontSize: 14 },

  countdownContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  countdownText: { fontSize: 140, fontWeight: 'bold', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 20, textShadowOffset: { width: 0, height: 4 } },

  focusRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: NEON_CYAN, backgroundColor: 'rgba(0,240,255,0.1)' },

  footerMain: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'transparent', paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 30 : 15, zIndex: 20 },
  shutterOuter: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF' },
  galleryOpenBtn: { flexDirection: 'row', backgroundColor: '#FFF', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 30, alignItems: 'center', shadowColor: '#FFF', shadowOpacity: 0.3, shadowRadius: 10 },
  galleryOpenText: { color: DARK_TITANIUM, fontSize: 14, fontWeight: '900', marginLeft: 8 },

  modeCarouselContainer: { height: 70, width: '100%', marginTop: 10, justifyContent: 'center' },
  modeItemWrapper: { width: ITEM_WIDTH, alignItems: 'center', justifyContent: 'center' }, 
  modeItemTextTop: { color: '#FFF', fontSize: 10, fontWeight: '700', marginBottom: 8, opacity: 0.8, textShadowColor: '#000', textShadowRadius: 3 },
  activeModeItemTextTop: { color: NEON_CYAN, fontSize: 12, fontWeight: '900', opacity: 1, textShadowColor: NEON_CYAN, textShadowRadius: 5 },
  tinyProDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PRO_GOLD, position: 'absolute', top: 22, right: 25, borderWidth: 1, borderColor: DARK_TITANIUM },

  // 🔥 ÇÖZÜM 3: YENİ TASARIM - SADECE İKONUN ALTINDA ÇİZGİ
  slidingIndicator: { position: 'absolute', width: 40, height: 1, borderRadius: 1, backgroundColor: '#ffff', bottom: 0, left: 20, zIndex: 2, shadowColor: NEON_CYAN, shadowOpacity: 0.8, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } },

  footerResult: { padding: 20, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(11, 12, 16, 0.8)' },
  reviewButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 20, width: '22%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 8 },
  reviewButtonText: { color: '#FFF', fontSize: 11, fontWeight: '800', textAlign: 'center' },
});