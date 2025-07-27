import json
import csv
import io
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Veritabanı yapılandırması
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nuclear_checklist.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ChecklistItem modeli
class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    
    item_id = Column(Integer, primary_key=True, index=True)
    category = Column(String(255), nullable=False, index=True)
    sub_category = Column(String(255), nullable=False)
    item_text = Column(Text, nullable=False)
    standards = Column(String(255))
    status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DataImportExport:
    def __init__(self):
        self.db = SessionLocal()
    
    def export_to_json(self) -> str:
        """Tüm çeklist verilerini JSON formatında dışa aktar"""
        try:
            items = self.db.query(ChecklistItem).all()
            data = []
            
            for item in items:
                data.append({
                    'item_id': item.item_id,
                    'category': item.category,
                    'sub_category': item.sub_category,
                    'item_text': item.item_text,
                    'standards': item.standards,
                    'status': item.status,
                    'created_at': item.created_at.isoformat() if item.created_at else None,
                    'updated_at': item.updated_at.isoformat() if item.updated_at else None
                })
            
            return json.dumps(data, ensure_ascii=False, indent=2)
        
        except Exception as e:
            raise Exception(f"JSON dışa aktarma hatası: {str(e)}")
        finally:
            self.db.close()
    
    def export_to_csv(self) -> str:
        """Tüm çeklist verilerini CSV formatında dışa aktar"""
        try:
            items = self.db.query(ChecklistItem).all()
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Başlık satırı
            writer.writerow([
                'ID', 'Kategori', 'Alt Kategori', 'Madde Metni', 
                'Standartlar', 'Durum', 'Oluşturulma Tarihi', 'Güncelleme Tarihi'
            ])
            
            # Veri satırları
            for item in items:
                writer.writerow([
                    item.item_id,
                    item.category,
                    item.sub_category,
                    item.item_text,
                    item.standards or '',
                    'Tamamlandı' if item.status else 'Bekliyor',
                    item.created_at.strftime('%Y-%m-%d %H:%M:%S') if item.created_at else '',
                    item.updated_at.strftime('%Y-%m-%d %H:%M:%S') if item.updated_at else ''
                ])
            
            return output.getvalue()
        
        except Exception as e:
            raise Exception(f"CSV dışa aktarma hatası: {str(e)}")
        finally:
            self.db.close()
    
    def import_from_json(self, json_data: str, replace_existing: bool = False) -> Dict[str, Any]:
        """JSON formatından veri içe aktar"""
        try:
            data = json.loads(json_data)
            
            if replace_existing:
                # Mevcut verileri temizle
                self.db.query(ChecklistItem).delete()
                self.db.commit()
            
            imported_count = 0
            skipped_count = 0
            errors = []
            
            for item_data in data:
                try:
                    # Gerekli alanları kontrol et
                    if not all(key in item_data for key in ['category', 'sub_category', 'item_text']):
                        errors.append(f"Eksik alan: {item_data}")
                        continue
                    
                    # Mevcut kayıt kontrolü (replace_existing False ise)
                    if not replace_existing:
                        existing = self.db.query(ChecklistItem).filter(
                            ChecklistItem.category == item_data['category'],
                            ChecklistItem.sub_category == item_data['sub_category'],
                            ChecklistItem.item_text == item_data['item_text']
                        ).first()
                        
                        if existing:
                            skipped_count += 1
                            continue
                    
                    # Yeni kayıt oluştur
                    new_item = ChecklistItem(
                        category=item_data['category'],
                        sub_category=item_data['sub_category'],
                        item_text=item_data['item_text'],
                        standards=item_data.get('standards'),
                        status=item_data.get('status', False)
                    )
                    
                    self.db.add(new_item)
                    imported_count += 1
                
                except Exception as e:
                    errors.append(f"Kayıt hatası: {str(e)} - {item_data}")
            
            self.db.commit()
            
            return {
                'success': True,
                'imported_count': imported_count,
                'skipped_count': skipped_count,
                'errors': errors,
                'message': f"{imported_count} kayıt başarıyla içe aktarıldı"
            }
        
        except json.JSONDecodeError as e:
            return {
                'success': False,
                'error': f"JSON format hatası: {str(e)}"
            }
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f"İçe aktarma hatası: {str(e)}"
            }
        finally:
            self.db.close()
    
    def import_from_csv(self, csv_data: str, replace_existing: bool = False) -> Dict[str, Any]:
        """CSV formatından veri içe aktar"""
        try:
            csv_reader = csv.DictReader(io.StringIO(csv_data))
            
            if replace_existing:
                # Mevcut verileri temizle
                self.db.query(ChecklistItem).delete()
                self.db.commit()
            
            imported_count = 0
            skipped_count = 0
            errors = []
            
            for row_num, row in enumerate(csv_reader, start=2):  # 2'den başla (başlık satırı 1)
                try:
                    # Gerekli alanları kontrol et
                    category = row.get('Kategori') or row.get('category')
                    sub_category = row.get('Alt Kategori') or row.get('sub_category')
                    item_text = row.get('Madde Metni') or row.get('item_text')
                    
                    if not all([category, sub_category, item_text]):
                        errors.append(f"Satır {row_num}: Eksik alan")
                        continue
                    
                    # Mevcut kayıt kontrolü
                    if not replace_existing:
                        existing = self.db.query(ChecklistItem).filter(
                            ChecklistItem.category == category,
                            ChecklistItem.sub_category == sub_category,
                            ChecklistItem.item_text == item_text
                        ).first()
                        
                        if existing:
                            skipped_count += 1
                            continue
                    
                    # Durum alanını işle
                    status_text = row.get('Durum') or row.get('status', '')
                    status = status_text.lower() in ['tamamlandı', 'true', '1', 'completed']
                    
                    # Yeni kayıt oluştur
                    new_item = ChecklistItem(
                        category=category,
                        sub_category=sub_category,
                        item_text=item_text,
                        standards=row.get('Standartlar') or row.get('standards'),
                        status=status
                    )
                    
                    self.db.add(new_item)
                    imported_count += 1
                
                except Exception as e:
                    errors.append(f"Satır {row_num}: {str(e)}")
            
            self.db.commit()
            
            return {
                'success': True,
                'imported_count': imported_count,
                'skipped_count': skipped_count,
                'errors': errors,
                'message': f"{imported_count} kayıt başarıyla içe aktarıldı"
            }
        
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f"CSV içe aktarma hatası: {str(e)}"
            }
        finally:
            self.db.close()
    
    def validate_json_structure(self, json_data: str) -> Dict[str, Any]:
        """JSON veri yapısını doğrula"""
        try:
            data = json.loads(json_data)
            
            if not isinstance(data, list):
                return {
                    'valid': False,
                    'error': 'JSON verisi bir liste olmalıdır'
                }
            
            required_fields = ['category', 'sub_category', 'item_text']
            optional_fields = ['standards', 'status']
            
            for i, item in enumerate(data):
                if not isinstance(item, dict):
                    return {
                        'valid': False,
                        'error': f'Öğe {i+1} bir nesne olmalıdır'
                    }
                
                for field in required_fields:
                    if field not in item or not item[field]:
                        return {
                            'valid': False,
                            'error': f'Öğe {i+1}: {field} alanı gereklidir'
                        }
            
            return {
                'valid': True,
                'item_count': len(data),
                'message': f'{len(data)} öğe doğrulandı'
            }
        
        except json.JSONDecodeError as e:
            return {
                'valid': False,
                'error': f'JSON format hatası: {str(e)}'
            }
        except Exception as e:
            return {
                'valid': False,
                'error': f'Doğrulama hatası: {str(e)}'
            }

