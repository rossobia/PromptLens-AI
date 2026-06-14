from deep_translator import GoogleTranslator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import io
import cv2
import numpy as np
from PIL import Image
import requests
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⚠️ FAL.AI ANAHTARIN
import os
from dotenv import load_dotenv

# .env kasasını bulup okur
load_dotenv()

# Şifreyi kasadan güvenle çeker
FAL_API_KEY = os.getenv("FAL_API_KEY")
# =====================================================================
# VERI MODELLERI
# =====================================================================
class AIRequest(BaseModel):
    prompt: str
    user_id: str
    image_base64: str

class TextToImageRequest(BaseModel):
    prompt: str
    user_id: str

class UpscaleRequest(BaseModel):
    image_base64: str
    user_id: str

class RefineRequest(BaseModel):
    feedback_prompt: str
    image_base64: str
    user_id: str

class RemoveRequest(BaseModel):
    object_name: str
    image_base64: str
    user_id: str

class MaskRemoveRequest(BaseModel):
    image_base64: str
    mask_base64: str

class BGRemoveRequest(BaseModel):
    image_base64: str 

class PortraitRequest(BaseModel):
    image_base64: str

class SmartFilterRequest(BaseModel):
    prompt: str


# =====================================================================
# YARDIMCI FONKSIYONLAR
# =====================================================================
def apply_premium_fallback(img):
    if img is None:
        return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 3)
    edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 9, 7)
    color = cv2.bilateralFilter(img, 9, 150, 150)
    return cv2.bitwise_and(color, color, mask=edges)

def get_theme_settings(theme_input):
    theme = theme_input.lower()
    if "van gogh" in theme or "yağlı boya" in theme:
        return {"instruction": "Thick impasto oil painting style of Vincent Van Gogh.", "strength": 0.60, "depth_scale": 0.85}
    elif "cyberpunk" in theme or "siberpunk" in theme:
        return {"instruction": "Futuristic neon cyberpunk aesthetic, glowing lights.", "strength": 0.75, "depth_scale": 0.70}
    elif "karakalem" in theme or "sketch" in theme:
        return {"instruction": "Highly detailed pencil sketch, monochrome.", "strength": 0.85, "depth_scale": 0.90}
    elif "anime" in theme:
        return {"instruction": "Japanese anime style, Studio Ghibli aesthetic.", "strength": 0.65, "depth_scale": 0.80}
    else:
        return {"instruction": f"Highly detailed {theme} aesthetic.", "strength": 0.65, "depth_scale": 0.80}


