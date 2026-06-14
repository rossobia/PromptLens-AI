# 🚀 MVP Kapsam Dökümanı: PromptLens AI (Güncel)

**Proje Tanımı:** Kullanıcının girdiği promptları (metinleri) anlamsal olarak analiz eden ve cihaz üzerindeki (on-device) stil transferi modelleriyle eşleştirerek kameraya anlık (real-time) sanatsal atmosferler uygulayan bir mobil uygulama.

## 1. Temel Fonksiyonlar (Must-Have)
* **Real-Time Kamera Arayüzü:** Saniyede 20+ kare hızla çalışan, takılmayan canlı önizleme.
* **Akıllı Prompt Girişi:** Kullanıcının metin yazabileceği ve "Apply" diyebileceği bir giriş alanı.
* **On-Device Style Engine:** Hiçbir sunucu maliyeti olmadan, işlemin tamamen telefonun işlemcisinde (CoreML/TFLite) dönmesi.
* **Fotoğraf/Video Kaydı:** Uygulanan filtre ile galeriye yüksek kaliteli medya kaydetme.
* **Filtre Kütüphanesi (Pre-sets):** En az 6-8 adet "garanti çalışan" temel stil modeli (Cyberpunk, Van Gogh, Anime, Retro vb.).

## 2. Teknik Mimari ve "Maksimum Verim" Mantığı
Burası senin mühendislik farkını koyacağın yer:

### A. Semantic Mapping (Anlamsal Eşleştirme)
Kullanıcı bir prompt girdiğinde, sistem bunu senin elindeki modellerle eşleştirir.
* **Senaryo:** Kullanıcı "Pikachu dünyası" yazar -> Sistem "Anime" modelini yükler.
* **Senaryo:** Kullanıcı "Lego" yazar -> Sistem "Brick/Texture" modelini yükler.

### B. Prompt Enhancer (Zenginleştirici)
Kullanıcı kısa bir kelime yazdığında (örn: "karanlık"), uygulama bunu arkada teknik parametrelerle besler: "Dark, moody lighting, high contrast, cinematic shadows, 4k".

### C. Zero-Server Cost (Sıfır Sunucu Maliyeti)
* **Teknoloji:** Apple CoreML (iOS) veya Google TensorFlow Lite (Android).
* **Model:** Optimize edilmiş "Fast Style Transfer" modelleri (.mlmodel veya .tflite formatında).

## 3. Kullanıcı Akışı (User Flow)
1. **Açılış:** Kamera izni istenir ve canlı görüntü başlar.
2. **Prompt Girişi:** Kullanıcı alt kısımdaki kutucuğa hayalindeki tarzı yazar (Örn: "Neon Şehir").
3. **Akıllı İşleme:** Uygulama saniyeler içinde (veya anlık) en uygun modeli tetikler.
4. **Deneyim:** Kamera görüntüsü değişir. Kullanıcı hareket ettikçe filtre bozulmadan yüze ve ortama oturur.
5. **Kayıt:** Deklanşöre basılır ve sonuç sosyal medyada paylaşılmaya hazır hale gelir.

## 4. Abonelik ve Gelir Modeli (Freemium)
Yeni mezun bir geliştirici olarak sürdürülebilir bir iş modeli kurmalısın:

| Özellik | Ücretsiz Versiyon | Premium (Abonelik) |
| :--- | :--- | :--- |
| **Hazır Filtreler** | 5 adet klasik filtre | Tüm kütüphaneye erişim |
| **Özel Prompt** | Günlük 3 hak | Sınırsız prompt girişi |
| **Filigran** | "PromptLens" yazısı eklenir | Yazısız temiz çıktı |
| **Video Süresi** | Maksimum 10 saniye | Sınırsız video kaydı |

## 5. Başarı Kriterleri (Eğitim Programı Hedefleri)
* **Performans:** Uygulama eski model telefonlarda bile kilitlenmeden çalışmalı.
* **UX:** Prompt yazıldıktan sonra filtreye geçiş hızı 1 saniyenin altında olmalı.
* **Boyut:** Uygulama boyutu (modeller dahil) 150MB'ı geçmemeli (mağazadan indirme kolaylığı için).

---
**💡 Mühendislik Notun (Sunum İçin Hazırla):**
"Bu projede 'Generative AI' trendini, 'Edge Computing' (Cihaz Üzeri Hesaplama) prensipleriyle birleştirdim. Amacım, kullanıcıya sınırsız bir sanatsal özgürlük hissi verirken, işletme maliyetini (sunucu masrafını) sıfırda tutmaktı."
