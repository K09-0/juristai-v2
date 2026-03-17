from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import get_settings

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения."""
    logger.info("JuristAI v2 API starting...")
    yield
    logger.info("JuristAI v2 API shutting down...")

# Создание приложения
app = FastAPI(
    title="JuristAI v2 API",
    description="Юридический AI-ассистент для Казахстана (бесплатные модели)",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Роутеры (будут добавлены позже)
# from app.routers import rag, documents, auth

@app.get("/")
async def root():
    """Корневой endpoint."""
    return {
        "name": "JuristAI v2 API",
        "version": "2.0.0",
        "status": "operational",
        "description": "Юридический AI-ассистент для Казахстана",
        "endpoints": {
            "health": "/health",
            "info": "/info"
        }
    }

@app.get("/health")
async def health_check():
    """Проверка здоровья сервиса."""
    return {
        "status": "healthy",
        "version": "2.0.0"
    }

@app.get("/info")
async def app_info():
    """Информация о конфигурации приложения."""
    settings = get_settings()
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "llm_config": {
            "use_ollama": settings.use_ollama,
            "ollama_model": settings.ollama_model if settings.use_ollama else None,
            "hf_model": settings.hf_model if settings.hf_api_token else None,
            "together_model": settings.together_model if settings.together_api_key else None
        },
        "embeddings_model": settings.embeddings_model
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
