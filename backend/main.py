from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import sub_routes, ai_routes

app = FastAPI(title="PromptLens AI - Production API")

# FRONTEND BAĞLANTISI (CORS AYARI)
# React Native uygulamasının API'ye erişebilmesi için şarttır
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route'ları sisteme dahil ediyoruz (Hocanın istediği modüler yapı)
app.include_router(sub_routes.router, prefix="/api/subscriptions", tags=["Abonelik"])
app.include_router(ai_routes.router, prefix="/api/ai", tags=["Yapay Zeka"])

@app.get("/")
def root():
    return {"message": "PromptLens Backend is modular and running!"}