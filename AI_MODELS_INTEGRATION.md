# JuristAI v2 - Интеграция бесплатных AI моделей

## Обзор

Этот документ описывает интеграцию бесплатных AI моделей для замены платных сервисов (Groq, Google Gemini).

## Текущие платные сервисы (исходный проект)

| Сервис | Модель | Назначение | Стоимость |
|--------|--------|-----------|----------|
| Groq | llama-3.1-70b | RAG-ответы, генерация документов | Бесплатный API (лимиты) |
| Google Gemini | gemini-1.5-flash | OCR, анализ изображений | Платный |
| HuggingFace | all-MiniLM-L6-v2 | Embeddings для RAG | Бесплатный API (лимиты) |

## Рекомендуемые бесплатные альтернативы

### 1. Ollama (Локальные модели)

**Преимущества:**
- Полностью локальное выполнение (без отправки данных)
- Бесплатно, без лимитов
- Поддерживает множество моделей (Llama 2, Mistral, Neural Chat и т.д.)

**Установка:**
```bash
# macOS
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Скачать с https://ollama.ai
```

**Использование:**
```bash
# Скачать и запустить модель
ollama pull llama2
ollama serve

# API доступен на http://localhost:11434
```

**Интеграция в Python:**
```python
import requests

def query_ollama(prompt: str, model: str = "llama2") -> str:
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": False}
    )
    return response.json()["response"]
```

### 2. Hugging Face Inference API (Бесплатный уровень)

**Преимущества:**
- Бесплатный API с разумными лимитами
- Доступ к тысячам моделей
- Поддержка embeddings, генерации текста, классификации

**Использование:**
```python
from huggingface_hub import InferenceClient

client = InferenceClient(api_key="hf_YOUR_TOKEN")

# Генерация текста
output = client.text_generation(
    "Какие сроки исковой давности по договору подряда?",
    model="mistralai/Mistral-7B-Instruct-v0.1"
)

# Embeddings
embeddings = client.feature_extraction(
    "Текст для embeddings",
    model="sentence-transformers/all-MiniLM-L6-v2"
)
```

### 3. LM Studio (Локальные модели с UI)

**Преимущества:**
- Графический интерфейс для управления моделями
- Встроенный OpenAI-совместимый API
- Поддержка GPU ускорения

**Установка:**
- Скачать с https://lmstudio.ai
- Выбрать модель (например, Mistral 7B)
- Запустить локальный сервер

### 4. Replicate (Бесплатный API)

**Преимущества:**
- Бесплатный API с лимитами
- Поддержка множества моделей (Llama, Mistral, CodeLlama и т.д.)
- Простая интеграция

**Использование:**
```python
import replicate

output = replicate.run(
    "meta/llama-2-7b-chat:13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0",
    input={
        "prompt": "Какие сроки исковой давности по договору подряда?",
        "temperature": 0.1,
        "top_p": 0.9,
        "max_length": 500
    }
)
```

### 5. Together AI (Бесплатный API)

**Преимущества:**
- Бесплатный API с хорошими лимитами
- Поддержка множества моделей
- Быстрая генерация

**Использование:**
```python
import together

together.api_key = "YOUR_API_KEY"

output = together.Complete.create(
    prompt="Какие сроки исковой давности по договору подряда?",
    model="togethercomputer/llama-2-7b-chat",
    max_tokens=500,
    temperature=0.1
)
```

## Рекомендуемая архитектура для JuristAI v2

### Вариант 1: Гибридный подход (Рекомендуется)

```
┌─────────────────────────────────────┐
│         JuristAI Frontend            │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      JuristAI Backend (FastAPI)     │
├─────────────────────────────────────┤
│  RAG Service (Embeddings + Search)  │
│  ├─ HuggingFace Inference API       │
│  └─ Vector Store (Supabase pgvector)│
│                                     │
│  Generation Service                 │
│  ├─ Ollama (локально)              │
│  └─ Fallback: HF Inference API      │
│                                     │
│  OCR Service                        │
│  └─ PaddleOCR (локально, бесплатно)│
└─────────────────────────────────────┘
```

### Вариант 2: Полностью облачный (если нет сервера)

```
┌─────────────────────────────────────┐
│         JuristAI Frontend            │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│      JuristAI Backend (FastAPI)     │
├─────────────────────────────────────┤
│  HuggingFace Inference API          │
│  ├─ Text Generation                 │
│  ├─ Embeddings                      │
│  └─ Image-to-Text (Vision)          │
│                                     │
│  Together AI (Fallback)             │
│  └─ Text Generation                 │
│                                     │
│  Replicate (для специальных задач)  │
│  └─ Специализированные модели       │
└─────────────────────────────────────┘
```

## Реализация для JuristAI v2

### Шаг 1: Обновить requirements.txt

```txt
# Удалить:
# groq==0.4.0
# google-generativeai==0.3.2

# Добавить:
huggingface-hub>=0.20.0
sentence-transformers>=2.2.2
ollama>=0.1.0  # опционально для локального запуска
paddleocr>=2.7.0.0  # для OCR без платных API
```

### Шаг 2: Создать новый сервис для LLM

