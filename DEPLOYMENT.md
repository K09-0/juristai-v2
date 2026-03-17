# JuristAI v2 - Развертывание на GitHub Pages

## Быстрый старт

### 1. Подготовка репозитория

```bash
# Клонировать проект
git clone https://github.com/K09-0/juristai-v2.git
cd juristai-v2

# Инициализировать Git (если нужно)
git init
git add .
git commit -m "Initial commit: JuristAI v2"

# Добавить удаленный репозиторий
git remote add origin https://github.com/K09-0/juristai-v2.git
git branch -M main
git push -u origin main
```

### 2. Настройка GitHub Pages

1. Перейти в Settings репозитория
2. Выбрать Pages в левом меню
3. Установить Source: Deploy from a branch
4. Выбрать branch: main, folder: /docs или /dist
5. Сохранить

### 3. Настройка пользовательского домена

#### На GitHub:
1. В Settings > Pages добавить Custom domain: juristai.site
2. GitHub создаст файл CNAME

#### На вашем хостинге домена (domainnameapi.com):
1. Перейти в DNS настройки для juristai.site
2. Добавить CNAME запись:
   - Name: @ или juristai
   - Value: K09-0.github.io
3. Или использовать A записи:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153

### 4. Сборка и развертывание

```bash
# Установить зависимости
cd client
pnpm install

# Собрать проект
pnpm build

# Результат будет в dist/

# Скопировать в docs (для GitHub Pages)
cp -r dist/* ../docs/

# Загрузить на GitHub
cd ..
git add .
git commit -m "Build: production release"
git push
```

## Структура проекта

```
juristai-v2/
├── client/              # React фронтенд
│   ├── src/
│   │   ├── pages/      # Страницы
│   │   ├── components/ # Компоненты
│   │   ├── contexts/   # Context API
│   │   └── App.tsx     # Главное приложение
│   ├── package.json
│   └── vite.config.ts
├── backend/            # FastAPI бэкенд (опционально)
│   ├── app/
│   │   ├── services/   # Бизнес-логика
│   │   ├── main.py     # FastAPI приложение
│   │   └── config.py   # Конфигурация
│   └── requirements.txt
├── docs/               # Статические файлы для GitHub Pages
└── README.md
```

## Тестирование локально

```bash
# Запустить dev сервер
cd client
pnpm dev

# Открыть http://localhost:5173
```

## Переменные окружения

### Frontend (.env)
```
VITE_API_URL=https://api.juristai.site
VITE_APP_TITLE=JuristAI v2
```

### Backend (.env)
```
OLLAMA_API_URL=http://localhost:11434
HF_API_TOKEN=your_huggingface_token
TOGETHER_API_KEY=your_together_api_key
```

## Интеграция с бэкендом

Если вы хотите использовать бэкенд API:

1. Развернуть бэкенд на отдельном сервере (Heroku, Railway, Render и т.д.)
2. Обновить VITE_API_URL в frontend .env
3. Убедиться, что CORS настроен правильно

## Мониторинг законодательства

Для автоматического мониторинга поправок:

```bash
# Запустить скрипт мониторинга
python backend/scripts/monitor_legislation.py

# Или добавить в cron (каждый день в 00:00):
0 0 * * * cd /path/to/juristai-v2 && python backend/scripts/monitor_legislation.py
```

## Проблемы и решения

### GitHub Pages не обновляется
- Очистить кэш браузера (Ctrl+Shift+Delete)
- Проверить, что файлы в docs/ или dist/
- Подождать 1-2 минуты после push

### Домен не работает
- Проверить DNS записи (может занять 24-48 часов)
- Убедиться, что CNAME файл создан в репозитории
- Проверить настройки GitHub Pages

### API запросы не работают
- Проверить CORS настройки на бэкенде
- Убедиться, что API URL правильный
- Проверить консоль браузера (F12) на ошибки

## Безопасность

⚠️ **Важно:**
- Никогда не коммитить .env файлы с секретами
- Использовать GitHub Secrets для чувствительных данных
- Регулярно обновлять зависимости
- Использовать HTTPS для всех запросов

## Дополнительные ресурсы

- [GitHub Pages документация](https://docs.github.com/en/pages)
- [Vite документация](https://vitejs.dev/)
- [React документация](https://react.dev/)
- [FastAPI документация](https://fastapi.tiangolo.com/)
