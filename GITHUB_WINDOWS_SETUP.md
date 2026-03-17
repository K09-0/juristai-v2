# Загрузка JuristAI v2 на GitHub с Windows

Полная пошаговая инструкция для Windows пользователей.

## 📋 Требования

1. **Git для Windows** - https://git-scm.com/download/win
2. **GitHub аккаунт** - https://github.com (у вас уже есть: K09-0)

## 🚀 Пошаговая инструкция

### Шаг 1: Скачать и установить Git для Windows

1. Перейти на https://git-scm.com/download/win
2. Скачать **Git for Windows Setup**
3. Запустить установщик
4. Выбрать все параметры по умолчанию (нажимать Next)
5. Завершить установку

### Шаг 2: Скачать проект JuristAI v2

1. Я предоставлю вам ZIP архив со всеми файлами
2. Распаковать архив в удобную папку, например:
   ```
   C:\Users\YourName\Documents\juristai-v2
   ```

### Шаг 3: Открыть Git Bash в папке проекта

1. Открыть папку `C:\Users\YourName\Documents\juristai-v2`
2. **Правый клик** в пустом месте папки
3. Выбрать **"Git Bash Here"**

### Шаг 4: Настроить Git (первый раз)

В открывшемся окне Git Bash выполнить команды:

```bash
# Установить ваше имя
git config --global user.name "K09-0"

# Установить ваш email (тот, что на GitHub)
git config --global user.email "ratnikoveugen@mail.ru"
```

### Шаг 5: Создать репозиторий на GitHub

1. Открыть https://github.com
2. Нажать на **+** в верхнем правом углу
3. Выбрать **"New repository"**
4. Заполнить:
   - **Repository name**: `juristai-v2`
   - **Description**: `Legal AI Assistant for Kazakhstan`
   - **Visibility**: Public (чтобы использовать GitHub Pages бесплатно)
5. **НЕ выбирать** "Initialize this repository with..."
6. Нажать **"Create repository"**

### Шаг 6: Загрузить проект на GitHub

В Git Bash (в папке проекта) выполнить команды по одной:

```bash
# Инициализировать Git репозиторий
git init

# Добавить все файлы
git add .

# Создать первый коммит
git commit -m "Initial commit: JuristAI v2 - Legal AI Assistant for Kazakhstan"

# Добавить удаленный репозиторий (замените K09-0 на ваш username)
git remote add origin https://github.com/K09-0/juristai-v2.git

# Переименовать ветку на main
git branch -M main

# Загрузить на GitHub
git push -u origin main
```

**При запросе пароля:**
- GitHub больше не принимает пароли для Git
- Нужно использовать **Personal Access Token**

### Шаг 7: Создать Personal Access Token

1. Открыть https://github.com/settings/tokens
2. Нажать **"Generate new token"** → **"Generate new token (classic)"**
3. Заполнить:
   - **Note**: `JuristAI v2 deployment`
   - **Expiration**: 90 days
   - **Scopes**: выбрать все (или минимум `repo`, `workflow`)
4. Нажать **"Generate token"**
5. **Скопировать токен** (он больше не будет виден!)

### Шаг 8: Использовать токен при загрузке

Когда Git запросит пароль:
- **Username**: `K09-0`
- **Password**: вставить скопированный токен (Ctrl+V)

После этого файлы загрузятся на GitHub!

### Шаг 9: Проверить на GitHub

1. Открыть https://github.com/K09-0/juristai-v2
2. Должны быть видны все папки и файлы проекта
3. Если видны - отлично! ✅

## 🔧 Альтернативный способ (GitHub Desktop)

Если вам сложно с командной строкой:

1. Скачать **GitHub Desktop** - https://desktop.github.com
2. Установить
3. Авторизоваться с аккаунтом K09-0
4. Нажать **"File"** → **"Clone repository"**
5. Выбрать папку с проектом
6. Нажать **"Publish repository"**

## 🚀 После загрузки на GitHub

Когда репозиторий будет на GitHub:

1. Перейти в **Settings** репозитория
2. Выбрать **Pages**
3. Выбрать:
   - **Source**: `main` branch
   - **Folder**: `/docs`
4. Нажать **Save**
5. GitHub Pages будет доступен по адресу: `https://K09-0.github.io/juristai-v2`

## 🎯 Развертывание на Railway

После загрузки на GitHub:

1. Перейти на https://railway.app
2. Нажать **"New Project"**
3. Выбрать **"Deploy from GitHub"**
4. Авторизоваться с GitHub
5. Выбрать репозиторий `K09-0/juristai-v2`
6. Railway автоматически обнаружит `Dockerfile` и развернет приложение
7. Получить URL API (например: `https://juristai-api-production.up.railway.app`)

## 🐛 Решение проблем

### "fatal: not a git repository"
- Убедитесь, что вы в правильной папке
- Выполните `git init` еще раз

### "Permission denied (publickey)"
- Создайте Personal Access Token (см. Шаг 7)
- Используйте токен вместо пароля

### "fatal: 'origin' does not appear to be a 'git' repository"
- Проверьте, что правильно скопировали URL репозитория
- Выполните: `git remote -v` (должен показать URL)

### Файлы не загружаются
- Проверьте интернет соединение
- Попробуйте: `git push -u origin main` еще раз
- Убедитесь, что используете правильный токен

## 📝 Полезные Git команды

```bash
# Проверить статус
git status

# Просмотреть удаленные репозитории
git remote -v

# Просмотреть историю коммитов
git log

# Отменить последний коммит (если ошибка)
git reset --soft HEAD~1

# Просмотреть текущую ветку
git branch
```

## ✅ Чек-лист

- [ ] Git установлен на Windows
- [ ] Проект распакован в папку
- [ ] Git Bash открыт в папке проекта
- [ ] Git настроен (user.name и user.email)
- [ ] Репозиторий создан на GitHub
- [ ] Personal Access Token создан
- [ ] Файлы загружены на GitHub
- [ ] Репозиторий видна на GitHub
- [ ] GitHub Pages настроена
- [ ] Railway проект создан и развернут

---

**Если что-то не понятно - напишите мне, помогу! 😊**
