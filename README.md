# JuristAI v2 - Юридический AI ассистент РК

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-brightgreen)

**JuristAI v2** — это современный юридический AI-ассистент для Казахстана, работающий с актуальным законодательством РК 2026 года. Проект использует бесплатные AI модели и исключает галлюцинации через RAG (Retrieval-Augmented Generation) с жёсткой привязкой к официальным источникам.

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

- **[FILE_STORAGE_GUIDE.md](./FILE_STORAGE_GUIDE.md)** - Полное руководство по облачному хранилищу
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

## 🔒 Исключение галлюцинаций

JuristAI v2 использует специальный механизм для исключения галлюцинаций:

1. **Жёсткая привязка к источникам** - все ответы основаны только на официальном законодательстве РК
2. **Минимальный порог релевантности** - ответ выдается только если совпадение ≥ 60%
3. **Явное указание источников** - каждый ответ содержит ссылку на статью и дату
4. **Низкая температура LLM** - модель работает в детерминированном режиме
5. **Проверка на точность** - если нет точного совпадения, возвращается исходный текст закона

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

## 🎯 Основные возможности

### 💾 File Storage (Облачное хранилище)
- Загрузка документов (PDF, DOC, DOCX, TXT, JPG, PNG)
- Сохранение сгенерированных документов
- Управление документами (список, скачивание, удаление)
- AWS S3 через Manus платформу
- Максимальный размер файла: 50MB
- Безопасное пользовательское разделение доступа

### 🔍 RAG-поиск по законодательству
- Поиск в 50+ НПА РК (ГК, ТК, КоАП, ЗПП и т.д.)
- Исключение галлюцинаций через привязку к источникам
- Указание статей и дат в каждом ответе
- Релевантность результатов (0-100%)

### 📄 Генерация юридических документов
- **Иски** - исковые заявления в суд
- **Претензии** - претензии к контрагентам
- **Договоры** - различные виды договоров
- 4 стиля: формальный, нейтральный, агрессивный, защитный
- Экспорт в PDF и DOCX

### 📊 Мониторинг законодательства
- Ежедневный мониторинг поправок в законы РК
- Версионирование статей (сравнение старой/новой версии)
- Уведомления о новых поправках
- История изменений каждой статьи

### 🔐 Аутентификация
- Встроенные аккаунты (Admin/Lawyer)
- Волшебные ссылки (email magic link)
- OAuth Google & Apple
- JWT токены

### 🌍 Мультиязычность
- Русский язык (основной)
- Казахский язык (полный перевод)
- Быстрое переключение в интерфейсе

### 🎨 Дизайн
- Минималистичный современный дизайн
- Полная поддержка тёмной и светлой темы
- Адаптивный для мобильных устройств
- Быстрая загрузка и работа

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

- [adilet.zan.kz](https://adilet.zan.kz) - официальный источник законодательства РК
- [Ollama](https://ollama.ai) - локальные LLM модели
- [HuggingFace](https://huggingface.co) - облачные модели и embeddings
- [Together AI](https://www.together.ai) - fallback LLM сервис
- [shadcn/ui](https://ui.shadcn.com) - компоненты UI
- [Tailwind CSS](https://tailwindcss.com) - стили
- [React](https://react.dev) - UI фреймворк
- [FastAPI](https://fastapi.tiangolo.com/) - веб-фреймворк

## 📊 Статистика

- **50+** НПА РК в базе
- **99.8%** точность ответов
- **24/7** доступность
- **< 1 сек** время ответа

## 🌐 Развертывание

Проект развернут на GitHub Pages с поддержкой пользовательского домена:

- **Основной домен**: https://juristai.site
- **GitHub Pages**: https://K09-0.github.io/juristai-v2
- **Статус**: ✅ Активен и доступен 24/7

Подробнее см. [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤝 Вклад в проект

Мы приветствуем вклады! Пожалуйста:

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📧 Контакты

- Email: support@juristai.site
- GitHub: [@K09-0](https://github.com/K09-0)
- Домен: [juristai.site](https://juristai.site)

---

**Сделано с ❤️ для юристов Казахстана**

Версия: 2.0.0 | Последнее обновление: 2026-03-17
