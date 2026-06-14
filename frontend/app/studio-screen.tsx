// @ts-nocheck
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, ActivityIndicator, PanResponder, Image, PixelRatio, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import Slider from '@react-native-community/slider';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { Defs, Filter, FeColorMatrix, Image as SvgImage, Path } from 'react-native-svg';
import { getSmartFilterParameters } from '../src/services/aiService'; 
import { useFocusEffect } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

const FILTERS = [
  { id: 'normal', name: 'Orijinal', matrix: null },
  { id: 'noir', name: 'Kara Film', matrix: '0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0' },
  { id: 'sepia', name: 'Sepya', matrix: '0.393 0.769 0.189 0 0 0.349 0.686 0.168 0 0 0.272 0.534 0.131 0 0 0 0 0 1 0' },
  { id: 'dramatic', name: 'Dramatik', matrix: '1.2 0 0 0 -0.1 0 1.2 0 0 -0.1 0 0 1.2 0 -0.1 0 0 0 1 0' },
  { id: 'warm', name: 'Sıcak', matrix: '1.2 0 0 0 0 0 1.0 0 0 0 0 0 0.8 0 0 0 0 0 1 0' },
  { id: 'cool', name: 'Soğuk', matrix: '0.8 0 0 0 0 0 1.0 0 0 0 0 0 1.2 0 0 0 0 0 1 0' },
  { id: 'vintage', name: 'Nostaljik', matrix: '0.9 0.5 0.1 0 0 0.3 0.8 0.1 0 0 0.2 0.3 0.5 0 0 0 0 0 1 0' },
  { id: 'vivid', name: 'Canlı', matrix: '1.5 0 0 0 0 0 1.5 0 0 0 0 0 1.5 0 0 0 0 0 1 0' }
];

const ADJUST_TOOLS = [
  { id: 'exposure', name: 'Pozlama', icon: 'exposure' },
  { id: 'brightness', name: 'Parlaklık', icon: 'brightness-6' },
  { id: 'contrast', name: 'Kontrast', icon: 'tonality' },
  { id: 'saturation', name: 'Doygunluk', icon: 'color-lens' },
  { id: 'warmth', name: 'Sıcaklık', icon: 'thermostat' }
];

