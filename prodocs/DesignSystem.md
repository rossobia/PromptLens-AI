# 🎨 Design System (Tasarım Sistemi)

PromptLens AI projesinde kullanıcı deneyimini (UX) en üst düzeye çıkarmak ve kod tabanında görsel tutarlılığı sağlamak amacıyla aşağıdaki tasarım kuralları ve standartları belirlenmiştir.

## 1. 🌈 Renk Paleti (Color Palette)
Uygulama, yapay zekanın modern ve fütüristik yapısını yansıtmak amacıyla "Dark Theme" (Koyu Tema) ağırlıklı olarak tasarlanmıştır.

* **Primary Background (Ana Arka Plan):** `#121212` - Göz yormayan, derin koyu gri/siyah.
* **Surface / Card Background (Kart Arka Planı):** `#1E1E1E` - İçeriklerin arka plandan ayrışmasını sağlayan bir ton açık gri.
* **Primary Accent (Ana Vurgu Rengi):** `#FFCD7` (Premium Sarı) Yapay zeka üretim süreçlerini, butonları ve aktif durumları vurgulamak için.
* **Premium Accent (Premium Vurgusu):** `#FFD700` (Gold) - Premium üyelik ve özel özelliklerin (Sihirli Silgi vb.) belirtilmesi için.
* **Text Primary (Ana Metin):** `#FFFFFF` - %100 Beyaz (Yüksek okunabilirlik için).
* **Text Secondary (Alt Metin/Açıklama):** `#A0A0A0` - Gri (Gözü yormayan, ikincil bilgi metinleri için).
* **Error / Destructive (Hata ve Silme):** `#CF6679` - Hata mesajları veya objeyi silme gibi işlemler için.

## 2. 🔠 Tipografi (Typography)
Uygulama genelinde temiz, modern ve okunabilirliği yüksek sans-serif font ailesi (platforma özgü System Fonts veya Inter/Poppins) tercih edilmiştir.

* **H1 (Büyük Başlıklar):** 32px, Bold (Uygulama karşılama ekranı, ana sayfa başlıkları).
* **H2 (Alt Başlıklar):** 24px, Semi-Bold (Modüller ve sayfa içi bölüm başlıkları).
* **Body (Gövde Metni):** 16px, Regular (Standart açıklamalar, prompt giriş alanları).
* **Caption (Küçük Yazılar):** 12px, Light (Telif hakları, resim altı uyarıları, etiketler).

## 3. 🧩 Component Kuralları (Component Guidelines)

### Butonlar (Buttons)
* **Primary Button:** Arka plan "Primary Accent" renginde olmalı, metin rengi koyu (`#121212`) olmalı. Köşe yuvarlamaları (Border Radius) `12px` veya `16px` (yumuşatılmış köşeler) olarak ayarlanmalıdır.
* **Secondary Button:** Arka plan şeffaf, çerçeve (border) "Primary Accent" renginde olmalıdır. İptal veya ikincil işlemler için kullanılır.
* **Disabled Button:** Arka plan `#444444`, metin `#888888` olmalı. Tıklanabilirlik (Opacity) %50'ye düşürülmelidir.

### Girdi Alanları (Input Fields)
* Prompt yazım alanları geniş ve ferah olmalıdır (`min-height: 100px`).
* Aktifken (Focused) çerçevenin rengi ana vurgu rengine dönmeli ve kullanıcıya görsel geri bildirim sağlamalıdır.
* Kullanıcının metin yazarken gözünün yorulmaması için arka plan rengi `Surface` renginde (`#1E1E1E`) tutulmuştur.

### Kartlar ve Resim Çerçeveleri (Cards & Image Containers)
* Üretilen görsellerin sunulduğu kartlar `16px` köşe yuvarlama (Border Radius) değerine sahip olmalıdır.
* Görsellerin etrafında hafif bir gölge (Drop Shadow) kullanılarak arka plandan derinlik hissiyle ayrılması sağlanmalıdır. (Shadow Color: `#000000`, Opacity: 0.3).

## 4. 📏 Boşluk ve Boyutlandırma (Spacing & Sizing)
Arayüz bileşenleri arasında standart ve simetrik bir görünüm sağlamak için **8pt Grid Sistemi** kullanılmıştır. 
* **Margin/Padding:** 8px (Küçük), 16px (Standart), 24px (Büyük), 32px (Bölüm arası geniş boşluk).