# =====================================================================
# ÖZELLİK 1: FOTOĞRAF STİLİ DÖNÜŞTÜRÜCÜ
# =====================================================================
@app.post("/api/ai/analyze-prompt")
def analyze_prompt(request: AIRequest):
    print("\n--------------------------------------------------")
    print(f"🧠 [STİL MOTORU] İstek: '{request.prompt}'")

    if "," in request.image_base64:
        header, encoded = request.image_base64.split(",", 1)
    else:
        header, encoded = "", request.image_base64

    encoded += "=" * ((4 - len(encoded) % 4) % 4)

    try:
        init_image_bytes = base64.b64decode(encoded)
        pil_image = Image.open(io.BytesIO(init_image_bytes)).convert("RGB")
        pil_image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        
        byte_arr = io.BytesIO()
        pil_image.save(byte_arr, format='JPEG') 
        image_uri = f"data:image/jpeg;base64,{base64.b64encode(byte_arr.getvalue()).decode('utf-8')}"
        
        settings = get_theme_settings(request.prompt)
        advanced_prompt = f"Redraw this exact scene applying the following style: {settings['instruction']} Maintain the exact spatial layout and original objects. Masterpiece, 8k."

        response = requests.post(
            "https://fal.run/fal-ai/flux-general/image-to-image",
            headers={"Authorization": f"Key {FAL_API_KEY}", "Content-Type": "application/json"},
            json={
                "prompt": advanced_prompt,
                "image_url": image_uri,
                "strength": settings['strength'],
                "guidance_scale": 5.0,
                "easycontrols": [{"control_method_url": "depth", "image_url": image_uri, "scale": settings['depth_scale'], "image_control_type": "spatial"}]
            }
        )

        if response.status_code == 200:
            result = response.json()
            if "images" in result and len(result["images"]) > 0:
                res_img = requests.get(result["images"][0]["url"])
                processed_base64 = base64.b64encode(res_img.content).decode('utf-8')
                return {"status": "success", "image": f"data:image/jpeg;base64,{processed_base64}"}
        raise Exception("Fal.ai Hatası")
    except Exception as e:
        print(f"❌ HATA: {str(e)}")

    print("🛡️ Güvenli Mod: Lokal filtre devrede...")
    try:
        nparr = np.frombuffer(base64.b64decode(encoded), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None: return {"status": "error", "message": "Bozuk fotoğraf verisi."}
        result_img = apply_premium_fallback(img)
        _, buffer = cv2.imencode('.jpg', result_img)
        local_base64 = base64.b64encode(buffer).decode('utf-8')
        return {"status": "success", "image": f"data:image/jpeg;base64,{local_base64}"}
    except:
        return {"status": "error", "message": "Görsel işlenemedi."}


# =====================================================================
# ÖZELLİK 2: SIFIRDAN HAYAL ET (Text-to-Image)
# =====================================================================
@app.post("/api/ai/text-to-image")
def text_to_image(request: TextToImageRequest):
    print("\n--------------------------------------------------")
    print(f"🎨 [METİNDEN RESME] İstek: '{request.prompt}'")
    try:
        translated_prompt = GoogleTranslator(source='tr', target='en').translate(request.prompt)
        response = requests.post(
            "https://fal.run/fal-ai/flux/dev",
            headers={"Authorization": f"Key {FAL_API_KEY}", "Content-Type": "application/json"},
            json={"prompt": translated_prompt, "image_size": "square_hd", "num_inference_steps": 28}
        )
        if response.status_code == 200:
            result = response.json()
            if "images" in result and len(result["images"]) > 0:
                res_img = requests.get(result["images"][0]["url"])
                generated_base64 = base64.b64encode(res_img.content).decode('utf-8')
                return {"status": "success", "image": f"data:image/jpeg;base64,{generated_base64}"}
        return {"status": "error", "message": "Yapay zeka yanıt vermedi."}
    except Exception as e:
        return {"status": "error", "message": f"Sunucu hatası: {type(e).__name__}"}


# =====================================================================
# ÖZELLİK 3: AI ULTRA HD NETLEŞTİRİCİ
# =====================================================================
@app.post("/api/ai/upscale")
def upscale_image(request: UpscaleRequest):
    print("\n--------------------------------------------------")
    print("💎 [AI 4K NETLEŞTİRİCİ] Restore ediliyor...")
    if "," in request.image_base64:
        header, encoded = request.image_base64.split(",", 1)
    else:
        header, encoded = "", request.image_base64
    encoded += "=" * ((4 - len(encoded) % 4) % 4)
    try:
        init_image_bytes = base64.b64decode(encoded)
        pil_image = Image.open(io.BytesIO(init_image_bytes)).convert("RGB")
        byte_arr = io.BytesIO()
        pil_image.save(byte_arr, format='JPEG') 
        image_uri = f"data:image/jpeg;base64,{base64.b64encode(byte_arr.getvalue()).decode('utf-8')}"
        response = requests.post(
            "https://fal.run/fal-ai/aura-sr",
            headers={"Authorization": f"Key {FAL_API_KEY}", "Content-Type": "application/json"},
            json={"image_url": image_uri}
        )
        if response.status_code == 200:
            result = response.json()
            if "image" in result and "url" in result["image"]:
                res_img = requests.get(result["image"]["url"])
                upscaled_base64 = base64.b64encode(res_img.content).decode('utf-8')
                return {"status": "success", "image": f"data:image/jpeg;base64,{upscaled_base64}"}
        return {"status": "error", "message": "Netleştirme başarısız."}
    except Exception as e:
        return {"status": "error", "message": f"Sunucu hatası: {type(e).__name__}"}


# =====================================================================
# ÖZELLİK 4: VARYASYON ÜRETİCİ
# =====================================================================
@app.post("/api/ai/refine-image")
def refine_image(request: RefineRequest):
    print("\n--------------------------------------------------")
    print(f"🌌 [VARYASYON MOTORU] Yeni Konsept: '{request.feedback_prompt}'")
    
    if "," in request.image_base64:
        header, encoded = request.image_base64.split(",", 1)
    else:
        header, encoded = "", request.image_base64
        
    encoded += "=" * ((4 - len(encoded) % 4) % 4)
    
    try:
        translated_feedback = GoogleTranslator(source='tr', target='en').translate(request.feedback_prompt)
        init_image_bytes = base64.b64decode(encoded)
        pil_image = Image.open(io.BytesIO(init_image_bytes)).convert("RGB")
        byte_arr = io.BytesIO()
        pil_image.save(byte_arr, format='JPEG') 
        image_uri = f"data:image/jpeg;base64,{base64.b64encode(byte_arr.getvalue()).decode('utf-8')}"
        
        variation_prompt = f"{translated_feedback}, highly detailed, masterpiece, 8k resolution, cinematic lighting."

        response = requests.post(
            "https://fal.run/fal-ai/flux-general/image-to-image",
            headers={"Authorization": f"Key {FAL_API_KEY}", "Content-Type": "application/json"},
            json={
                "prompt": variation_prompt,
                "image_url": image_uri,
                "strength": 0.80, 
                "guidance_scale": 7.0
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            if "images" in result and len(result["images"]) > 0:
                res_img = requests.get(result["images"][0]["url"])
                refined_base64 = base64.b64encode(res_img.content).decode('utf-8')
                print("🔥 [BAŞARILI] Paralel evren varyasyonu üretildi!")
                return {"status": "success", "image": f"data:image/jpeg;base64,{refined_base64}"}
                
        print(f"⚠️ API Hatası ({response.status_code}): {response.text}")
        return {"status": "error", "message": "Varyasyon motoru başarısız oldu."}
        
    except Exception as e:
        print(f"❌ Varyasyon Hatası: {str(e)}")
        return {"status": "error", "message": f"Sunucu hatası: {type(e).__name__}"}


# =====================================================================
# ÖZELLİK 5: NESNE SİLME (Object Removal)
# =====================================================================
@app.post("/api/ai/remove-object-mask")
def remove_object_mask(request: MaskRemoveRequest):
    print("\n--------------------------------------------------")
    print("🧹 [ÇİZİM SİLİCİ] Fal.ai Özel Nesne Silme Motoru başlatıldı!")
    
    try:
        response = requests.post(
            "https://fal.run/fal-ai/object-removal/mask",
            headers={"Authorization": f"Key {FAL_API_KEY}", "Content-Type": "application/json"},
            json={
                "image_url": request.image_base64,
                "mask_url": request.mask_base64
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            if "images" in result and len(result["images"]) > 0:
                res_img = requests.get(result["images"][0]["url"])
                erased_base64 = base64.b64encode(res_img.content).decode('utf-8')
                print("🔥 [BAŞARILI] Çizilen alan başarıyla silindi ve arka plan dolduruldu!")
                return {"status": "success", "image": f"data:image/jpeg;base64,{erased_base64}"}
                
        print(f"⚠️ API Hatası ({response.status_code}): {response.text}")
        return {"status": "error", "message": "Silme motoru başarısız oldu."}
        
    except Exception as e:
        print(f"❌ Inpainting Hatası: {str(e)}")
        return {"status": "error", "message": f"Sunucu hatası: {type(e).__name__}"}


# =====================================================================
# ÖZELLİK 6: ARKA PLAN SİLİCİ
# =====================================================================
@app.post("/api/ai/remove-background")
def remove_background(request: BGRemoveRequest):
    print("\n--------------------------------------------------")
    print("✂️ [ARKA PLAN SİLİCİ] Fal.ai BiRefNet Motoru başlatıldı!")
    
    try:
        response = requests.post(
            "https://fal.run/fal-ai/birefnet",
            headers={"Authorization": f"Key {FAL_API_KEY}", "Content-Type": "application/json"},
            json={
                "image_url": request.image_base64
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            if "image" in result and "url" in result["image"]:
                res_img = requests.get(result["image"]["url"])
                bg_removed_base64 = base64.b64encode(res_img.content).decode('utf-8')
                print("🔥 [BAŞARILI] Arka plan başarıyla silindi (Şeffaf PNG)!")
                return {"status": "success", "image": f"data:image/png;base64,{bg_removed_base64}"}
                
        print(f"⚠️ API Hatası ({response.status_code}): {response.text}")
        return {"status": "error", "message": "Arka plan silme motoru başarısız oldu."}
        
    except Exception as e:
        print(f"❌ Arka Plan Silme Hatası: {str(e)}")
        return {"status": "error", "message": f"Sunucu hatası: {type(e).__name__}"}


# =====================================================================
# ÖZELLİK 7: PORTRE MODU
# =====================================================================
@app.post("/api/ai/portrait-segment")
def portrait_segment(request: PortraitRequest):
    print("\n--------------------------------------------------")
    print("👤 [PORTRE MODU] Nesne ayrıştırma başlatıldı!")
    try:
        response = requests.post(
            "https://fal.run/fal-ai/birefnet",
            headers={"Authorization": f"Key {FAL_API_KEY}", "Content-Type": "application/json"},
            json={"image_url": request.image_base64}
        )
        if response.status_code == 200:
            result = response.json()
            if "image" in result and "url" in result["image"]:
                res_img = requests.get(result["image"]["url"])
                subject_base64 = base64.b64encode(res_img.content).decode('utf-8')
                print("🔥 [BAŞARILI] Nesne ayrıştırıldı, portre katmanı hazır!")
                return {"status": "success", "image": f"data:image/png;base64,{subject_base64}"}
        return {"status": "error", "message": "Portre motoru başarısız."}
    except Exception as e:
        print(f"❌ Portre Hatası: {str(e)}")
        return {"status": "error", "message": "Sunucu hatası."}


# =====================================================================
# ÖZELLİK 8: AKILLI STİL MOTORU (Prompt'tan Parametrelere)
# =====================================================================
@app.post("/api/ai/smart-filter")
def smart_filter(request: SmartFilterRequest):
    print(f"\n--------------------------------------------------")
    print(f"🧠 [AKILLI STİL] Yapay Zeka Düşünüyor: '{request.prompt}'")
    try:
        system_prompt = f"""
        Sen profesyonel bir fotoğraf renk uzmanısın. Görevin, kullanıcının istediği atmosfere göre fotoğraf ayarlarını belirlemek.
        İstenen Atmosfer: '{request.prompt}'
        
        Sadece ve sadece JSON formatında yanıt ver. Asla açıklama yazma.
        Şablon:
        {{
            "exposure": 10,
            "brightness": -5,
            "contrast": 25,
            "saturation": 40,
            "warmth": -30
        }}
        """
        
        # 🔥 DÜZELTME: any-llm motoruna geçildi ve model belirtildi.
        response = requests.post(
            "https://fal.run/fal-ai/any-llm",
            headers={"Authorization": f"Key {FAL_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": "openai/gpt-4o",
                "prompt": system_prompt, 
                "max_tokens": 150
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            raw_text = result.get("output", "{}").strip()
            
            # String temizleme işlemi (JSON formatını pürüzsüz almak için)
            if raw_text.startswith("```json"): 
                raw_text = raw_text[7:]
            if raw_text.startswith("```"): 
                raw_text = raw_text[3:]
            if raw_text.endswith("```"): 
                raw_text = raw_text[:-3]
            
            parameters = json.loads(raw_text.strip())
            print(f"🎨 [BAŞARILI] Hesaplanan Değerler: {parameters}")
            return {"status": "success", "parameters": parameters}
        else:
            # 🔥 Hata durumunda sorunu direkt terminalde göreceğiz
            print(f"⚠️ Fal.ai Hatası ({response.status_code}): {response.text}")
            return {"status": "error", "message": "Yapay zeka yanıt vermedi."}
            
    except Exception as e:
        print(f"❌ Akıllı Stil Hatası: {str(e)}")
        return {"status": "error", "message": "Sunucu hatası."}