// @ts-nocheck
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import Svg, { Defs, Filter, FeColorMatrix, FeComponentTransfer, FeFuncR, FeFuncG, FeFuncB, Image as SvgImage } from 'react-native-svg';
import { getSmartFilterParameters } from '../src/services/aiService'; // Bir önceki adımda eklediğimiz API servisi

const SCREEN_WIDTH = Dimensions.get('window').width;
const CANVAS_SIZE = Math.floor(SCREEN_WIDTH);

export default function SmartStyleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageUri = typeof params.imageUri === 'string' ? params.imageUri : null;

  const viewShotRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  // Yapay zekadan gelecek değerleri tuttuğumuz state
  const [adjustments, setAdjustments] = useState({
    exposure: 0, brightness: 0, contrast: 0, saturation: 0, warmth: 0
  });

  // 🧠 YAPAY ZEKA BAĞLANTISI
  const applySmartFilter = async () => {
    if (!prompt.trim()) return alert("Lütfen bir atmosfer yazın.");
    setIsProcessing(true);
    try {
      const aiResult = await getSmartFilterParameters(prompt);
      if (aiResult?.status === "success" && aiResult.parameters) {
        const p = aiResult.parameters;
        // Gelen değerleri -100 ile +100 arasında sınırla
        setAdjustments({
           exposure: Math.max(-100, Math.min(100, p.exposure || 0)),
           brightness: Math.max(-100, Math.min(100, p.brightness || 0)),
           contrast: Math.max(-100, Math.min(100, p.contrast || 0)),
           saturation: Math.max(-100, Math.min(100, p.saturation || 0)),
           warmth: Math.max(-100, Math.min(100, p.warmth || 0))
        });
      } else {
        alert("Atmosfer oluşturulamadı.");
      }
    } catch (error) {
      alert("Bağlantı hatası.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return alert("Galeri izni gerekli!");
      
      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      alert("🎉 Akıllı stilin galerine kaydedildi!");
    } catch (error) {
      alert("Hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 🧮 MATRİS MATEMATİĞİ (-100 ile +100 formülleri)
  const b = adjustments.brightness / 100; 
  const c = (adjustments.contrast + 100) / 100; 
  const s = (adjustments.saturation + 100) / 100; 
  const w = adjustments.warmth / 100; 
  const e = (adjustments.exposure + 100) / 100; 
  const ce = c * e;

  const customMatrix = [
    ce, 0, 0, 0, b + w,
    0, ce, 0, 0, b,
    0, 0, ce, 0, b - w,
    0, 0, 0, 1, 0
  ].join(' ');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                <MaterialIcons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AKILLI STİL</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
                <Text style={{color: 'black', fontWeight: 'bold'}}>KAYDET</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.canvasWrapper}>
                <ViewShot ref={viewShotRef} collapsable={false} options={{ format: "jpg", quality: 1.0 }} style={styles.captureArea}>
                    
                    {/* SVG MOTORU (Pikselleri asla bozmaz, sadece ışık/renk ekler) */}
                    <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
                        <Defs>
                            <Filter id="smartFilter">
                                <FeColorMatrix type="saturate" values={s.toString()} result="sat" />
                                <FeColorMatrix type="matrix" values={customMatrix} />
                            </Filter>
                        </Defs>
                        <SvgImage href={{ uri: imageUri }} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" filter="url(#smartFilter)" />
                    </Svg>

                </ViewShot>
            </View>
            
            {isProcessing && (
                <View style={styles.processingOverlay}>
                    <ActivityIndicator size="large" color="#00f0ff" />
                    <Text style={{color: 'white', marginTop: 10, fontWeight: 'bold'}}>AI Atmosferi Kuruyor...</Text>
                </View>
            )}
          </View>

          {/* ALT KISIM: PROMPT GİRİŞ ALANI */}
          <View style={styles.footer}>
              <Text style={styles.footerLabel}><MaterialIcons name="auto-awesome" size={16} color="#00f0ff" /> İstediğin atmosferi yaz</Text>
              <View style={styles.inputContainer}>
                  <TextInput 
                      style={styles.textInput} 
                      placeholder="Örn: Siberpunk sokakları, neon ışıklar..." 
                      placeholderTextColor="#666" 
                      value={prompt} 
                      onChangeText={setPrompt} 
                  />
                  <TouchableOpacity style={styles.sendButton} onPress={applySmartFilter}>
                      <MaterialIcons name="send" size={24} color="black" />
                  </TouchableOpacity>
              </View>
              
              <View style={styles.infoBox}>
                  <MaterialIcons name="info-outline" size={16} color="#888" />
                  <Text style={styles.infoText}>Görselin pikselleri bozulmaz, yapay zeka sadece uygun ışık ve renk filtrelerini matematiksel olarak hesaplar.</Text>
              </View>
          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  saveHeaderButton: { backgroundColor: '#00f0ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', paddingVertical: 10 },
  canvasWrapper: { width: SCREEN_WIDTH - 20, flex: 1, maxHeight: (SCREEN_WIDTH - 20) * 1.33, backgroundColor: '#111', overflow: 'hidden', borderRadius: 10 }, 
  captureArea: { width: '100%', height: '100%', backgroundColor: 'transparent' },
  
  processingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  
  footer: { width: '100%', padding: 25, backgroundColor: '#111', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  footerLabel: { color: '#00f0ff', fontWeight: 'bold', marginBottom: 15, fontSize: 14 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  textInput: { flex: 1, backgroundColor: '#050505', color: 'white', padding: 15, borderRadius: 15, fontSize: 14, borderWidth: 1, borderColor: '#333' },
  sendButton: { backgroundColor: '#00f0ff', padding: 15, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 10 },
  infoText: { color: '#888', fontSize: 10, flex: 1, lineHeight: 14 }
});