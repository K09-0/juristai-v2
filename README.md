# JuristAI v2 - Юридический AI ассистент для Казахстана

Современный минималистичный AI-ассистент для юридической работы в Казахстане с использованием полностью **бесплатных** AI моделей.

## 🎯 Особенности

### Фронтенд
- ✨ **Минималистичный дизайн** - чистый, профессиональный интерфейс
- 🌓 **Тёмная и светлая тема** - полная поддержка обеих тем
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- ⚡ **Быстрая загрузка** - React 19 + Tailwind 4
- 🎨 **Современная типография** - Geist Sans + Inter

### Бэкенд
- 🤖 **Бесплатные AI модели**:
  - **Ollama** - локальное выполнение (без интернета)
  - **HuggingFace Inference API** - облачные модели
  - **Together AI** - fallback сервис
- 📚 **RAG (Retrieval-Augmented Generation)** - поиск в законодательстве РК
- 📄 **Генерация документов** - иски, претензии, договоры
- 🔐 **Безопасность** - шифрование данных

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- Python 3.8+
- Git

### Установка и запуск

#### 1. Клонировать репозиторий
```bash
git clone https://github.com/K09-0/juristai-v2.git
cd juristai-v2
```

#### 2. Запустить фронтенд
```bash
cd client
npm install
npm run dev
# Откроется на http://localhost:3000
```

#### 3. Запустить бэкенд (опционально)
```bash
cd backend

# Установить зависимости
pip install -r requirements.txt

# Выбрать LLM (см. BACKEND_SETUP.md)
export HF_API_TOKEN=hf_YOUR_TOKEN_HERE

# Запустить сервер
python -m uvicorn app.main:app --reload
# API доступен на http://localhost:8000
```

## 📖 Документация

- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Полная настройка бэкенда
- **[AI_MODELS_INTEGRATION.md](./AI_MODELS_INTEGRATION.md)** - Интеграция бесплатных AI моделей
- **[ideas.md](./ideas.md)** - Дизайн-философия и концепции

## 🏗️ Архитектура

```
juristai-v2/
├── client/                    # React 19 фронтенд
│   ├── src/
│   │   ├── pages/            # Страницы
│   │   ├── components/       # Компоненты (shadcn/ui)
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Утилиты
│   │   └── index.css         # Глобальные стили
│   └── package.json
│
├── backend/                   # FastAPI бэкенд
│   ├── app/
│   │   ├── main.py           # FastAPI приложение
│   │   ├── config.py         # Конфигурация
│   │   ├── services/         # Бизнес-логика
│   │   │   ├── llm_service.py       # LLM (Ollama, HF, Together)
│   │   │   └── embeddings.py        # Embeddings
│   │   └── routers/          # API роутеры
│   ├── requirements.txt
│   └── .env.example
│
├── README.md
├── BACKEND_SETUP.md
└── AI_MODELS_INTEGRATION.md
```

## 🎨 Дизайн

### Цветовая схема

**Светлая тема:**
- Фон: #ffffff
- Текст: #1a1a1a
- Акцент: #0066cc (синий)
- Вторичный: #f0f0f0 (серый)

**Тёмная тема:**
- Фон: #0f172a (глубокий синий)
- Текст: #e5e7eb (светлый серый)
- Акцент: #3b82f6 (яркий синий)
- Вторичный: #334155 (тёмный серый)

### Типография
- **Заголовки**: Geist Sans (600-800 weight)
- **Тело текста**: Inter (400-500 weight)
- **Моноширинный**: JetBrains Mono (для кода)

## 🤖 AI Модели

### Текущая конфигурация

| Компонент | Модель | Источник | Стоимость |
|-----------|--------|----------|----------|
| LLM (основной) | Mistral 7B | Ollama/HF | Бесплатно |
| LLM (fallback) | Llama 2 7B | Together AI | Бесплатно |
| Embeddings | all-MiniLM-L6-v2 | HuggingFace | Бесплатно |

### Переключение моделей

```bash
# Ollama (локально)
export USE_OLLAMA=true
export OLLAMA_MODEL=mistral

# HuggingFace API (облако)
export HF_API_TOKEN=hf_YOUR_TOKEN
export HF_MODEL=mistralai/Mistral-7B-Instruct-v0.1

# Together AI (облако, fallback)
export TOGETHER_API_KEY=your_key
export TOGETHER_MODEL=togethercomputer/llama-2-7b-chat
```

## 📊 Функционал

### Реализовано ✅
- Минималистичный UI с тёмной/светлой темой
- Адаптивный дизайн
- Интеграция с бесплатными AI моделями
- FastAPI бэкенд с поддержкой Ollama, HF, Together AI
- Embeddings сервис для RAG

### В разработке 🚧
- RAG поиск в законодательстве РК
- Генерация юридических документов
- Анализ договоров
- Аудио-транскрибация
- Аутентификация пользователей
- Система тарифов

## 🔧 Технологический стек

### Фронтенд
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Wouter (маршрутизация)
- Vite (сборка)

### Бэкенд
- FastAPI
- Python 3.8+
- HuggingFace Transformers
- Ollama (опционально)
- httpx (асинхронный HTTP)

## 📝 Лицензия

MIT License - см. LICENSE файл

## 🤝 Контрибьютинг

Приветствуются pull requests! Для больших изменений сначала откройте issue.

## 📧 Контакты

- GitHub: [@K09-0](https://github.com/K09-0)
- Email: contact@juristai.kz (если будет)

## 🙏 Благодарности

- [Ollama](https://ollama.ai) - локальные LLM модели
- [HuggingFace](https://huggingface.co) - облачные модели и embeddings
- [Together AI](https://www.together.ai) - fallback LLM сервис
- [shadcn/ui](https://ui.shadcn.com) - компоненты UI
- [Tailwind CSS](https://tailwindcss.com) - стили

---

**Статус**: 🚀 В активной разработке

**Последнее обновление**: Март 2026
