import sqlite3
import os

# Klasör yolunu ve dosya yolunu belirleyelim
DATA_DIR = "data"
DB_PATH = os.path.join(DATA_DIR, "promptlens.db")

def init_db():
    # Eğer data klasörü yoksa oluştur
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        print(f"'{DATA_DIR}' klasörü oluşturuldu.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Kullanıcı kotaları tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_quota (
            user_id TEXT PRIMARY KEY,
            remaining_prompts INTEGER DEFAULT 3
        )
    ''')
    
    # Test verisi ekle
    cursor.execute("INSERT OR IGNORE INTO user_quota (user_id, remaining_prompts) VALUES ('test_user_1', 3)")
    
    conn.commit()
    conn.close()
    print("Veritabanı ve 'promptlens.db' dosyası başarıyla hazırlandı!")

if __name__ == "__main__":
    init_db()