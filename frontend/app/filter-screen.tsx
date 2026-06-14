// @ts-nocheck
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import ViewShot from 'react-native-view-shot';
import Slider from '@react-native-community/slider';

// 🔥 Filtreleme Matematiği İçin SVG
import Svg, { Defs, Filter, FeColorMatrix, Image as SvgImage } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;

// 🔥 KENDİ YAZDIĞIMIZ 10 ADET STOK FİLTRE MATRİSİ
const FILTERS = [
  { id: 'normal', name: 'Orijinal', matrix: null },
  { id: 'noir', name: 'Kara Film', matrix: '0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0' },
  { id: 'sepia', name: 'Sepya', matrix: '0.393 0.769 0.189 0 0  0.349 0.686 0.168 0 0  0.272 0.534 0.131 0 0  0 0 0 1 0' },
  { id: 'dramatic', name: 'Dramatik', matrix: '1.2 0 0 0 -0.1  0 1.2 0 0 -0.1  0 0 1.2 0 -0.1  0 0 0 1 0' },
  { id: 'warm', name: 'Sıcak', matrix: '1.2 0 0 0 0  0 1.0 0 0 0  0 0 0.8 0 0  0 0 0 1 0' },
  { id: 'cool', name: 'Soğuk', matrix: '0.8 0 0 0 0  0 1.0 0 0 0  0 0 1.2 0 0  0 0 0 1 0' },
  { id: 'vintage', name: 'Nostaljik', matrix: '0.9 0.5 0.1 0 0  0.3 0.8 0.1 0 0  0.2 0.3 0.5 0 0  0 0 0 1 0' },
  { id: 'cyberpunk', name: 'Siberpunk', matrix: '1.5 0 0 0 0  0 0.5 0 0 0  0 0 1.5 0 0  0 0 0 1 0' },
  { id: 'fade', name: 'Soluk', matrix: '0.8 0 0 0 0.1  0 0.8 0 0 0.1  0 0 0.8 0 0.1  0 0 0 1 0' },
  { id: 'emerald', name: 'Zümrüt', matrix: '0.5 0 0 0 0  0 1.3 0 0 0  0 0 0.5 0 0  0 0 0 1 0' }
];

