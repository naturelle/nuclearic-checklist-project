import logging
import sys
from datetime import datetime
import os

# Log dizinini oluştur
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# Log formatı
log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Ana logger yapılandırması
def setup_logging():
    """Loglama sistemini yapılandır"""
    
    # Root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(log_format)
    console_handler.setFormatter(console_formatter)
    
    # File handler - genel loglar
    file_handler = logging.FileHandler(
        f"{log_dir}/nuclear_checklist_{datetime.now().strftime('%Y%m%d')}.log",
        encoding='utf-8'
    )
    file_handler.setLevel(logging.INFO)
    file_formatter = logging.Formatter(log_format)
    file_handler.setFormatter(file_formatter)
    
    # Error file handler - sadece hatalar
    error_handler = logging.FileHandler(
        f"{log_dir}/errors_{datetime.now().strftime('%Y%m%d')}.log",
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_formatter = logging.Formatter(log_format)
    error_handler.setFormatter(error_formatter)
    
    # Handler'ları ekle
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    logger.addHandler(error_handler)
    
    return logger

# API işlemleri için özel logger
def get_api_logger():
    """API işlemleri için logger"""
    return logging.getLogger("nuclear_checklist_api")

# Kullanıcı işlemleri için özel logger
def get_user_logger():
    """Kullanıcı işlemleri için logger"""
    return logging.getLogger("nuclear_checklist_user")

# Veritabanı işlemleri için özel logger
def get_db_logger():
    """Veritabanı işlemleri için logger"""
    return logging.getLogger("nuclear_checklist_db")

