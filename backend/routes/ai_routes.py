from fastapi import APIRouter
from models.schemas import AIRequest, AIResponse

router = APIRouter()

@router.post("/analyze-prompt", response_model=AIResponse)
def analyze_prompt(request: AIRequest):
    # Semantic Mapping Mantığı (Hangi kelimeye hangi model?)
    prompt = request.prompt.lower()
    
    if "anime" in prompt or "çizgi" in prompt:
        model = "anime_v2.tflite"
    elif "neon" in prompt or "cyberpunk" in prompt:
        model = "cyber_city.tflite"
    else:
        model = "default_art.tflite"
        
    return {"selected_model": model, "confidence": 0.95}