# Развертывание JuristAI v2 на Railway

Railway - это современная платформа для развертывания приложений с простой интеграцией GitHub.

## 🚀 Быстрый старт (5 минут)

### Шаг 1: Подготовка GitHub репозитория

```bash
cd /home/ubuntu/juristai-v2

# Инициализировать Git
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "Initial commit: JuristAI v2 with FastAPI backend"

# Добавить удаленный репозиторий
git remote add origin https://github.com/K09-0/juristai-v2.git

# Переименовать ветку на main
git branch -M main

# Загрузить на GitHub
git push -u origin main
```

### Шаг 2: Создание Railway проекта

1. Перейти на https://railway.app
2. Нажать **New Project**
3. Выбрать **Deploy from GitHub**
4. Авторизоваться с GitHub аккаунтом
5. Выбрать репозиторий `K09-0/juristai-v2`
6. Выбрать ветку `main`

### Шаг 3: Конфигурация Railway

1. Railway автоматически обнаружит `Dockerfile` в папке `backend/`
2. Нажать **Deploy**
3. Дождаться завершения развертывания (обычно 2-3 минуты)

### Шаг 4: Получение URL API

1. После развертывания Railway выдаст публичный URL
2. Скопировать URL (например: `https://juristai-api-production.up.railway.app`)
3. Использовать этот URL в фронтенде

## 📋 Структура проекта для Railway

```
juristai-v2/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI приложение
│   │   ├── config.py        # Конфигурация
│   │   └── services/        # Бизнес-логика
│   ├── Dockerfile           # Docker конфигурация
│   ├── Procfile             # Heroku/Railway конфигурация
│   ├── railway.json         # Railway конфигурация
│   ├── requirements.txt     # Python зависимости
│   └── .dockerignore        # Исключения для Docker
├── client/                  # React фронтенд
└── docs/                    # GitHub Pages статические файлы
```

## 🔧 Переменные окружения

Railway автоматически предоставляет переменные окружения:

```bash
PORT=8000                    # Порт приложения (автоматический)
RAILWAY_ENVIRONMENT_NAME     # Имя окружения
RAILWAY_SERVICE_NAME         # Имя сервиса
```

Дополнительные переменные (добавить в Railway Dashboard):

```bash
# AI Models
HF_API_TOKEN=your_token      # HuggingFace API token (опционально)
TOGETHER_API_KEY=your_key    # Together AI API key (опционально)

# CORS
ALLOWED_ORIGINS=https://juristai.site,https://K09-0.github.io

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password
```

## 📝 Добавление переменных окружения в Railway

1. Открыть Railway Dashboard
2. Выбрать проект JuristAI
3. Нажать на сервис `backend`
4. Перейти в **Variables**
5. Добавить необходимые переменные

## 🔗 Интеграция с фронтендом

После получения URL API от Railway:

1. Открыть `/home/ubuntu/juristai-v2/client/src/lib/api.ts`
2. Обновить `API_BASE_URL`:

```typescript
const API_BASE_URL = 'https://your-railway-api-url.up.railway.app'
```

3. Пересобрать фронтенд:

```bash
cd /home/ubuntu/juristai-v2/client
pnpm build
```

4. Загрузить на GitHub Pages:

```bash
cp -r dist/public/* ../docs/
git add docs/
git commit -m "Update: Connect to Railway API"
git push
```

## 📊 Мониторинг

Railway предоставляет встроенный мониторинг:

1. Открыть Railway Dashboard
2. Выбрать проект
3. Просмотреть:
   - **Logs** - логи приложения
   - **Metrics** - CPU, память, сетевой трафик
   - **Deployments** - история развертываний

## 🐛 Решение проблем

### Приложение не запускается
```bash
# Проверить логи в Railway Dashboard
# Убедиться, что Dockerfile корректен
# Проверить, что все зависимости в requirements.txt
```

### Ошибка 502 Bad Gateway
```bash
# Приложение не слушает правильный порт
# Убедиться, что используется PORT переменная окружения
# Проверить логи в Railway
```

### CORS ошибки
```bash
# Обновить ALLOWED_ORIGINS в переменных окружения
# Убедиться, что фронтенд отправляет правильный Origin header
```

## 🚀 Масштабирование

Railway позволяет легко масштабировать приложение:

1. Открыть Railway Dashboard
2. Выбрать сервис
3. Нажать **Scale**
4. Увеличить количество реплик или ресурсы

## 💰 Стоимость

Railway предоставляет:
- **$5/месяц** бесплатного кредита
- Оплата только за использованные ресурсы
- Автоматическое отключение при превышении лимита

## 📚 Дополнительные ресурсы

- [Railway Documentation](https://docs.railway.app)
- [Railway GitHub Integration](https://docs.railway.app/guides/github)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Railway Monitoring](https://docs.railway.app/guides/monitoring)

## ✅ Чек-лист развертывания

- [ ] Код загружен на GitHub
- [ ] Railway проект создан
- [ ] Dockerfile и requirements.txt в порядке
- [ ] Развертывание завершено успешно
- [ ] URL API получен
- [ ] Фронтенд обновлен с URL API
- [ ] CORS переменные установлены
- [ ] Тестирование API работает
- [ ] Логи в Railway чистые (без ошибок)
- [ ] GitHub Pages обновлены

---

**Версия**: 2.0.0  
**Последнее обновление**: Март 2026
