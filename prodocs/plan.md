# 🚀 PromptLens AI - Geliştirme Yol Haritası (LLM-Ready)

**Proje-ID:** PromptLens-2026
**Mimari:** Ayrık Yapı (FastAPI Backend | React Native Frontend)

---

## [ADIM-01] Altyapı ve İskelet Kurulumu
- [x] **Backend-Başlatma:** FastAPI servisinin oluşturulması ve kök (root) uç noktasının tanımlanması.
- [x] **API-Dokümantasyonu:** Swagger/OpenAPI dokümantasyonunun aktif edilmesi.
- [ ] **Frontend-Başlatma:** Expo React Native projesinin ilklendirilmesi.
- [ ] **Ağ El Sıkışması:** Mobil istemci ile yerel ağdaki API arasında iletişimin kurulması.

## [ADIM-02] Temel Yapay Zeka ve Kamera Entegrasyonu
- [ ] **Kamera Modülü:** Canlı önizleme için `expo-camera` entegrasyonu.
- [ ] **AI Çalışma Zamanı:** Cihaz üzeri çıkarım (on-device inference) için TensorFlow Lite entegrasyonu.
- [ ] **Stil Eşleştirme:** Stil seçimi için prompt-model eşleştirme sözlüğünün (dictionary) oluşturulması.
- [ ] **Çıkarım Testi:** Canlı video akışı üzerinde ilk stil transferinin gerçekleştirilmesi.

## [ADIM-03] Kullanıcı Arayüzü (UI/UX) ve Medya Yönetimi
- [ ] **Düzen Tasarımı:** Prompt giriş alanı ve stil seçim galerisi arayüzünün inşası.
- [ ] **Medya Kaydetme:** Çıktıların yüksek çözünürlükte galeriye kaydedilmesi için `expo-media-library` kullanımı.
- [ ] **Performans:** Eski iPhone modelleri için kare hızının (FPS) optimize edilmesi.

## [ADIM-04] Finalizasyon ve Teslim
- [ ] **Hata Ayıklama:** Bellek sızıntısı (memory leak) kontrolleri ve pil tüketim analizleri.
- [ ] **Sunum:** Swagger dökümanları ve gerçek zamanlı iPhone demosu ile final sunumunun hazırlanması.
