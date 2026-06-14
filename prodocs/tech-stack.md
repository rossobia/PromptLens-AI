# 🛠️ Tech Stack & Architecture (Teknoloji Yığını ve Mimari)

Bu belge, PromptLens AI projesinde kullanılan teknolojilerin dökümünü, mimari kararların arkasındaki mühendislik gerekçelerini ve geliştirme sürecindeki yapay zeka entegrasyonlarını detaylandırmaktadır.

## 1. Kullanılan Teknolojiler

**Mobil Ön Yüz (Frontend):**
* **Framework:** React Native
* **Geliştirme Ortamı:** Expo
* **Dil:** TypeScript / JavaScript
* **Temel Kütüphaneler:** `expo-camera` (Kamera entegrasyonu), `expo-file-system` (Cihaz içi dosya yönetimi)

**Arka Plan (Backend):**
* **Dil:** Python
* **Web Framework:** FastAPI
* **Sunucu:** Uvicorn
* **Güvenlik:** `python-dotenv` (Çevre değişkenleri ve API güvenliği)

**Yapay Zeka & Servisler (AI & Services):**
* **Görüntü İşleme Motoru:** Fal.ai API
* **Modeller:** Flux ailesi (Text-to-Image, Inpainting, Image-to-Image)

---

## 2. Servis Seçimlerinin Gerekçeleri

### Neden React Native ve Expo?
Mobilite ve hız odaklı bir proje kurgulandığı için uygulamanın hem iOS hem de Android platformlarında tek bir kod tabanıyla çalışması hedeflendi. Expo'nun sunduğu hazır native modüller (kamera, dosya sistemi), prototipleme sürecini ciddi şekilde hızlandırdı ve cihaz donanımlarına erişim karmaşasını ortadan kaldırdı.

### Neden Python ve FastAPI?
Yapay zeka ekosisteminin endüstri standardı Python'dur. Ağır görüntü işleme isteklerinin mobil cihazı yormaması için tüm yük asenkron bir backend mimarisine devredildi. FastAPI'nin seçilme nedeni ise, isminden de anlaşıldığı gibi **yüksek hız** ve **asenkron (async/await)** yapısıyla API isteklerini tıkanmadan, eşzamanlı olarak işleyebilme kapasitesidir. 

### Neden Fal.ai ve Flux?
Gelişmiş yapay zeka modellerini mobil cihazın kendi işlemcisiyle çalıştırmak donanımsal olarak imkansıza yakındır. Fal.ai, Flux modelleri üzerinden milisaniyeler içinde yüksek kaliteli sonuçlar döndüren, bulut tabanlı, son derece optimize bir altyapı sunduğu için tercih edildi.

---

## 3. Geliştirme Sürecinde AI Kullanımı (AI-Assisted Development)

PromptLens AI, sadece bir yapay zeka ürünü olmakla kalmayıp, geliştirilme sürecinin çekirdeğinde de modern yapay zeka araçlarından faydalanılan bir projedir:

* **Cursor ve LLM API Entegrasyonu:** Kodlama sürecinde Gemini Pro, Chatgpt gibi yapay zeka destekli modern editörlerden aktif olarak faydalanıldı. Mimari kurguların oluşturulması, hata ayıklama (debugging) süreçleri ve boilerplate (tekrar eden) kodların hızlıca yazılmasında LLM'ler birer "çift programlama (pair programming)" asistanı olarak kullanıldı.
* **Prompt Mühendisliği:** Backend tarafında kullanıcının girdiği basit cümleleri (prompt), yapay zekanın anlayabileceği daha detaylı ve profesyonel komutlara dönüştüren ara katmanlar inşa edildi.
* **Refactoring:** Spagetti koda dönüşebilecek karmaşık fonksiyonlar, AI kod asistanları ile analiz edilerek daha temiz, modüler ve okunabilir hale (Clean Code) getirildi.