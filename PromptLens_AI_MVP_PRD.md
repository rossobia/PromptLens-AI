# 📄 Product Requirements Document (PRD): PromptLens AI v1.0 (MVP)

**Hazırlayan:** Senior Product Specialist / CPO (15 Yıllık Deneyim & 3 Unicorn Süzgeciyle)
**Durum:** Devre Hazır (Handoff-Ready)
**Hedef Platform:** iOS (CoreML) & Android (TFLite)

---

## 1. Ürün Vizyonu ve Hedef
PromptLens AI, karmaşık yapay zeka süreçlerini (Generative AI/Style Transfer) kullanıcı için basitleştiren bir "sihirli pencere"dir. Kullanıcının hayal gücünü (prompt), bulut maliyeti olmadan ve gizlilikten ödün vermeden (on-device) anlık bir görsel deneyime dönüştürür.

---

## 2. Kullanıcı Hikayeleri (User Stories)
* **US.1:** Bir kullanıcı olarak, ekrana bir metin girdiğimde kameramın atmosferinin saniyeler içinde o metne uygun bir tarza bürünmesini istiyorum.
* **US.2:** Bir içerik üreticisi olarak, bu sanatsal filtrelerle takılma (lag) olmadan video kaydedip sosyal medyada paylaşmak istiyorum.
* **US.3:** Bir ücretsiz kullanıcı olarak, uygulamanın yeteneklerini sınırlı da olsa deneyimleyip, değer görürsem abone olmak istiyorum.

---

## 3. Fonksiyonel Gereksinimler (Functional Requirements)

### 3.1. Akıllı Prompt Motoru ve Semantic Mapping
Bu bölüm uygulamanın "beyni"dir. Kullanıcı her yazdığına yeni bir model eğitmez; mevcut modeller arasında köprü kurarız.
* **FR.1 (Keyword Mapping):** Gelen prompt, bir NLP (Natural Language Processing) kütüphanesi ile tokenize edilmeli. Eğer prompt içinde "anime, çizgi film, manga" geçiyorsa `anime_style_v1.tflite` tetiklenmeli.
* **FR.2 (Default Fallback):** Eğer prompt hiçbir kategoriye girmiyorsa, en yakın "Artistic" genel modeline yönlendirilmelidir.
* **FR.3 (Prompt Enhancer):** Kullanıcı "korku" yazdığında, sistem arkada bu kelimeyi `dark, eerie, fog, horror movie cinematic lighting` olarak genişletip stile beslemelidir.

### 3.2. Real-Time Style Transfer Engine
* **FR.4 (On-Device Processing):** Görüntü işleme kesinlikle cihazın GPU/NPU biriminde yapılmalıdır. API çağrısı ile frame gönderilmeyecektir.
* **FR.5 (Frame Rate Control):** Akıcı bir deneyim için hedef 20-24 FPS’tir. Eğer donanım yetersizse çözünürlük dinamik olarak düşürülmelidir.

### 3.3. Medya Kayıt ve Filigran (Watermark)
* **FR.6 (Video Encoding):** Stil uygulanmış frame'ler real-time olarak H.264 formatında encode edilmelidir.
* **FR.7 (Dynamic Watermark):** Ücretsiz sürümde, sağ alt köşeye %30 opacity ile "PromptLens" logosu eklenmelidir.

---

## 4. Teknik Mimari (Developer Handoff)

* **Model Formatı:** Quantized (8-bit) .tflite / .mlmodel (Düşük dosya boyutu ve yüksek performans için).
* **Kütüphaneler:**
    * **iOS:** Metal Performance Shaders (MPS), CoreML.
    * **Android:** CameraX + GPU Delegate, TensorFlow Lite.
* **Mimari:** MVVM (Model-View-ViewModel). Kamera stream'i ile UI logic birbirinden tamamen ayrılmalı.

---

## 5. Non-Functional Requirements (Kritik Başarı Kriterleri)

| Kriter | Hedef Değer | Açıklama |
| :--- | :--- | :--- |
| **Gecikme (Latency)** | < 100ms | Filtre değişim anındaki görsel geçiş hızı. |
| **Uygulama Boyutu** | < 150 MB | 8 modelin her biri ~10-15MB arası tutmalı. |
| **Isınma Kontrolü** | Orta Seviye | 5 dakikalık kullanımda cihazın termal throtelling yapmaması. |
| **Batarya Tüketimi** | Optimize | İşlemci yükünü GPU'ya kaydırarak CPU kullanımını %20 altında tutmak. |

---

## 6. Kullanıcı Akışı (UI/UX)
1. **Splash Screen:** Minimalist logo ve marka kimliği.
2. **Permissions:** Kamera ve Galeri izni (Neden istendiği UX diliyle açıklanarak).
3. **Main Screen:** Tam ekran kamera view, altta "What do you imagine?" prompt giriş kutusu.
4. **Processing State:** Prompt girildiği an kutucukta hafif bir parılama (shimmer) efekti (Psikolojik bekleme süresi yönetimi).
5. **Active State:** Filtre aktif. Sağda "Kaydet/Deklanşör" butonu.

---

## 7. Monetizasyon ve Paywall Stratejisi
* **Trigger Point:** Kullanıcı 3. promptunu girdiğinde "Sınırsız Hayal Gücü" başlığıyla bir abonelik (Paywall) ekranı gösterilir.
* **Ücretsiz Sınırlar:** Günlük 3 prompt, 5 hazır filtre, filigranlı çıktı.
* **Premium:** Sınırsız prompt, reklamsız deneyim, filigransız 4K kayıt.

---

## 8. MVP Sonrası Yol Haritası (V1.1+)
1. **Style Mixing:** İki farklı modeli yüzdelik oranla karıştırma (Örn: %50 Cyberpunk + %50 Van Gogh).
2. **Voice-to-Style:** Promptu klavyeden değil, sesle girme.
3. **Community Presets:** En çok kullanılan başarılı promptların "Trend" listesi olarak sunulması.

---
**CPO'dan Yazılımcıya Not:** *Dostum, odak noktamız performans. Modelleri 'quantize' etmeyi unutma, aksi takdirde telefonlar el yakar. Semantic mapping kısmında başlangıçta basit bir dictionary yapısıyla ilerleyelim, karmaşık NLP modellerini V2'ye saklayalım.*
