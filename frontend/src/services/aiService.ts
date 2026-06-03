// frontend/src/services/aiService.ts
const BACKEND_URL = "http://192.168.1.23:8000";

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
        image_base64: imageBase64 // Fotoğrafı backend'e gönderiyoruz
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP hata kodu: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("analyzePrompt servis hatası:", error);
    return null;
  }
};