import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

export default function SubscriptionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Arka Plan (Sanki arkada kamera açıkmış gibi koyu bir zemin) */}
      <View style={styles.backgroundMock} />
      
      {/* Aşağıdan Çıkan Cam Efektli Modal (Bottom Sheet) */}
      <BlurView intensity={70} tint="dark" style={styles.bottomSheet}>
        
        {/* Sürükleme Çubuğu */}
        <View style={styles.dragHandle} />

        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>Unlock Pro</Text>
          <Text style={styles.subtitle}>Gelişmiş yapay zeka araçlarıyla yaratıcılığınızı zirveye taşıyın.</Text>
        </View>

        <ScrollView style={styles.featuresList} showsVerticalScrollIndicator={false}>
          {/* Özellik 1 */}
          <View style={styles.featureItem}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="check-circle" size={24} color={colors.secondary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Sınırsız Yapay Zeka İşlemi</Text>
              <Text style={styles.featureDesc}>Günlük üretim ve geliştirme limiti yok.</Text>
            </View>
          </View>

          {/* Özellik 2 */}
          <View style={styles.featureItem}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="check-circle" size={24} color={colors.secondary} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Filigranları Kaldırın</Text>
              <Text style={styles.featureDesc}>Profesyonel kullanım için tertemiz, logosuz çıktılar alın.</Text>
            </View>
          </View>

          {/* Özellik 3 */}
          <View style={[styles.featureItem, styles.featureItemHighlight]}>
            <View style={styles.iconWrapper}>
              <MaterialIcons name="check-circle" size={24} color={colors.secondary} />
            </View>
            <View style={styles.featureTextContainer}>
              <View style={styles.newBadgeRow}>
                <Text style={styles.featureTitle}>4K Ultra HD Çıktı</Text>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>YENİ</Text>
                </View>
              </View>
              <Text style={styles.featureDesc}>Baskı ve yüksek çözünürlüklü ekranlar için maksimum kalite.</Text>
            </View>
          </View>
        </ScrollView>

        {/* Fiyatlandırma ve Buton */}
        <View style={styles.pricingSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.currencySymbol}>₺</Text>
            <Text style={styles.priceText}>99</Text>
            <Text style={styles.pricePeriod}>/ay</Text>
          </View>
          <Text style={styles.cancelText}>İstediğiniz zaman iptal edin. Aylık faturalandırılır.</Text>

          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>Abone Ol</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Abone olarak, Hizmet Şartlarımızı ve Gizlilik Politikamızı kabul etmiş olursunuz.
          </Text>
        </View>

      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05070a', justifyContent: 'flex-end' },
  backgroundMock: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0a0d14', opacity: 0.8 },
  
  bottomSheet: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', flex: 1, width: '100%' },
  dragHandle: { width: 48, height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, alignSelf: 'center', marginBottom: 24 },
  
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  
  featuresList: { marginBottom: 24, flexGrow: 0 },
  featureItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  featureItemHighlight: { borderColor: 'rgba(0,240,255,0.3)', backgroundColor: 'rgba(0,240,255,0.05)' },
  iconWrapper: { backgroundColor: 'rgba(0,240,255,0.1)', padding: 8, borderRadius: 20, marginRight: 16 },
  featureTextContainer: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  featureDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  
  newBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  newBadge: { backgroundColor: colors.secondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  newBadgeText: { color: '#003734', fontSize: 10, fontWeight: 'bold' },
  
  pricingSection: { alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16, marginTop: 'auto' },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  currencySymbol: { fontSize: 24, fontWeight: 'bold', color: colors.textSecondary, marginRight: 4 },
  priceText: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  pricePeriod: { fontSize: 16, color: colors.textSecondary, marginLeft: 4 },
  cancelText: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  
  subscribeButton: { backgroundColor: colors.primary, width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  subscribeButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  termsText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingHorizontal: 20 }
});