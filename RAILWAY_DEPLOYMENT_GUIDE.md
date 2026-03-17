# Railway Deployment Guide для JuristAI v2

Это руководство поможет вам развернуть бэкенд JuristAI v2 на Railway за 5 минут.

## Предварительные требования

1. ✅ GitHub репозиторий с проектом (уже загружен)
2. ✅ Railway аккаунт (https://railway.app)
3. ✅ GitHub авторизация на Railway

## Шаг 1: Создать Railway проект

1. Перейти на https://railway.app
2. Нажать **"New Project"**
3. Выбрать **"Deploy from GitHub"**
4. Авторизоваться с GitHub аккаунтом
5. Выбрать репозиторий **"extraordinary-compassion / production"**
6. Нажать **"Deploy"**

## Шаг 2: Настроить переменные окружения

Railway автоматически обнаружит Dockerfile и начнет сборку.

Когда сборка завершится, нужно добавить переменные окружения:

1. В Railway Dashboard нажать на проект
2. Перейти в **"Variables"**
3. Добавить следующие переменные:

```
DATABASE_URL=mysql://user:password@host:3306/juristai
JWT_SECRET=your-secret-key-here
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

## Шаг 3: Получить URL бэкенда

1. В Railway Dashboard найти раздел **"Deployments"**
2. Скопировать URL вашего приложения (будет выглядеть как `https://juristai-api-production.up.railway.app`)
3. Сохранить этот URL - он нужен для фронтенда

## Шаг 4: Обновить фронтенд

После получения URL бэкенда, нужно обновить фронтенд:

1. В файле `client/src/lib/trpc.ts` найти строку с URL API
2. Заменить на ваш Railway URL:

```typescript
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "https://ваш-railway-url.up.railway.app/api/trpc",
      // ...
    }),
  ],
});
```

3. Пересобрать фронтенд: `pnpm build`
4. Загрузить на GitHub: `git add . && git commit -m "Update backend URL" && git push`
5. GitHub Pages автоматически обновится

## Шаг 5: Протестировать

1. Открыть https://k09-0.github.io/juristai-v2 (или ваш домен)
2. Авторизоваться
3. Попробовать создать документ
4. Проверить, что документ генерируется без ошибок

## Решение проблем

### Проблема: "Connection refused"
- Убедиться, что Railway приложение работает (статус "Running")
- Проверить, что URL бэкенда правильный

### Проблема: "Database connection failed"
- Убедиться, что `DATABASE_URL` правильный
- Проверить доступ к базе данных

### Проблема: "API key not found"
- Убедиться, что все переменные окружения добавлены
- Проверить значения ключей

### Проблема: "CORS error"
- Убедиться, что бэкенд разрешает запросы с фронтенда
- Проверить настройки CORS в `server/_core/index.ts`

## Мониторинг

После развертывания на Railway:

1. Открить Railway Dashboard
2. Перейти в **"Logs"** для просмотра логов
3. Перейти в **"Metrics"** для мониторинга производительности
4. Перейти в **"Settings"** для управления приложением

## Дополнительные ресурсы

- Railway Documentation: https://docs.railway.app
- tRPC Documentation: https://trpc.io
- Manus Platform Docs: https://docs.manus.im

## Поддержка

Если у вас возникли проблемы:

1. Проверить логи в Railway Dashboard
2. Проверить консоль браузера (F12 → Console)
3. Проверить Network вкладку для просмотра API запросов
4. Обратиться в поддержку Railway: https://railway.app/support
