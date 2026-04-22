from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(
    title="PromptLens AI - API Service",
    description="Backend infrastructure for real-time style transfer",
    version="1.0.0"
)

# Profesyonel Sistem Durumu Endpoint'i
@app.get("/status")
def get_status():
    return {
        "status": "online",
        "service": "PromptLens AI Backend",
        "infrastructure": "FastAPI",
        "environment": "Development"
    }

# Teknik Selamlama Endpoint'i
@app.get("/hello")
def say_hello():
    return {
        "message": "PromptLens AI Backend service is successfully initialized.",
        "integration_ready": True
    }

# Ana Giriş Sayfası (Profesyonel Görünüm)
@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <html>
        <head>
            <title>PromptLens AI | API Gateway</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    background-color: #f4f7f6; 
                    color: #333; 
                    text-align: center; 
                    padding: 100px; 
                }
                .container { 
                    background: white; 
                    padding: 40px; 
                    border-radius: 12px; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
                    display: inline-block; 
                    max-width: 500px;
                }
                h1 { color: #2c3e50; margin-bottom: 10px; }
                hr { border: 0; height: 1px; background: #eee; margin: 20px 0; }
                a { color: #3498db; text-decoration: none; font-weight: bold; }
                a:hover { text-decoration: underline; }
                .status-badge { 
                    background: #2ecc71; 
                    color: white; 
                    padding: 5px 12px; 
                    border-radius: 20px; 
                    font-size: 0.8em; 
                    vertical-align: middle;
                }
                .info-text { color: #7f8c8d; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 PromptLens AI</h1>
                <p>Backend Altyapısı Yayında <span class="status-badge">ONLINE</span></p>
                <hr>
                <p class="info-text">Sistem mimarisi (Backend & Frontend) ayrıştırılmış dizinlerde başarıyla kurulmuştur.</p>
                <p>API Dokümantasyonu: <a href="/docs">Swagger UI</a></p>
                <p>Sistem Durumu: <a href="/status">Check Status</a></p>
            </div>
        </body>
    </html>
    """