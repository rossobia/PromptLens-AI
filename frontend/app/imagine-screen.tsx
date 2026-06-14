// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image, Keyboard, Animated, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { generateTextToImage, refineImage } from '../src/services/aiService';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedIcon = Animated.createAnimatedComponent(MaterialIcons);

const MORPHING_ICONS = [
  { name: '✨', icon: 'auto-awesome' }, 
  { name: '💡', icon: 'lightbulb-outline' }, 
  { name: '🎨', icon: 'palette' }, 
  { name: '🚀', icon: 'rocket-launch' } 
];

export default function ImagineScreen() {
  const router = useRouter();
  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current; 
  const scaleAnim = useRef(new Animated.Value(1)).current; 
  const colorPulse = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    const iconSwitcher = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.8, duration: 300, useNativeDriver: true })
      ]).start(() => {
        setCurrentIconIndex((prev) => (prev + 1) % MORPHING_ICONS.length);
        
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 400, useNativeDriver: true })
        ]).start(() => {
            Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        });
      });
    }, 3000); 

    Animated.loop(
        Animated.sequence([
            Animated.timing(colorPulse, { toValue: 1, duration: 2500, useNativeDriver: false }),
            Animated.timing(colorPulse, { toValue: 0, duration: 2500, useNativeDriver: false })
        ])
    ).start();

    return () => clearInterval(iconSwitcher);
  }, []);

  const handleGenerate = async () => {
    if (!promptText.trim()) return alert("Lütfen hayal ettiğinizi yazın!");
    Keyboard.dismiss(); 
    // 🔥 YAZI DÜZELTİLDİ
    setProcessingMessage('Hayal Ediliyor..');
    setIsProcessing(true);
    try {
      const aiResult = await generateTextToImage(promptText);
      if (aiResult?.status === "success") setProcessedImage(aiResult.image);
      else alert("Çizilemedi.");
    } catch (e) { alert("Bağlantı hatası"); } finally { setIsProcessing(false); }
  };

  const handleRegenerate = async () => {
    Keyboard.dismiss();
    // 🔥 YAZI DÜZELTİLDİ
    setProcessingMessage('Varyasyon Çiziliyor..');
    setIsProcessing(true);
    try {
      const aiResult = await generateTextToImage(promptText);
      if (aiResult?.status === "success") setProcessedImage(aiResult.image);
      else alert("Üretilemedi.");
    } catch (e) { alert("Hata oluştu."); } finally { setIsProcessing(false); }
  };

  const handleRefineImage = async () => {
    if (!feedbackText.trim() || !processedImage) return;
    Keyboard.dismiss(); 
    // 🔥 YAZI DÜZELTİLDİ
    setProcessingMessage('Görsel Değiştiriliyor..');
    setIsProcessing(true);
    try {
      const aiResult = await refineImage(feedbackText, processedImage);
      if (aiResult?.status === "success") {
        setProcessedImage(aiResult.image);
        setFeedbackText('');
      } else alert("Varyasyon üretilemedi.");
    } catch (e) { alert("Hata oluştu."); } finally { setIsProcessing(false); }
  };

  const saveImageToGallery = async (uri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return alert("Galeri izni gerekli!");
      let base64Code = uri.includes(',') ? uri.split(',')[1] : uri;
      let filename = FileSystem.documentDirectory + `Hayal_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(filename, base64Code, { encoding: 'base64' });
      await MediaLibrary.saveToLibraryAsync(filename);
      alert("🎉 Görsel kaydedildi!");
    } catch (e) { alert("Hata oluştu."); }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      
      {/* TEPEDE SABİT BAŞLIK */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back" size={26} color="#E0E0E0" />
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
            <Text style={styles.headerTitle}>HAYAL ET</Text>
            <View style={styles.proBadge}>
               <Text style={styles.proBadgeText}>PRO</Text>
            </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0} 
      >
        {!processedImage ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.morphingHeartWrapper}>
                <Animated.View style={[styles.glowCyan, { opacity: colorPulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0.2] }) }]} />
                <Animated.View style={[styles.glowPink, { opacity: colorPulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.8] }) }]} />
                
                <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], zIndex: 10 }}>
                    <AnimatedIcon 
                        name={MORPHING_ICONS[currentIconIndex].icon} 
                        size={64} 
                        color="#FFF" 
                        style={styles.mainIcon} 
                    />
                </Animated.View>
            </View>

            <Text style={styles.mainTitle}>Bir Şeyler Hayal Et</Text>
            <Text style={styles.subtitle}>Aklından geçen büyülü dünyayı anlat. Ne görmek istiyorsan yaz, yapay zeka senin için piksellere döksün.</Text>
            
            <View style={styles.inputGlass}>
              <TextInput 
                style={styles.textInput} 
                placeholder="Örn: Kristal bir şatonun üzerinde dans eden kuzey ışıkları, fantastik sanat tarzı, epik atmosfer, 8k..." 
                placeholderTextColor="#787A91" 
                value={promptText} 
                onChangeText={setPromptText} 
                multiline={true}
                blurOnSubmit={true} 
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>

            <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.8}>
              <Text style={styles.generateBtnText}>Oluştur</Text>
              <MaterialIcons name="flare" size={20} color="#0B0C10" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            
          </ScrollView>
        ) : (
          /* 🔥 ÇÖZÜM: 2. Ekranın Menüsü (Dock) artık 'absolute' değil. Esnek yapıda. */
          <View style={styles.resultContainer}>
            {/* Resim Alanı (Geri kalan tüm boşluğu kaplar) */}
            <View style={styles.imageWrapper}>
                <Image source={{ uri: processedImage }} style={styles.resultImage} />
            </View>

            {/* Alt Menü (Klavye açılınca otomatik olarak yukarı itilir) */}
            {/* Alt Menü (Klavye açılınca otomatik olarak yukarı itilir) */}
            <BlurView intensity={70} tint="dark" style={styles.resultDock}>
              {/* 🔥 ALTTAKİ SİYAH BOŞLUĞU YUTAN SİHİRLİ YAMA */}
              <View style={{ position: 'absolute', bottom: -50, left: 0, right: 0, height: 50, backgroundColor: 'rgba(20, 20, 25, 0.9)' }} />
              
              <View style={styles.dockHandle} />
              
              <View style={styles.refineInputWrapper}>
                <TextInput 
                  style={styles.refineInput} 
                  placeholder="Bu şaheseri nasıl mükemmelleştirelim?" 
                  placeholderTextColor="#787A91" 
                  value={feedbackText} 
                  onChangeText={setFeedbackText} 
                  editable={!isProcessing} 
                  blurOnSubmit={true}
                  returnKeyType="done"
                  onSubmitEditing={handleRefineImage}
                />
                <TouchableOpacity onPress={handleRefineImage} style={styles.refineSendBtn}>
                  <MaterialIcons name="auto-fix-high" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity onPress={handleRegenerate} style={styles.actionBtnSecondary}>
                  <MaterialIcons name="refresh" size={20} color="#00E5FF" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnSecondaryText}>Varyasyon</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => saveImageToGallery(processedImage)} style={styles.actionBtnPrimary}>
                  <MaterialIcons name="save-alt" size={20} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnPrimaryText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* YÜKLEME EKRANI */}
      {isProcessing && (
        <BlurView intensity={100} tint="dark" style={styles.processingOverlay}>
          <View style={styles.processingCoreWrapper}>
              <Animated.View style={[styles.glowCyan, { opacity: colorPulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0.2] }) }]} />
              <Animated.View style={[styles.glowPink, { opacity: colorPulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.8] }) }]} />
              <Animated.View style={{ transform: [{ scale: scaleAnim }], zIndex: 10 }}>
                  <AnimatedIcon name={MORPHING_ICONS[currentIconIndex].icon} size={50} color="#FFF" />
              </Animated.View>
          </View>
          <Text style={styles.processingText}>{processingMessage}</Text>
        </BlurView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#0B0C10' }, 
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  iconButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleWrapper: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  proBadge: { backgroundColor: '#FFD700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }, 
  proBadgeText: { color: '#0B0C10', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  
  morphingHeartWrapper: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 20, alignSelf: 'center' },
  glowCyan: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#00E5FF', filter: 'blur(20px)', elevation: 10 },
  glowPink: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#FF4081', filter: 'blur(20px)', elevation: 10 },
  mainIcon: { textShadowColor: 'rgba(255,255,255,0.5)', textShadowRadius: 10 }, 

  mainTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', marginBottom: 10, letterSpacing: 0.5, textAlign: 'center' },
  subtitle: { color: '#8A8D9E', fontSize: 14, textAlign: 'center', marginBottom: 40, lineHeight: 22, paddingHorizontal: 10 },
  
  inputGlass: { width: '100%', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 20 },
  textInput: { color: '#FFF', minHeight: 120, padding: 20, textAlignVertical: 'top', fontSize: 15, lineHeight: 24 },
  
  generateBtn: { flexDirection: 'row', backgroundColor: '#00E5FF', width: '100%', paddingVertical: 18, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#00E5FF', shadowOpacity: 0.3, shadowRadius: 15, elevation: 8, marginBottom: 20 },
  generateBtnText: { color: '#0B0C10', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  
  // 🔥 ÇÖZÜM STİLLERİ: Flex yönü eklendi, Absolute kaldırıldı
  resultContainer: { flex: 1, width: '100%', backgroundColor: '#000', flexDirection: 'column' }, 
  imageWrapper: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  resultImage: { width: '100%', height: '100%', resizeMode: 'contain' }, 
  
  // 🔥 ARTIK ABSOLUTE DEĞİL! Klavye açılınca otomatik itilecek.
  resultDock: { width: '100%', padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderTopLeftRadius: 35, borderTopRightRadius: 35, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  dockHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  
  refineInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.3)', paddingLeft: 20, paddingRight: 6, paddingVertical: 6, marginBottom: 20 },
  refineInput: { flex: 1, color: '#FFF', fontSize: 15, paddingVertical: 10 },
  refineSendBtn: { backgroundColor: '#FF4081', width: 40, height: 40, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }, 
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtnSecondary: { flexDirection: 'row', flex: 1, marginRight: 10, backgroundColor: 'rgba(0, 229, 255, 0.1)', paddingVertical: 16, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.2)' },
  actionBtnSecondaryText: { color: '#00E5FF', fontWeight: '700', fontSize: 15 },
  actionBtnPrimary: { flexDirection: 'row', flex: 1, marginLeft: 10, backgroundColor: '#FF4081', paddingVertical: 16, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#FF4081', shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  actionBtnPrimaryText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  
  processingOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  processingCoreWrapper: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center' },
  processingText: { color: '#FFF', marginTop: 30, fontSize: 15, fontWeight: '700', letterSpacing: 1 }
});