import httpx
import json
from typing import List, Dict, Optional
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)

class LLMService:
    """Сервис для работы с бесплатными LLM моделями (Ollama, HuggingFace, Together AI)"""
    
    def __init__(self):
        settings = get_settings()
        self.use_ollama = settings.use_ollama
        self.ollama_url = settings.ollama_url
        self.ollama_model = settings.ollama_model
        
        self.hf_token = settings.hf_api_token
        self.hf_model = settings.hf_model
        
        self.together_key = settings.together_api_key
        self.together_model = settings.together_model
    
    async def generate_rag_response(
        self,
        query: str,
        contexts: List[Dict],
        temperature: float = 0.1,
        max_tokens: int = 500
    ) -> Dict:
        """Генерация ответа на основе контекста (RAG)"""
        
        # Форматирование контекста
        context_text = self._format_contexts(contexts)
        
        system_prompt = """Вы — юридический ассистент JuristAI, специализирующийся на законодательстве Республики Казахстан.

СТРОГИЕ ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе предоставленного контекста из НПА РК.
2. Если ответа нет в контексте — честно скажи: "Законодательство РК не содержит прямого ответа на данный вопрос в предоставленных документах."
3. НЕ придумывай статьи, сроки, суммы, которые не указаны в контексте.
4. Цитируй конкретные статьи и пункты если они есть в контексте.
5. Указывай название документа (ГК РК, ТК РК и т.д.) при каждой цитате.
6. Температура 0.1 — ты детерминирован, не креативен."""

        prompt = f"""{system_prompt}

КОНТЕКСТ ИЗ НПА РК:
{context_text}

ВОПРОС ПОЛЬЗОВАТЕЛЯ: {query}

ОТВЕТ:"""
        
        try:
            if self.use_ollama:
                response = await self._query_ollama(prompt, temperature, max_tokens)
                model_used = self.ollama_model
            elif self.hf_token:
                response = await self._query_huggingface(prompt, temperature, max_tokens)
                model_used = self.hf_model
            elif self.together_key:
                response = await self._query_together(prompt, temperature, max_tokens)
                model_used = self.together_model
            else:
                return {
                    "error": "No LLM configured. Please set OLLAMA_URL, HF_API_TOKEN, or TOGETHER_API_KEY",
                    "model": "none"
                }
            
            return {
                "answer": response,
                "model": model_used,
                "source": "ollama" if self.use_ollama else ("huggingface" if self.hf_token else "together"),
                "context_used": len(contexts)
            }
        except Exception as e:
            logger.error(f"LLM generation failed: {str(e)}")
            return {
                "error": f"Failed to generate response: {str(e)}",
                "model": "error"
            }
    
    async def _query_ollama(self, prompt: str, temperature: float, max_tokens: int) -> str:
        """Запрос к локальной Ollama"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": self.ollama_model,
                        "prompt": prompt,
                        "temperature": temperature,
                        "num_predict": max_tokens,
                        "stream": False
                    }
                )
                response.raise_for_status()
                return response.json().get("response", "").strip()
        except Exception as e:
            logger.error(f"Ollama query failed: {str(e)}")
            raise
    
    async def _query_huggingface(self, prompt: str, temperature: float, max_tokens: int) -> str:
        """Запрос к HuggingFace Inference API"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"https://api-inference.huggingface.co/models/{self.hf_model}",
                    headers={"Authorization": f"Bearer {self.hf_token}"},
                    json={
                        "inputs": prompt,
                        "parameters": {
                            "temperature": temperature,
                            "max_length": max_tokens,
                            "do_sample": True
                        }
                    }
                )
                response.raise_for_status()
                result = response.json()
                
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "").strip()
                return ""
        except Exception as e:
            logger.error(f"HuggingFace query failed: {str(e)}")
            raise
    
    async def _query_together(self, prompt: str, temperature: float, max_tokens: int) -> str:
        """Запрос к Together AI API"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.together.xyz/inference",
                    headers={"Authorization": f"Bearer {self.together_key}"},
                    json={
                        "model": self.together_model,
                        "prompt": prompt,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                        "top_p": 0.9,
                        "top_k": 40
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result.get("output", {}).get("choices", [{}])[0].get("text", "").strip()
        except Exception as e:
            logger.error(f"Together AI query failed: {str(e)}")
            raise
    
    def _format_contexts(self, contexts: List[Dict]) -> str:
        """Форматирование контекстов для промпта"""
        formatted = []
        for i, ctx in enumerate(contexts, 1):
            doc_name = ctx.get("document", "Unknown Document")
            text = ctx.get("text", "")
            formatted.append(f"[Документ {i}: {doc_name}]\n{text}")
        return "\n\n".join(formatted)
    
    async def generate_document(
        self,
        doc_type: str,
        situation: str,
        tone: str = "formal",
        max_tokens: int = 1000
    ) -> Dict:
        """Генерация юридического документа"""
        
        tone_descriptions = {
            "formal": "формальный, официальный стиль",
            "neutral": "нейтральный, объективный стиль",
            "aggressive": "агрессивный, требовательный стиль",
            "protective": "защитный, осторожный стиль"
        }
        
        prompt = f"""Ты — опытный юрист. Создай {doc_type} на основе следующей ситуации.
Стиль: {tone_descriptions.get(tone, "формальный")}.
Язык: Русский.
Юрисдикция: Республика Казахстан.

СИТУАЦИЯ:
{situation}

ДОКУМЕНТ ({doc_type}):"""
        
        try:
            if self.use_ollama:
                response = await self._query_ollama(prompt, 0.3, max_tokens)
            elif self.hf_token:
                response = await self._query_huggingface(prompt, 0.3, max_tokens)
            else:
                return {"error": "No LLM configured"}
            
            return {
                "document": response,
                "type": doc_type,
                "tone": tone
            }
        except Exception as e:
            logger.error(f"Document generation failed: {str(e)}")
            return {"error": str(e)}

_llm_service = None

def get_llm_service() -> LLMService:
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
