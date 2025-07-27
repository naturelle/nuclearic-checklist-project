import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import ChecklistItem, Base
from datetime import datetime
from pathlib import Path  # Bu satırı ekledim

# Veritabanı bağlantısı
SQLALCHEMY_DATABASE_URL = "sqlite:///./nuclear_checklist.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def parse_checklist_file(file_path):
    """Çeklist dosyasını parse eder ve veri yapısını döndürür"""
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    items = []
    current_category = ""
    current_sub_category = ""
    
    lines = content.split('\n')
    
    for line in lines:
        line = line.strip()
        
        # Ana kategori (## ile başlayan)
        if line.startswith('## ') and not line.startswith('### '):
            current_category = line[3:].strip()
            continue
        
        # Alt kategori (### ile başlayan)
        if line.startswith('### '):
            current_sub_category = line[4:].strip()
            continue
        
        # Çeklist maddesi (- [ ] ile başlayan)
        if line.startswith('- [ ] '):
            item_text = line[6:].strip()
            
            # Standartları çıkar (parantez içindeki kısım)
            standards_match = re.search(r'\(([^)]+)\)$', item_text)
            standards = ""
            if standards_match:
                standards = standards_match.group(1)
                item_text = item_text[:standards_match.start()].strip()
            
            # **Bold** kısmını temizle
            item_text = re.sub(r'\*\*(.*?)\*\*:', r'\1:', item_text)
            
            items.append({
                'category': current_category,
                'sub_category': current_sub_category,
                'item_text': item_text,
                'standards': standards,
                'status': False
            })
    
    return items

def load_sample_data():
    """Örnek veriyi veritabanına yükler"""
    db = SessionLocal()
    
    try:
        # Mevcut verileri temizle
        db.query(ChecklistItem).delete()
        db.commit()
        
        # Örnek dosyayı parse et
        # Buradaki yolu kendi bilgisayarınızdaki dosya yoluna göre düzenledim.
        # En güvenilir yol olan 'Pathlib' ve 'raw string' yöntemini kullandım.
        file_path = Path('C:\\Users\\Ebru\\Documents\\dataanalyst\\NuclearICChecklist\\nuclear_checklist_backend\\pasted_content.txt')
        items = parse_checklist_file(file_path)
        print(file_path)
        # Verileri veritabanına ekle
        for item_data in items:
            if item_data['category'] and item_data['sub_category'] and item_data['item_text']:
                db_item = ChecklistItem(**item_data)
                db.add(db_item)
        
        db.commit()
        print(f"{len(items)} çeklist maddesi başarıyla yüklendi.")
        
        # İstatistikleri göster
        total_items = db.query(ChecklistItem).count()
        categories = db.query(ChecklistItem.category).distinct().count()
        sub_categories = db.query(ChecklistItem.sub_category).distinct().count()
        
        print(f"Toplam madde: {total_items}")
        print(f"Toplam kategori: {categories}")
        print(f"Toplam alt kategori: {sub_categories}")
        
    except Exception as e:
        print(f"Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    load_sample_data()