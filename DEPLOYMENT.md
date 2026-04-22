# 🚀 Развёртывание WrapGO на Vercel

Это руководство описывает как объединённый проект (Landing Page + React App) развёртывается на Vercel.

## 📋 Структура проекта

```
/
├── public/
│   ├── index.html              # React app HTML
│   ├── landing/                # Landing Page HTML файлы
│   │   ├── index.html
│   │   ├── font.css
│   │   ├── main.js
│   │   └── ...
│   └── manifest.json
├── src/
│   ├── App.js                  # Главный Router
│   ├── DashboardApp.js         # Основное приложение
│   ├── Pages/
│   │   ├── Landing/
│   │   │   ├── LandingPage.js  # Компонент Landing Page
│   │   │   └── landing.css
│   │   └── ...
│   └── ...
├── vercel.json                 # Конфиг Vercel
└── package.json
```

## 🔗 Структура маршрутов

- **`https://yourdomain.com/`** → Landing Page (HTML)
- **`https://yourdomain.com/app`** → React Dashboard  
- **`https://yourdomain.com/app/dashboard`** → Все маршруты внутри /app

## 🛠️ Установка и запуск локально

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск в режиме разработки

```bash
npm start
```

Приложение откроется на `http://localhost:3000`

- **localhost:3000/** → Landing Page
- **localhost:3000/app** → React App

### 3. Сборка для production

```bash
npm run build
```

Результат сборки будет в папке `build/`

## 📦 Развёртывание на Vercel

### Способ 1: CLI (Рекомендуется для первого раза)

#### Шаг 1: Установите Vercel CLI

```bash
npm install -g vercel
```

#### Шаг 2: Авторизуйтесь

```bash
vercel login
```

#### Шаг 3: Развернём проект

```bash
vercel --prod
```

Vercel автоматически обнаружит, что это React приложение и настроит сборку.

### Способ 2: GitHub интеграция (Рекомендуется для постоянного использования)

#### Шаг 1: Загрузите код на GitHub

```bash
git add .
git commit -m "Initial commit: Merged landing page with React app"
git push origin main
```

#### Шаг 2: Откройте Vercel Dashboard

- Перейдите на [vercel.com](https://vercel.com)
- Нажмите "New Project"
- Выберите ваш GitHub репозиторий
- Vercel автоматически подберёт настройки для React

#### Шаг 3: Добавьте домен

- В настройках проекта перейдите в "Domains"
- Добавьте ваш кастомный домен
- Следуйте инструкциям по настройке DNS

### Способ 3: Развёртывание из GitHub Actions (Продвинуто)

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

Потребуется добавить secrets в GitHub Settings.

## 🔧 Конфигурация

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    {
      "source": "/landing/(.*)",
      "destination": "/landing/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Объяснение:**
- `buildCommand` - команда для сборки
- `outputDirectory` - папка с результатом сборки
- `rewrites` - маршруты для SPA роутинга

## 🌍 Доменные переменные (Environment Variables)

На Vercel в Settings → Environment Variables добавьте:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=https://api.yourdomain.com
```

Используйте в коде как:
```javascript
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
```

## 🐛 Проблемы и решения

### Landing Page загружается как белая страница

**Решение:** Проверьте что файлы в `public/landing/` скопированы правильно:

```bash
ls public/landing/
# Должны быть: index.html, font.css, main.js и т.д.
```

### Ошибка CORS при загрузке landing page в iframe

**Решение:** Убедитесь что все пути относительные в `public/landing/index.html`

Вместо:
```html
<link href="https://fonts.googleapis.com..." rel="stylesheet" />
```

Используйте:
```html
<link href="/landing/font.css" rel="stylesheet" />
```

### React Router не работает правильно

**Решение:** Убедитесь что `vercel.json` содержит корректные rewrites.

## 📚 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [React Router Docs](https://reactrouter.com)
- [Vercel SPA Configuration](https://vercel.com/docs/concepts/deployments/configure-a-build)

## 👨‍💻 Разработка

### Добавление новой страницы в React App

1. Создайте компонент в `src/Pages/`
2. Добавьте в `DashboardApp.js` в switch statement
3. Используйте `setPage()` для навигации

### Обновление Landing Page

1. Отредактируйте файлы в `public/landing/`
2. При локальной разработке обновите страницу браузера
3. При production - просто push на GitHub (автоматическое развёртывание)

## 📞 Поддержка

Если возникнут проблемы:
1. Проверьте логи в консоли браузера (F12)
2. Проверьте логи Vercel: Settings → Deployments
3. Убедитесь что все зависимости установлены: `npm install`
