// frontend/src/services/aiService.ts

// ⚠️ IP ADRESİN SADECE BURADA DURACAK. 
// İleride değişirse sadece bu tek satırı güncelleyeceksin!
const BACKEND_URL = "https://promptlens-backend-w73g.onrender.com";

// 1. ÖZELLİK: Kamera Stil Dönüştürücü İstediği
export const analyzePrompt = async (prompt: string, imageBase64: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/analyze-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        user_id: "test_user_123",
        image_base64: imageBase64
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP hata kodu: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("analyzePrompt servis hatası:", error);
    return null;
  }
};

// 2. ÖZELLİK: Sıfırdan Hayal Et İstediği
export const generateTextToImage = async (prompt: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/text-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        user_id: "test_user_123",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP hata kodu: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("generateTextToImage servis hatası:", error);
    return null;
  }
};

// 3. ÖZELLİK: 4K Netleştirme İstediği
export const upscaleImage = async (imageBase64: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/upscale`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_base64: imageBase64,
        user_id: "test_user_123",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP hata kodu: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("upscaleImage servis hatası:", error);
    return null;
  }
};

// 4. ÖZELLİK: Varyasyon Üretme (Nesne Değiştirme) İstediği
export const refineImage = async (feedbackText: string, imageBase64: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/refine-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedback_prompt: feedbackText,
        image_base64: imageBase64,
        user_id: "test_user_123",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP hata kodu: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("refineImage servis hatası:", error);
    return null;
  }
};

// 5. ÖZELLİK: Nesne Silme (Object Removal) İstediği
export const removeObject = async (objectName: string, imageBase64: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/remove-object`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object_name: objectName,
        image_base64: imageBase64,
        user_id: "test_user_123",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP hata kodu: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("removeObject servis hatası:", error);
    return null;
  }
};

// Maske ile Nesne Silme
export const removeObjectWithMask = async (imageBase64: string, maskBase64: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/remove-object-mask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image_base64: imageBase64, 
        mask_base64: maskBase64 
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Maske silme hatası:', error);
    return { status: 'error' };
  }
};

// Arka Plan Silme
export const removeBackgroundAPI = async (imageBase64: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/remove-background`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });
    return await response.json();
  } catch (error) {
    console.error('Arka plan silme hatası:', error);
    return { status: 'error' };
  }
};

// Portre Modu
export const segmentPortraitAPI = async (imageBase64: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/portrait-segment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64 }),
    });
    return await response.json();
  } catch (error) {
    console.error('Portre hatası:', error);
    return { status: 'error' };
  }
};

// 🔥 8. ÖZELLİK: AKILLI STİL (Prompt to Parameters) - İŞTE EKSİK OLAN KAHRAMAN!
export const getSmartFilterParameters = async (prompt: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/smart-filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt }),
    });
    return await response.json();
  } catch (error) {
    console.error('Akıllı Filtre hatası:', error);
    return { status: 'error' };
  }
};