export default function StudioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialUri = typeof params.imageUri === 'string' ? params.imageUri : null;

  const viewShotRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState(''); 
  
  const [activeImage, setActiveImage] = useState(initialUri);
  const [mainTab, setMainTab] = useState<'adjust' | 'filters' | 'crop' | 'draw'>('adjust');
  const [showOriginal, setShowOriginal] = useState(false); 
  
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [filterIntensity, setFilterIntensity] = useState(1);
  const [activeTool, setActiveTool] = useState(ADJUST_TOOLS[0]);
  const [adjustments, setAdjustments] = useState({ exposure: 0, brightness: 0, contrast: 0, saturation: 0, warmth: 0 });

  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [drawHue, setDrawHue] = useState(0); 
  const [drawSize, setDrawSize] = useState(6); 
  const [cropBox, setCropBox] = useState(null); 

  const [isSmartModalVisible, setIsSmartModalVisible] = useState(false);
  const [smartPrompt, setSmartPrompt] = useState('');
  const [isPro, setIsPro] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (global.isPro) {
        setIsPro(true);
      }
    }, [])
  );
  // 🔥 Stüdyo ekranı her öne geldiğinde PRO durumunu kontrol eder
  // 🔥 ABONELİK EKRANINDAN GELEN SİNYALİ DİNLE

  const [history, setHistory] = useState([]);
  const currentStateRef = useRef({ activeImage, activeFilter, filterIntensity, adjustments, paths });

  useEffect(() => { 
      currentStateRef.current = { activeImage, activeFilter, filterIntensity, adjustments, paths }; 
  }, [activeImage, activeFilter, filterIntensity, adjustments, paths]);

  const stateRefs = useRef({ tab: mainTab, hue: drawHue, size: drawSize });
  useEffect(() => { stateRefs.current = { tab: mainTab, hue: drawHue, size: drawSize }; }, [mainTab, drawHue, drawSize]);

  const saveHistory = useCallback(() => {
    const snap = currentStateRef.current;
    setHistory(prev => [...prev, {
      activeImage: snap.activeImage,
      activeFilter: snap.activeFilter,
      filterIntensity: snap.filterIntensity,
      adjustments: { ...snap.adjustments },
      paths: [...snap.paths] 
    }]);
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    
    setActiveImage(previousState.activeImage);
    setActiveFilter(previousState.activeFilter);
    setFilterIntensity(previousState.filterIntensity);
    setAdjustments(previousState.adjustments);
    setPaths(previousState.paths);
    
    setHistory(prev => prev.slice(0, -1));
  };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => stateRefs.current.tab === 'draw' || stateRefs.current.tab === 'crop',
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (stateRefs.current.tab === 'draw') {
        saveHistory(); 
        setCurrentPath(`M${locationX},${locationY}`);
      } else if (stateRefs.current.tab === 'crop') {
        setCropBox({ startX: locationX, startY: locationY, x: locationX, y: locationY, w: 0, h: 0 });
      }
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (stateRefs.current.tab === 'draw') setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
      else if (stateRefs.current.tab === 'crop') {
        setCropBox(prev => {
          if (!prev) return null;
          const w = locationX - prev.startX;
          const h = locationY - prev.startY;
          return { ...prev, x: w < 0 ? locationX : prev.startX, y: h < 0 ? locationY : prev.startY, w: Math.abs(w), h: Math.abs(h) };
        });
      }
    },
    onPanResponderRelease: () => {
      if (stateRefs.current.tab === 'draw') {
        setCurrentPath((prevPath) => {
          if(prevPath) setPaths(prev => [...prev, { d: prevPath, color: `hsl(${stateRefs.current.hue}, 100%, 50%)`, size: stateRefs.current.size }]);
          return '';
        });
      }
    }
  }), [saveHistory]);

  const handleManipulate = async (actionType) => {
    saveHistory(); 
    setProcessingText(''); 
    setIsProcessing(true);
    try {
      let actions = [];
      if (actionType === 'rotate-left') actions.push({ rotate: -90 });
      if (actionType === 'rotate-right') actions.push({ rotate: 90 });
      if (actionType === 'flip-h') actions.push({ flip: ImageManipulator.FlipType.Horizontal });
      if (actionType === 'flip-v') actions.push({ flip: ImageManipulator.FlipType.Vertical });
      const result = await ImageManipulator.manipulateAsync(activeImage, actions, { compress: 1, format: ImageManipulator.SaveFormat.PNG });
      setActiveImage(result.uri);
    } catch (e) { alert("İşlem başarısız."); } finally { setIsProcessing(false); }
  };

  const applyManualCrop = async () => {
      if(!cropBox || cropBox.w < 20 || cropBox.h < 20) { setCropBox(null); return; }
      saveHistory(); 
      setProcessingText(''); 
      setIsProcessing(true);
      
      const currentCropBox = {...cropBox}; 
      setCropBox(null); // 🔥 Çizgiyi ekrandan siliyoruz
      
      // 🔥 ASENKRON ÇÖZÜM: React'ın ekranı temizlemesi için ona 100 milisaniye süre tanıyoruz.
      // Hayalet çizgiler böylece tamamen tarihe karışıyor!
      setTimeout(async () => {
          try {
              const currentUri = await viewShotRef.current.capture();
              const scale = PixelRatio.get(); 
              const actions = [{ crop: { originX: currentCropBox.x * scale, originY: currentCropBox.y * scale, width: currentCropBox.w * scale, height: currentCropBox.h * scale } }];
              const result = await ImageManipulator.manipulateAsync(currentUri, actions, { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
              
              setActiveImage(result.uri);
              setPaths([]);
              setAdjustments({ exposure: 0, brightness: 0, contrast: 0, saturation: 0, warmth: 0 });
              setActiveFilter(FILTERS[0]);
          } catch (e) { 
              alert("Kırpma hatası"); 
          } finally { 
              setIsProcessing(false); 
          }
      }, 100);
  };

  const applySmartFilter = async () => {
    if (!smartPrompt.trim()) return;
    setIsSmartModalVisible(false);
    setProcessingText('Yapay Zeka Analiz Ediyor..'); 
    setIsProcessing(true);
    try {
      const aiResult = await getSmartFilterParameters(smartPrompt);
      if (aiResult?.status === "success" && aiResult.parameters) {
        saveHistory(); 
        const p = aiResult.parameters;
        setAdjustments({
           exposure: Math.max(-100, Math.min(100, p.exposure || 0)),
           brightness: Math.max(-100, Math.min(100, p.brightness || 0)),
           contrast: Math.max(-100, Math.min(100, p.contrast || 0)),
           saturation: Math.max(-100, Math.min(100, p.saturation || 0)),
           warmth: Math.max(-100, Math.min(100, p.warmth || 0))
        });
        setActiveFilter(FILTERS[0]);
        setSmartPrompt('');
      } else { alert("Atmosfer oluşturulamadı."); }
    } catch (error) { alert("Bağlantı hatası."); } finally { setIsProcessing(false); }
  };

  const handleSave = async () => {
    setProcessingText('Kaydediliyor...'); 
    setIsProcessing(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return alert("Galeri izni gerekli!");
      setCropBox(null); 
      setTimeout(async () => {
          const uri = await viewShotRef.current.capture();
          await MediaLibrary.saveToLibraryAsync(uri);
          alert("🎉 Görsel kaydedildi!");
          setIsProcessing(false);
      }, 200);
    } catch (error) { setIsProcessing(false); alert("Hata oluştu."); }
  };

  const b = adjustments.brightness / 100; 
  const c = (adjustments.contrast + 100) / 100; 
  const s = (adjustments.saturation + 100) / 100; 
  const w = adjustments.warmth / 100; 
  const e = (adjustments.exposure + 100) / 100; 
  const ce = c * e;
  const customMatrix = [ce, 0, 0, 0, b + w, 0, ce, 0, 0, b, 0, 0, ce, 0, b - w, 0, 0, 0, 1, 0].join(' ');
  const filterId = `master_filter_${activeFilter.id}_${adjustments.exposure}_${adjustments.brightness}_${adjustments.contrast}_${adjustments.saturation}_${adjustments.warmth}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}><MaterialIcons name="arrow-back" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>STÜDYO</Text>
        
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <TouchableOpacity onPress={handleUndo} disabled={history.length === 0} style={[styles.undoButton, {opacity: history.length === 0 ? 0.3 : 1}]}>
              <MaterialIcons name="undo" size={24} color="white" />
           </TouchableOpacity>
           <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}><Text style={{color: 'black', fontWeight: 'bold'}}>KAYDET</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
            <ViewShot ref={viewShotRef} collapsable={false} options={{ format: "jpg", quality: 1.0 }} style={styles.captureArea}>
                {showOriginal ? (
                    <Image source={{ uri: activeImage }} style={styles.exactImage} />
                ) : (
                    <>
                        <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
                            <Defs>
                                <Filter id={`base_${filterId}`}>
                                    <FeColorMatrix type="saturate" values={s.toString()} result="sat" />
                                    <FeColorMatrix type="matrix" values={customMatrix} />
                                </Filter>
                                {activeFilter.matrix && (
                                    <Filter id={`full_${filterId}`}>
                                        <FeColorMatrix type="saturate" values={s.toString()} result="sat" />
                                        <FeColorMatrix type="matrix" values={customMatrix} result="adj" />
                                        <FeColorMatrix type="matrix" values={activeFilter.matrix} />
                                    </Filter>
                                )}
                            </Defs>
                            <SvgImage href={{ uri: activeImage }} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" filter={`url(#base_${filterId})`} />
                            {activeFilter.matrix && (
                                <SvgImage href={{ uri: activeImage }} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" filter={`url(#full_${filterId})`} opacity={filterIntensity} />
                            )}
                        </Svg>
                        <Svg width="100%" height="100%" style={{ position: 'absolute', zIndex: 5 }} pointerEvents="none">
                            {paths.map((p, i) => <Path key={i} d={p.d} stroke={p.color} strokeWidth={p.size} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
                            {currentPath ? <Path d={currentPath} stroke={`hsl(${drawHue}, 100%, 50%)`} strokeWidth={drawSize} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
                        </Svg>
                        {mainTab === 'crop' && cropBox && (
                            <View style={{ 
                                position: 'absolute', 
                                left: cropBox.x, 
                                top: cropBox.y, 
                                width: cropBox.w, 
                                height: cropBox.h, 
                                borderWidth: 2, 
                                borderColor: '#ff0000', 
                                borderStyle: 'dashed', 
                                backgroundColor: 'rgba(255,0,0,0.1)', 
                                zIndex: 10 
                            }}>
                               {/* 🔥 YENİ AKILLI BUTON MOTORU */}
                               <TouchableOpacity 
                                   onPress={applyManualCrop} 
                                   style={[
                                       styles.cropApplyBtn, 
                                       { 
                                           position: 'absolute', 
                                           left: '50%', 
                                           transform: [{ translateX: -22 }], // Butonu yatayda milimetrik ortalar
                                           ...(
                                               cropBox.h < 70 
                                                 ? { top: '50%', marginTop: -22 } // Kutu çok kısaysa tam ortaya al
                                                 : (cropBox.y + cropBox.h) > ((SCREEN_WIDTH - 20) * 1.33 - 80)
                                                   ? { top: 10 }    // Kutunun altı ekranın en altına değiyorsa butonu ÜSTE fırlat
                                                   : { bottom: 10 } // Normal durumda butonu ALTA sabitle
                                           )
                                       }
                                   ]}
                               >
                                   <MaterialIcons name="check" size={24} color="white" />
                               </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ViewShot>
            {(mainTab === 'adjust' || mainTab === 'filters') && (
                <TouchableOpacity activeOpacity={1} style={[StyleSheet.absoluteFillObject, {zIndex: 100}]} onPressIn={() => setShowOriginal(true)} onPressOut={() => setShowOriginal(false)} />
            )}
        </View>

        {isProcessing && (
            <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#00f0ff" />
                {processingText ? <Text style={{color: 'white', marginTop: 10, fontWeight: 'bold'}}>{processingText}</Text> : null}
            </View>
        )}
        <Text style={styles.holdText}>{(mainTab === 'adjust' || mainTab === 'filters') ? 'Orijinali görmek için fotoğrafa basılı tut' : ''}</Text>
      </View>

      <View style={styles.footer}>
        {/* 🔥 ALTTAKİ SİYAH BOŞLUĞU YUTAN SİHİRLİ YAMA */}
        <View style={{ position: 'absolute', bottom: -50, left: 0, right: 0, height: 50, backgroundColor: '#111' }} />

        <View style={styles.toolArea}>
          {mainTab === 'adjust' && (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <Text style={styles.toolValueText}>{adjustments[activeTool.id]}</Text>
                <Slider style={{width: '90%', height: 40}} minimumValue={-100} maximumValue={100} step={1} value={adjustments[activeTool.id]} onValueChange={(val) => setAdjustments(prev => ({...prev, [activeTool.id]: val}))} minimumTrackTintColor="#ffD700" thumbTintColor="white" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.adjustToolsScroll}>
                    {ADJUST_TOOLS.map((tool) => (
                        <TouchableOpacity key={tool.id} style={styles.adjustToolBtn} onPress={() => { saveHistory(); setActiveTool(tool); }}>
                            <MaterialIcons name={tool.icon} size={24} color={activeTool.id === tool.id ? '#FFd700' : 'white'} />
                            <Text style={[styles.adjustToolText, activeTool.id === tool.id && { color: '#ffd700' }]}>{tool.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
          )}

          {mainTab === 'filters' && (
            <View style={{ width: '100%', alignItems: 'center' }}>
                {activeFilter.id !== 'normal' && (
                    <>
                        <Text style={styles.toolValueText}>%{Math.round(filterIntensity * 100)}</Text>
                        <Slider style={{width: '90%', height: 40, marginBottom: 5}} minimumValue={0} maximumValue={1} value={filterIntensity} onValueChange={setFilterIntensity} minimumTrackTintColor="#ffcc00" thumbTintColor="white" />
                    </>
                )}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    {/* 🔥 Stüdyo Ekranındaki Akıllı Stil PRO Kilidi */}
<TouchableOpacity 
    style={styles.filterThumbContainer} 
    onPress={() => {
        if (!isPro) {
            router.push('/subscription-screen'); // Pro değilse abone olmaya gönder
        } else {
            setIsSmartModalVisible(true); // Pro ise input ekranını aç
        }
    }}
>
                        <View style={[styles.filterCircle, { borderWidth: 2, borderColor: '#ffa500', backgroundColor: 'rgba(0,240,255,0.1)' }]}>
                            <MaterialIcons name="auto-awesome" size={28} color="#00f0ff" />
                        </View>
                        <Text style={[styles.filterName, { color: '#ffa500', fontWeight: 'bold' }]}>Akıllı Stil</Text>
                    </TouchableOpacity>

                    {FILTERS.map((filter) => (
                        <TouchableOpacity key={filter.id} style={styles.filterThumbContainer} onPress={() => { saveHistory(); setActiveFilter(filter); setFilterIntensity(1); }}>
                            <View style={[styles.filterCircle, activeFilter.id === filter.id && styles.activeFilterCircle]}>
                                {filter.matrix ? (
                                    <Svg width="100%" height="100%" style={{borderRadius: 26}}>
                                        <Defs><Filter id={`thumb_${filter.id}`}><FeColorMatrix type="matrix" values={filter.matrix} /></Filter></Defs>
                                        <SvgImage href={{ uri: activeImage }} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" filter={`url(#thumb_${filter.id})`} />
                                    </Svg>
                                ) : (
                                    <Image source={{ uri: activeImage }} style={{ width: '100%', height: '100%', borderRadius: 26, resizeMode: 'cover' }} />
                                )}
                            </View>
                            <Text style={[styles.filterName, activeFilter.id === filter.id && styles.activeFilterName]}>{filter.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
          )}

          {mainTab === 'crop' && (
            <View style={{width: '100%', alignItems: 'center'}}>
                <Text style={{color: '#759193', marginBottom: 15, fontSize: 12, fontWeight: 'bold'}}>Görseli kırpmak için ekranda bir kutu çiz.</Text>
                <View style={styles.cropToolsContainer}>
                    <TouchableOpacity style={styles.cropBtn} onPress={() => handleManipulate('rotate-left')}><MaterialIcons name="rotate-left" size={24} color="white" /><Text style={styles.cropBtnText}>Sola</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.cropBtn} onPress={() => handleManipulate('rotate-right')}><MaterialIcons name="rotate-right" size={24} color="white" /><Text style={styles.cropBtnText}>Sağa</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.cropBtn} onPress={() => handleManipulate('flip-h')}><MaterialIcons name="flip" size={24} color="white" /><Text style={styles.cropBtnText}>Yatay</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.cropBtn} onPress={() => handleManipulate('flip-v')}><MaterialIcons name="flip" size={24} color="white" style={{transform: [{rotate: '90deg'}]}} /><Text style={styles.cropBtnText}>Dikey</Text></TouchableOpacity>
                </View>
            </View>
          )}

          {mainTab === 'draw' && (
            <View style={{ width: '100%', paddingHorizontal: 20 }}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Renk</Text>
                    <TouchableOpacity onPress={handleUndo} style={{flexDirection: 'row', alignItems: 'center'}}>
                        <MaterialIcons name="undo" size={20} color={history.length === 0 ? "#555" : "#ff4444"} />
                        <Text style={{color: history.length === 0 ? "#555" : "#ff4444", fontSize: 13, marginLeft: 5, fontWeight: 'bold'}}>Geri Al</Text>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}><View style={[styles.colorPreview, { backgroundColor: `hsl(${drawHue}, 100%, 50%)` }]} /><Slider style={{flex: 1, height: 40}} minimumValue={0} maximumValue={360} step={1} value={drawHue} onValueChange={setDrawHue} minimumTrackTintColor={`hsl(${drawHue}, 100%, 50%)`} thumbTintColor="white" /></View>
                <Text style={{color: 'white', fontWeight: 'bold', marginTop: 10}}>Kalem Kalınlığı</Text>
                <Slider style={{width: '100%', height: 40}} minimumValue={1} maximumValue={30} step={1} value={drawSize} onValueChange={setDrawSize} minimumTrackTintColor="#ffff" thumbTintColor="white" />
            </View>
          )}
        </View>

        <View style={styles.mainTabsContainer}>
            <TouchableOpacity style={styles.mainTabBtn} onPress={() => {setMainTab('adjust'); setCropBox(null);}}><Text style={[styles.mainTabText, mainTab === 'adjust' && styles.activeMainTabText]}>Ayarla</Text>{mainTab === 'adjust' && <View style={styles.activeTabDot} />}</TouchableOpacity>
            <TouchableOpacity style={styles.mainTabBtn} onPress={() => {setMainTab('filters'); setCropBox(null);}}><Text style={[styles.mainTabText, mainTab === 'filters' && styles.activeMainTabText]}>Filtre</Text>{mainTab === 'filters' && <View style={styles.activeTabDot} />}</TouchableOpacity>
            <TouchableOpacity style={styles.mainTabBtn} onPress={() => setMainTab('crop')}><Text style={[styles.mainTabText, mainTab === 'crop' && styles.activeMainTabText]}>Kırp</Text>{mainTab === 'crop' && <View style={styles.activeTabDot} />}</TouchableOpacity>
            <TouchableOpacity style={styles.mainTabBtn} onPress={() => setMainTab('draw')}><Text style={[styles.mainTabText, mainTab === 'draw' && styles.activeMainTabText]}>Çiz</Text>{mainTab === 'draw' && <View style={styles.activeTabDot} />}</TouchableOpacity>
        </View>
      </View>

      <Modal visible={isSmartModalVisible} transparent animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
              <View style={styles.modalContainer}>
                  <View style={styles.modalHeader}><View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={styles.modalTitle}>
        <MaterialIcons name="auto-awesome" size={20} color="#00f0ff" /> Akıllı Stil
    </Text>
    <View style={styles.proBadge}>
        <Text style={styles.proBadgeText}>PRO</Text>
    </View>
</View><TouchableOpacity onPress={() => setIsSmartModalVisible(false)}><MaterialIcons name="close" size={24} color="#888" /></TouchableOpacity></View>
                  <TextInput style={styles.modalInput} placeholder="Atmosferi yaz (Örn: Gün batımı, siyah beyaz...)" placeholderTextColor="#555" value={smartPrompt} onChangeText={setSmartPrompt} autoFocus />
                  <TouchableOpacity style={styles.modalBtn} onPress={applySmartFilter}><Text style={styles.modalBtnText}>Uygula</Text></TouchableOpacity>
              </View>
          </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  undoButton: { padding: 8, marginRight: 10 },
  saveHeaderButton: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingVertical: 10 },
  canvasWrapper: { width: SCREEN_WIDTH - 20, flex: 1, maxHeight: (SCREEN_WIDTH - 20) * 1.33, backgroundColor: '#111', overflow: 'hidden', borderRadius: 10 }, 
  captureArea: { width: '100%', height: '100%', backgroundColor: 'transparent' },
  exactImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  processingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  holdText: { color: '#666', fontSize: 12, marginTop: 10, fontStyle: 'italic', height: 16 },
  footer: { width: '100%', paddingBottom: 20, backgroundColor: '#111', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  toolArea: { height: 160, justifyContent: 'center', alignItems: 'center', paddingTop: 15 },
  toolValueText: { color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
  adjustToolsScroll: { paddingHorizontal: 20, alignItems: 'center', marginTop: 10 },
  adjustToolBtn: { alignItems: 'center', marginHorizontal: 15 },
  adjustToolText: { color: 'white', fontSize: 11, marginTop: 6, fontWeight: '600' },
  filtersScroll: { paddingHorizontal: 16, alignItems: 'center' },
  filterThumbContainer: { alignItems: 'center', marginRight: 20 },
  filterCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  activeFilterCircle: { borderColor: '#ffd700', borderWidth: 3 },
  filterName: { color: '#888', fontSize: 11, marginTop: 6, fontWeight: '600' },
  activeFilterName: { color: 'white', fontWeight: 'bold' },
  cropToolsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: 10 },
  cropBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 15 },
  cropBtnText: { color: 'white', fontSize: 11, marginTop: 6, fontWeight: 'bold' },
  cropApplyBtn: { backgroundColor: '#ff0000', padding: 10, borderRadius: 25 },
  colorPreview: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'white', marginRight: 10 },
  mainTabsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 15, marginTop: 10 },
  mainTabBtn: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20 },
  mainTabText: { color: '#888', fontSize: 13, fontWeight: 'bold' },
  activeMainTabText: { color: 'white', fontSize: 14 },
  activeTabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ffff', marginTop: 4 },
  modalContainer: { backgroundColor: '#1a1a1a', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalInput: { backgroundColor: '#050505', color: 'white', padding: 15, borderRadius: 15, fontSize: 16, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  modalBtn: { backgroundColor: '#00f0ff', padding: 15, borderRadius: 15, alignItems: 'center' },
  modalBtnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
  proBadge: { 
    backgroundColor: '#FFA500', // Premium Altın
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 6, 
    marginLeft: 8, 
    shadowColor: '#FFA500', 
    shadowOpacity: 0.5, 
    shadowRadius: 5 
  }, 
  proBadgeText: { 
    color: '#0B0C10', 
    fontSize: 9, 
    fontWeight: '900', 
    letterSpacing: 1 
  },
});