export default function FilterScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const viewShotRef = useRef(null);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [filterIntensity, setFilterIntensity] = useState(1); // 0.0 ile 1.0 arası (%0 - %100)
  const [isProcessing, setIsProcessing] = useState(false);

  // 📸 KENDİ KAMERAMIZLA ÇEK
  const takePicture = async () => {
    if (!cameraRef.current) return;
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setActiveImage(photo.uri);
    } catch (e) {
      alert("Fotoğraf çekilemedi!");
    } finally {
      setIsProcessing(false);
    }
  };

  // 🖼️ GALERİDEN SEÇ
  const pickFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0].uri) {
      setActiveImage(result.assets[0].uri);
    }
  };

  // 💾 FİLTRELİ HALİNİ GALERİYE KAYDET (ViewShot ile iki katmanı birleştirip çeker)
  const saveFilteredImage = async () => {
    try {
      setIsProcessing(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert("Galeri izni gerekli!");
        return;
      }

      // Ekranda görünen filtrelenmiş halin fotoğrafını çekiyoruz
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      
      alert("🎉 Filtreli fotoğraf galerine kaydedildi!");
    } catch (error) {
      console.error(error);
      alert("Kaydedilirken hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- İZİN EKRANI ---
  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white', marginBottom: 20 }}>Kamera izni gerekiyor kanka.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.primaryButton}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- 1. MOD: KAMERA VEYA GALERİDEN SEÇİM YAPMA EKRANI ---
  if (!activeImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                <MaterialIcons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>STÜDYO FİLTRELERİ</Text>
            <View style={{ width: 44 }} />
        </View>

        <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
            {isProcessing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#ff4444" />
                </View>
            )}
        </View>

        <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
                <MaterialIcons name="photo-library" size={32} color="white" />
                <Text style={{color: 'white', fontSize: 12, marginTop: 4}}>Galeri</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureInner} />
            </TouchableOpacity>

            <View style={{ width: 60 }} /> 
        </View>
      </SafeAreaView>
    );
  }

  // --- 2. MOD: FİLTRE UYGULAMA VE DÜZENLEME EKRANI ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {setActiveImage(null); setActiveFilter(FILTERS[0]);}} style={styles.iconButton}>
          <MaterialIcons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DÜZENLE</Text>
        <TouchableOpacity onPress={saveFilteredImage} style={styles.saveHeaderButton}>
            <Text style={{color: 'black', fontWeight: 'bold'}}>KAYDET</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.editorContent}>
        {/* 🔥 VIEWHOT: Filtrelenmiş görüntüyü paketleyip indirebilmek için */}
        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1.0 }} style={styles.imagePreviewContainer}>
            
            {/* 1. KATMAN: Orijinal Fotoğraf (En Altta) */}
            <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <SvgImage href={{ uri: activeImage }} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
            </Svg>

            {/* 2. KATMAN: Filtreli Fotoğraf (Üstte) - Opaklığı Slider ile kontrol ediliyor! */}
            {activeFilter.matrix && (
                <Svg width="100%" height="100%" style={{ position: 'absolute', opacity: filterIntensity }}>
                    <Defs>
                        <Filter id="colorMatrix">
                            <FeColorMatrix type="matrix" values={activeFilter.matrix} />
                        </Filter>
                    </Defs>
                    <SvgImage href={{ uri: activeImage }} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" filter="url(#colorMatrix)" />
                </Svg>
            )}
        </ViewShot>

        {/* 🔥 YÜZDELİK ŞİDDET AYARI (SLIDER) */}
        {activeFilter.id !== 'normal' && (
            <View style={styles.sliderContainer}>
                <Text style={{color: 'white', fontWeight: 'bold', width: 40}}>%{Math.round(filterIntensity * 100)}</Text>
                <Slider
                    style={{flex: 1, height: 40}}
                    minimumValue={0}
                    maximumValue={1}
                    value={filterIntensity}
                    onValueChange={setFilterIntensity}
                    minimumTrackTintColor="#ff4444"
                    maximumTrackTintColor="#555"
                    thumbTintColor="#fff"
                />
            </View>
        )}
      </View>

      {/* 🔥 INSTAGRAM TARZI YUVARLAK FİLTRE MENÜSÜ */}
      <View style={styles.filterListContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {FILTERS.map((filter) => (
                <TouchableOpacity 
                    key={filter.id} 
                    style={styles.filterThumbContainer} 
                    onPress={() => {
                        setActiveFilter(filter);
                        setFilterIntensity(1); // Yeni filtre seçilince %100'e sıfırla
                    }}
                >
                    <View style={[styles.filterCircle, activeFilter.id === filter.id && styles.activeFilterCircle]}>
                        <Text style={styles.filterIconText}>{filter.name.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.filterName, activeFilter.id === filter.id && styles.activeFilterName]}>
                        {filter.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
      {isProcessing && (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={{color: 'white', marginTop: 10}}>Galeriye Kaydediliyor...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 },
  saveHeaderButton: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  primaryButton: { backgroundColor: '#ff4444', padding: 15, borderRadius: 10, marginTop: 10 },
  
  cameraContainer: { flex: 1, backgroundColor: '#111', borderRadius: 20, overflow: 'hidden', marginHorizontal: 10 },
  cameraControls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 30 },
  galleryButton: { alignItems: 'center', justifyContent: 'center' },
  captureButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: 'white' },
  
  editorContent: { flex: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  imagePreviewContainer: { width: SCREEN_WIDTH - 20, height: (SCREEN_WIDTH - 20) * 1.33, borderRadius: 20, overflow: 'hidden', backgroundColor: '#111' },
  
  sliderContainer: { flexDirection: 'row', alignItems: 'center', width: '90%', marginTop: 20, backgroundColor: 'rgba(30,30,30,0.8)', padding: 10, borderRadius: 20 },
  
  filterListContainer: { height: 120, justifyContent: 'center', paddingVertical: 15, borderTopWidth: 1, borderColor: '#222' },
  filterThumbContainer: { alignItems: 'center', marginRight: 20 },
  filterCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  activeFilterCircle: { borderColor: '#ff4444', backgroundColor: '#333' },
  filterIconText: { color: '#888', fontSize: 18, fontWeight: 'bold' },
  filterName: { color: '#888', fontSize: 12, marginTop: 8, fontWeight: '600' },
  activeFilterName: { color: 'white', fontWeight: 'bold' },
  
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 20 }
});