```python
# backend/app/services/llm_service.py

from typing import List, Dict, Optional
import httpx
from app.config import get_settings

class LLMService:
    """Сервис для работы с бесплатными LLM моделями"""
    
    def __init__(self):
        settings = get_settings()
        self.hf_token = settings.hf_api_token
        self.use_ollama = settings.use_ollama  # Новая переменная в config
        self.ollama_url = "http://localhost:11434"
    
    async def generate_rag_response(
        self,
        query: str,
        contexts: List[Dict],
        temperature: float = 0.1
    ) -> str:
        """Генерация ответа на основе контекста (RAG)"""
        
        # Форматирование контекста
        context_text = "\n\n".join([
            f"Документ: {ctx.get('document', 'Unknown')}\n"
            f"Текст: {ctx.get('text', '')}"
            for ctx in contexts
        ])
        
        prompt = f"""Вы — юридический ассистент JuristAI, специализирующийся на законодательстве РК.

КОНТЕКСТ:
{context_text}

ВОПРОС: {query}

ОТВЕТ:"""
        
        if self.use_ollama:
            return await self._query_ollama(prompt, temperature)
        else:
            return await self._query_huggingface(prompt, temperature)
    
    async def _query_ollama(self, prompt: str, temperature: float) -> str:
        """Запрос к локальной Ollama"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": "mistral",  # или llama2
                    "prompt": prompt,
                    "temperature": temperature,
                    "stream": False
                },
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()["response"]
    
    async def _query_huggingface(self, prompt: str, temperature: float) -> str:
        """Запрос к HuggingFace Inference API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
                headers={"Authorization": f"Bearer {self.hf_token}"},
                json={
                    "inputs": prompt,
                    "parameters": {
                        "temperature": temperature,
                        "max_length": 500
                    }
                },
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            return result[0]["generated_text"] if result else ""
```

### Шаг 3: Обновить config.py

```python
class Settings(BaseSettings):
    # ... существующие переменные ...
    
    # LLM Configuration
    use_ollama: bool = False  # True если Ollama запущена локально
    ollama_url: str = "http://localhost:11434"
    hf_api_token: str = ""  # HuggingFace API token
    
    # Выбор модели
    llm_model: str = "mistral"  # для Ollama
    hf_model: str = "mistralai/Mistral-7B-Instruct-v0.1"  # для HF
```

### Шаг 4: Обновить RAG роутер

```python
# backend/app/routers/rag.py

from fastapi import APIRouter, HTTPException
from app.services.llm_service import LLMService
from app.services.embeddings import get_embeddings_service

router = APIRouter(prefix="/rag", tags=["rag"])
llm_service = LLMService()

@router.post("/query")
async def query_legal_database(query: str):
    """Запрос к юридической базе с RAG"""
    try:
        # 1. Получить embeddings запроса
        embeddings_service = get_embeddings_service()
        query_embedding = await embeddings_service.create_embedding(query)
        
        # 2. Поиск похожих документов в Supabase
        # ... (существующий код поиска) ...
        
        # 3. Генерация ответа с LLM
        response = await llm_service.generate_rag_response(
            query=query,
            contexts=similar_docs,
            temperature=0.1
        )
        
        return {
            "query": query,
            "answer": response,
            "sources": [doc["document"] for doc in similar_docs],
            "model": "mistral-7b" if llm_service.use_ollama else "mistral-7b-hf"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Переменные окружения (.env)

```env
# Выбор LLM
USE_OLLAMA=false
OLLAMA_URL=http://localhost:11434

# HuggingFace
HF_API_TOKEN=hf_YOUR_TOKEN_HERE

# Модели
LLM_MODEL=mistral
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.1

# Embeddings (остаётся как было)
HF_API_TOKEN=hf_YOUR_TOKEN_HERE
```

## Развёртывание

### Вариант 1: Локально с Ollama

```bash
# 1. Установить Ollama
brew install ollama

# 2. Скачать модель
ollama pull mistral

# 3. Запустить сервер
ollama serve

# 4. В другом терминале запустить FastAPI
cd backend
python -m uvicorn app.main:app --reload
```

### Вариант 2: На сервере с HuggingFace API

```bash
# 1. Получить HF token с https://huggingface.co/settings/tokens
# 2. Установить переменные окружения
export HF_API_TOKEN=hf_YOUR_TOKEN

# 3. Запустить FastAPI
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Тестирование

```bash
# Тест RAG запроса
curl -X POST http://localhost:8000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Какие сроки исковой давности по договору подряда?"}'

# Результат:
# {
#   "query": "Какие сроки исковой давности по договору подряда?",
#   "answer": "По ГК РК статья 395 устанавливает...",
#   "sources": ["ГК РК", "ТК РК"],
#   "model": "mistral-7b"
# }
```

## Лимиты и ограничения

| Сервис | Лимит | Примечание |
|--------|-------|-----------|
| Ollama | Без лимитов | Требует локальный сервер |
| HF Inference API | ~30 запросов/минуту | Бесплатный уровень |
| Together AI | 1M токенов/месяц | Бесплатный уровень |
| Replicate | 100 запросов/месяц | Бесплатный уровень |

## Заключение

Для JuristAI v2 рекомендуется использовать **гибридный подход**:
- **Разработка**: Ollama локально (быстро, без интернета)
- **Production**: HuggingFace Inference API (масштабируемо, надёжно)
- **Fallback**: Together AI (если HF недоступен)

Все решения полностью бесплатны и не требуют платных подписок.
