from fastapi import APIRouter
from models.schemas import SubscriptionPlan

router = APIRouter()

@router.get("/plans", response_model=list[SubscriptionPlan])
def get_plans():
    # Burası ileride veritabanından gelecek, şimdilik Mock Data
    return [
        {"id": 1, "name": "Aylık", "price": 99, "features": ["Sınırsız İşlem", "HD Çıktı"], "is_popular": False},
        {"id": 2, "name": "Yıllık", "price": 599, "features": ["Tüm Filtreler", "4K Kayıt", "%40 İndirim"], "is_popular": True}
    ]