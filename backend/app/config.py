from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List

class Settings(BaseSettings):
    # Приложение
    app_name: str = "JuristAI v2"
    app_version: str = "2.0.0"
    debug: bool = False
    
    # Supabase (опционально)
    supabase_url: str = ""
    supabase_key: str = ""
    
    # LLM Configuration - Бесплатные модели
    use_ollama: bool = False  # True если Ollama запущена локально
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "mistral"
    
    # HuggingFace API
    hf_api_token: str = ""
    hf_model: str = "mistralai/Mistral-7B-Instruct-v0.1"
    
    # Together AI (Fallback)
    together_api_key: str = ""
    together_model: str = "togethercomputer/llama-2-7b-chat"
    
    # Embeddings (HuggingFace)
    embeddings_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embeddings_dim: int = 384
    
    # Security
    secret_key: str = "change-me-in-production-min-32-chars!!!"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: List[str] = ["*"]
    
    # Rate limiting
    rate_limit_queries_per_day: int = 10  # Free tier
    rate_limit_premium_per_day: int = 1000  # Premium tier
    
    # Admin credentials
    admin_username: str = "admin"
    admin_password: str = "change-me-in-production"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Получить настройки (кэшируется)."""
    return Settings()
