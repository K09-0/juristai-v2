# GitHub Pages Setup для JuristAI v2

## Шаг 1: Инициализация Git репозитория

```bash
cd /home/ubuntu/juristai-v2

# Инициализировать Git (если еще не инициализирован)
git init

# Добавить все файлы
git add .

# Первый коммит
git commit -m "Initial commit: JuristAI v2 - Legal AI Assistant for Kazakhstan"

# Добавить удаленный репозиторий
git remote add origin https://github.com/K09-0/juristai-v2.git

# Переименовать ветку на main
git branch -M main

# Загрузить на GitHub
git push -u origin main
```

## Шаг 2: Настройка GitHub Pages

1. Перейти в репозиторий на GitHub: https://github.com/K09-0/juristai-v2
2. Нажать на **Settings**
3. В левом меню выбрать **Pages**
4. В разделе **Source** выбрать:
   - Branch: `main`
   - Folder: `/docs`
5. Нажать **Save**

## Шаг 3: Подготовка файлов для GitHub Pages

```bash
# Скопировать собранные файлы в папку docs
cp -r /home/ubuntu/juristai-v2/dist/public/* /home/ubuntu/juristai-v2/docs/

# Создать файл CNAME для пользовательского домена
echo "juristai.site" > /home/ubuntu/juristai-v2/docs/CNAME

# Добавить в Git
cd /home/ubuntu/juristai-v2
git add docs/
git commit -m "Deploy: JuristAI v2 to GitHub Pages"
git push
```

## Шаг 4: Настройка пользовательского домена

### На GitHub:
1. В Settings > Pages добавить Custom domain: `juristai.site`
2. GitHub автоматически создаст файл `CNAME`
3. Включить "Enforce HTTPS" (обязательно!)

### На хостинге домена (domainnameapi.com):

#### Способ 1: CNAME запись (рекомендуется)
```
Name: @ или juristai
Type: CNAME
Value: K09-0.github.io
TTL: 3600
```

#### Способ 2: A записи (альтернатива)
```
Name: @
Type: A
Values:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
TTL: 3600
```

## Шаг 5: Проверка развертывания

1. Подождать 5-10 минут для распространения DNS
2. Открыть https://juristai.site в браузере
3. Проверить, что сайт загружается корректно

## Автоматизация развертывания

Создать GitHub Actions workflow для автоматической сборки и развертывания:

```bash
mkdir -p /home/ubuntu/juristai-v2/.github/workflows
```

Создать файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: cd client && pnpm install
      
      - name: Build
        run: cd client && pnpm build
      
      - name: Deploy to GitHub Pages
        run: |
          cp -r client/dist/public/* docs/
          echo "juristai.site" > docs/CNAME
      
      - name: Push changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/
          git commit -m "Deploy: Automated build" || true
          git push
```

## Проблемы и решения

### GitHub Pages не обновляется
- Очистить кэш браузера (Ctrl+Shift+Delete)
- Проверить, что файлы в папке `docs/`
- Подождать 1-2 минуты после push

### Домен не работает
- Проверить DNS записи (может занять 24-48 часов)
- Убедиться, что CNAME файл создан в репозитории
- Проверить настройки GitHub Pages (Settings > Pages)

### HTTPS не работает
- Убедиться, что "Enforce HTTPS" включен в GitHub Pages
- Подождать несколько минут для генерации SSL сертификата

## Ссылки

- GitHub Pages: https://K09-0.github.io/juristai-v2
- Пользовательский домен: https://juristai.site
- GitHub репозиторий: https://github.com/K09-0/juristai-v2
