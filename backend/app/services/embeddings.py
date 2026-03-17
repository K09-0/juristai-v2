import httpx
import numpy as np
from typing import List
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)

class EmbeddingsService:
    """Сервис для создания embeddings с использованием HuggingFace API"""
    
    def __init__(self):
        settings = get_settings()
        self.hf_token = settings.hf_api_token
        self.model = settings.embeddings_model
        self.embedding_dim = settings.embeddings_dim
        self.api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.model}"
        self.headers = {"Authorization": f"Bearer {self.hf_token}"}
    
    async def create_embedding(self, text: str) -> List[float]:
        """Создать embedding для одного текста"""
        if not self.hf_token:
            logger.error("HuggingFace API token not configured")
            return [0.0] * self.embedding_dim
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json={"inputs": text}
                )
                
                if response.status_code == 503:
                    logger.warning("HuggingFace model is loading, please retry")
                    raise Exception("Model is loading")
                
                response.raise_for_status()
                result = response.json()
                
                # HF возвращает список embeddings для каждого предложения
                if isinstance(result, list) and len(result) > 0:
                    if isinstance(result[0], list):
                        return result[0]
                    return result
                
                raise ValueError(f"Unexpected response format: {result}")
        except Exception as e:
            logger.error(f"Embedding creation failed: {str(e)}")
            raise
    
    async def create_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Создать embeddings для списка текстов"""
        if not texts:
            return []
        
        if not self.hf_token:
            logger.error("HuggingFace API token not configured")
            return [[0.0] * self.embedding_dim for _ in texts]
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json={"inputs": texts}
                )
                response.raise_for_status()
                result = response.json()
                
                # Проверка формата ответа
                if isinstance(result, list) and len(result) == len(texts):
                    return result
                
                raise ValueError(f"Batch embedding failed: expected {len(texts)} embeddings, got {len(result)}")
        except Exception as e:
            logger.error(f"Batch embedding creation failed: {str(e)}")
            raise
    
    def normalize_vector(self, vector: List[float]) -> List[float]:
        """Нормализовать вектор"""
        arr = np.array(vector)
        norm = np.linalg.norm(arr)
        if norm == 0:
            return vector
        return (arr / norm).tolist()
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Вычислить косинусное сходство между двумя векторами"""
        arr1 = np.array(vec1)
        arr2 = np.array(vec2)
        
        dot_product = np.dot(arr1, arr2)
        norm1 = np.linalg.norm(arr1)
        norm2 = np.linalg.norm(arr2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))

_embeddings_service = None

def get_embeddings_service() -> EmbeddingsService:
    global _embeddings_service
    if _embeddings_service is None:
        _embeddings_service = EmbeddingsService()
    return _embeddings_service

async def get_embedding(text: str) -> List[float]:
    """Получить embedding для текста"""
    service = get_embeddings_service()
    return await service.create_embedding(text)
