from pydantic import BaseModel
from typing import List, Optional

# Abonelik Planı Şeması
class SubscriptionPlan(BaseModel):
    id: int
    name: str
    price: int
    features: List[str]
    is_popular: bool = False

# Kullanıcı Kotası Şeması
class UserQuota(BaseModel):
    user_id: str
    remaining_prompts: int
    total_limit: int

# AI İstek Şeması (Frontend'den gelen prompt)
class AIRequest(BaseModel):
    prompt: str
    user_id: str

# AI Yanıt Şeması (Hangi modelin yükleneceği)
class AIResponse(BaseModel):
    selected_model: str
    confidence: float