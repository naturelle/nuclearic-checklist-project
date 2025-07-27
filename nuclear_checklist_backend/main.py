from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

# Veri yönetimi rotalarını import et
from data_management_routes import router as data_management_router

# FastAPI uygulaması
app = FastAPI(
    title="Nuclear Checklist API",
    description="IAEA-TECDOC-1848, SSG-39, IEC 61513 standartları için çeklist yönetim sistemi",
    version="1.0.0"
)

# CORS middleware - tüm originlere izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veritabanı yapılandırması (SQLite kullanarak başlayalım, daha sonra MS SQL'e geçilebilir)
SQLALCHEMY_DATABASE_URL = "sqlite:///./nuclear_checklist.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Veritabanı modeli
class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    
    item_id = Column(Integer, primary_key=True, index=True)
    category = Column(String(255), nullable=False, index=True)
    sub_category = Column(String(255), nullable=False, index=True)
    item_text = Column(Text, nullable=False)
    standards = Column(Text, nullable=True)
    status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Tabloları oluştur
Base.metadata.create_all(bind=engine)

# Pydantic modelleri
class ChecklistItemBase(BaseModel):
    category: str
    sub_category: str
    item_text: str
    standards: Optional[str] = None
    status: bool = False

class ChecklistItemCreate(ChecklistItemBase):
    pass

class ChecklistItemUpdate(BaseModel):
    category: Optional[str] = None
    sub_category: Optional[str] = None
    item_text: Optional[str] = None
    standards: Optional[str] = None
    status: Optional[bool] = None

class ChecklistItemResponse(ChecklistItemBase):
    item_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Veritabanı bağımlılığı
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API uç noktaları
@app.get("/")
async def root():
    return {"message": "Nuclear Checklist API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/checklist-items/", response_model=ChecklistItemResponse)
async def create_checklist_item(item: ChecklistItemCreate, db: Session = Depends(get_db)):
    """Yeni çeklist maddesi oluştur"""
    db_item = ChecklistItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/checklist-items/", response_model=List[ChecklistItemResponse])
async def get_checklist_items(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    sub_category: Optional[str] = None,
    status: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Çeklist maddelerini listele (filtreleme seçenekleri ile)"""
    query = db.query(ChecklistItem)
    
    if category:
        query = query.filter(ChecklistItem.category.contains(category))
    if sub_category:
        query = query.filter(ChecklistItem.sub_category.contains(sub_category))
    if status is not None:
        query = query.filter(ChecklistItem.status == status)
    
    items = query.offset(skip).limit(limit).all()
    return items

@app.get("/checklist-items/{item_id}", response_model=ChecklistItemResponse)
async def get_checklist_item(item_id: int, db: Session = Depends(get_db)):
    """Belirli bir çeklist maddesini getir"""
    item = db.query(ChecklistItem).filter(ChecklistItem.item_id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Çeklist maddesi bulunamadı")
    return item

@app.put("/checklist-items/{item_id}", response_model=ChecklistItemResponse)
async def update_checklist_item(item_id: int, item_update: ChecklistItemUpdate, db: Session = Depends(get_db)):
    """Çeklist maddesini güncelle"""
    db_item = db.query(ChecklistItem).filter(ChecklistItem.item_id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Çeklist maddesi bulunamadı")
    
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/checklist-items/{item_id}")
async def delete_checklist_item(item_id: int, db: Session = Depends(get_db)):
    """Çeklist maddesini sil"""
    db_item = db.query(ChecklistItem).filter(ChecklistItem.item_id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Çeklist maddesi bulunamadı")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Çeklist maddesi başarıyla silindi"}

@app.get("/categories/")
async def get_categories(db: Session = Depends(get_db)):
    """Tüm kategorileri listele"""
    categories = db.query(ChecklistItem.category).distinct().all()
    return [cat[0] for cat in categories]

@app.get("/sub-categories/")
async def get_sub_categories(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Alt kategorileri listele (isteğe bağlı kategori filtresi ile)"""
    query = db.query(ChecklistItem.sub_category)
    if category:
        query = query.filter(ChecklistItem.category == category)
    sub_categories = query.distinct().all()
    return [sub_cat[0] for sub_cat in sub_categories]

@app.get("/statistics/")
async def get_statistics(db: Session = Depends(get_db)):
    """Çeklist istatistiklerini getir"""
    total_items = db.query(ChecklistItem).count()
    completed_items = db.query(ChecklistItem).filter(ChecklistItem.status == True).count()
    pending_items = total_items - completed_items
    
    completion_rate = (completed_items / total_items * 100) if total_items > 0 else 0
    
    return {
        "total_items": total_items,
        "completed_items": completed_items,
        "pending_items": pending_items,
        "completion_rate": round(completion_rate, 2)
    }

# Veri yönetimi rotalarını ekle
app.include_router(data_management_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

