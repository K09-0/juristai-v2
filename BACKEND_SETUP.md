# JuristAI v2 - Настройка бэкенда

## Требования

- Python 3.8+
- pip или uv

## Установка

### 1. Установить зависимости

```bash
cd backend
pip install -r requirements.txt
```

### 2. Выбрать LLM (один из вариантов)

#### Вариант A: Ollama (локально, рекомендуется для разработки)

```bash
# Установить Ollama
# macOS: brew install ollama
# Linux: curl https://ollama.ai/install.sh | sh
# Windows: https://ollama.ai

# Скачать модель
ollama pull mistral

# Запустить сервер (в отдельном терминале)
ollama serve

# Установить переменную окружения
export USE_OLLAMA=true
export OLLAMA_URL=http://localhost:11434
export OLLAMA_MODEL=mistral
```

#### Вариант B: HuggingFace API (облако)

```bash
# Получить API token с https://huggingface.co/settings/tokens
export HF_API_TOKEN=hf_YOUR_TOKEN_HERE
export HF_MODEL=mistralai/Mistral-7B-Instruct-v0.1
```

#### Вариант C: Together AI (облако, fallback)

```bash
# Получить API key с https://www.together.ai
export TOGETHER_API_KEY=YOUR_KEY_HERE
export TOGETHER_MODEL=togethercomputer/llama-2-7b-chat
```

### 3. Запустить сервер

```bash
# Development
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Проверка

```bash
# Проверить здоровье
curl http://localhost:8000/health

# Получить информацию о конфигурации
curl http://localhost:8000/info

# Результат:
# {
#   "status": "healthy",
#   "version": "2.0.0"
# }
```

## Переменные окружения

| Переменная | Описание | Значение по умолчанию |
|-----------|---------|----------------------|
| USE_OLLAMA | Использовать Ollama | false |
| OLLAMA_URL | URL Ollama сервера | http://localhost:11434 |
| OLLAMA_MODEL | Модель Ollama | mistral |
| HF_API_TOKEN | HuggingFace API token | "" |
| HF_MODEL | HuggingFace модель | mistralai/Mistral-7B-Instruct-v0.1 |
| TOGETHER_API_KEY | Together AI API key | "" |
| TOGETHER_MODEL | Together AI модель | togethercomputer/llama-2-7b-chat |
| EMBEDDINGS_MODEL | Модель для embeddings | sentence-transformers/all-MiniLM-L6-v2 |
| DEBUG | Debug режим | false |

## Структура проекта

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI приложение
│   ├── config.py               # Конфигурация
│   ├── services/
│   │   ├── llm_service.py      # LLM (Ollama, HF, Together)
│   │   └── embeddings.py       # Embeddings сервис
│   └── routers/                # API роутеры (будут добавлены)
├── requirements.txt            # Зависимости
└── .env.example               # Пример переменных окружения
```

## Примеры использования

### Запрос к LLM

```python
from app.services.llm_service import get_llm_service

llm = get_llm_service()

# Генерация ответа с RAG
response = await llm.generate_rag_response(
    query="Какие сроки исковой давности по договору подряда?",
    contexts=[
        {
            "document": "ГК РК",
            "text": "Статья 395. Сроки исковой давности..."
        }
    ]
)

print(response["answer"])
```

### Создание embeddings

```python
from app.services.embeddings import get_embeddings_service

embeddings = get_embeddings_service()

# Создать embedding
vec = await embeddings.create_embedding("Текст для embedding")

# Создать batch embeddings
vecs = await embeddings.create_embeddings_batch([
    "Текст 1",
    "Текст 2",
    "Текст 3"
])
```

## Решение проблем

### Ollama не подключается

```bash
# Проверить, запущена ли Ollama
curl http://localhost:11434

# Если не запущена:
ollama serve

# Проверить доступные модели
ollama list
```

### HuggingFace API ошибка 503

Модель загружается. Подождите 1-2 минуты и повторите запрос.

```bash
# Проверить статус модели
curl -H "Authorization: Bearer $HF_API_TOKEN" \
  https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1
```

### Недостаточно памяти

Если используете Ollama локально, выберите меньшую модель:

```bash
ollama pull neural-chat  # 4.7GB
ollama pull orca-mini    # 1.7GB
```

## Развёртывание

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t juristai-backend .
docker run -p 8000:8000 \
  -e HF_API_TOKEN=your_token \
  juristai-backend
```

### Railway / Render

1. Создать новый проект
2. Подключить GitHub репозиторий
3. Установить переменные окружения (HF_API_TOKEN и т.д.)
4. Развернуть

## Лимиты и ограничения

| Сервис | Лимит | Примечание |
|--------|-------|-----------|
| Ollama | Без лимитов | Требует локальный сервер |
| HF Inference API | ~30 запросов/минуту | Бесплатный уровень |
| Together AI | 1M токенов/месяц | Бесплатный уровень |

## Дополнительные ресурсы

- [Ollama документация](https://github.com/ollama/ollama)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference)
- [Together AI документация](https://www.together.ai/docs)
