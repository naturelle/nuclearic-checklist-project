from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io
from import_export import DataImportExport

router = APIRouter(prefix="/data-management", tags=["data-management"])

class ImportRequest(BaseModel):
    data: str
    replace_existing: bool = False

class ValidationRequest(BaseModel):
    data: str

@router.get("/export/json")
async def export_json():
    """Tüm çeklist verilerini JSON formatında dışa aktar"""
    try:
        exporter = DataImportExport()
        json_data = exporter.export_to_json()
        
        # JSON dosyası olarak indir
        return StreamingResponse(
            io.BytesIO(json_data.encode('utf-8')),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=checklist_data.json"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/csv")
async def export_csv():
    """Tüm çeklist verilerini CSV formatında dışa aktar"""
    try:
        exporter = DataImportExport()
        csv_data = exporter.export_to_csv()
        
        # CSV dosyası olarak indir
        return StreamingResponse(
            io.BytesIO(csv_data.encode('utf-8-sig')),  # BOM ekle (Excel uyumluluğu için)
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=checklist_data.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import/json")
async def import_json(request: ImportRequest):
    """JSON formatından veri içe aktar"""
    try:
        importer = DataImportExport()
        result = importer.import_from_json(request.data, request.replace_existing)
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import/csv")
async def import_csv(request: ImportRequest):
    """CSV formatından veri içe aktar"""
    try:
        importer = DataImportExport()
        result = importer.import_from_csv(request.data, request.replace_existing)
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import/file/json")
async def import_json_file(
    file: UploadFile = File(...),
    replace_existing: bool = Form(False)
):
    """JSON dosyasından veri içe aktar"""
    try:
        if not file.filename.endswith('.json'):
            raise HTTPException(status_code=400, detail="Sadece JSON dosyaları kabul edilir")
        
        content = await file.read()
        json_data = content.decode('utf-8')
        
        importer = DataImportExport()
        result = importer.import_from_json(json_data, replace_existing)
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import/file/csv")
async def import_csv_file(
    file: UploadFile = File(...),
    replace_existing: bool = Form(False)
):
    """CSV dosyasından veri içe aktar"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Sadece CSV dosyaları kabul edilir")
        
        content = await file.read()
        csv_data = content.decode('utf-8')
        
        importer = DataImportExport()
        result = importer.import_from_csv(csv_data, replace_existing)
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate/json")
async def validate_json(request: ValidationRequest):
    """JSON veri yapısını doğrula"""
    try:
        validator = DataImportExport()
        result = validator.validate_json_structure(request.data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/template/json")
async def get_json_template():
    """JSON içe aktarma için şablon dosyası"""
    template = [
        {
            "category": "ÖRNEK KATEGORİ",
            "sub_category": "Örnek Alt Kategori",
            "item_text": "Örnek çeklist maddesi açıklaması",
            "standards": "IEC 61513, SSG-39",
            "status": False
        }
    ]
    
    import json
    json_data = json.dumps(template, ensure_ascii=False, indent=2)
    
    return StreamingResponse(
        io.BytesIO(json_data.encode('utf-8')),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=checklist_template.json"}
    )

@router.get("/template/csv")
async def get_csv_template():
    """CSV içe aktarma için şablon dosyası"""
    template_data = """Kategori,Alt Kategori,Madde Metni,Standartlar,Durum
ÖRNEK KATEGORİ,Örnek Alt Kategori,Örnek çeklist maddesi açıklaması,"IEC 61513, SSG-39",Bekliyor
"""
    
    return StreamingResponse(
        io.BytesIO(template_data.encode('utf-8-sig')),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=checklist_template.csv"}
    )

