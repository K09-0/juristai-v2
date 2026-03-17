"""Services для JuristAI v2"""

from .llm_service import get_llm_service, LLMService
from .embeddings import get_embeddings_service, EmbeddingsService

__all__ = [
    "get_llm_service",
    "LLMService",
    "get_embeddings_service",
    "EmbeddingsService"
]
