# 🔧 Быстрый старт: Интеграция Landing Page + React App

## ✅ Что было сделано

Ваши два проекта объединены в один:

```
Landing Page (HTML/CSS/JS)     →  https://yourdomain.com/
          +
React Dashboard                →  https://yourdomain.com/app
          =
Единое приложение на Vercel
```

## 🚀 Быстрый старт

### 1. Локальный запуск (5 минут)

```bash
# Установка зависимостей
npm install

# Запуск development сервера
npm start
```

Откроется `http://localhost:3000`

### 2. Развёртывание на Vercel (10 минут)

#### Вариант А: Через GitHub (рекомендуется)

```bash
# 1. Загрузите на GitHub
git add .
git commit -m "Merged landing and React app"
git push origin main

# 2. Откройте https://vercel.com
# 3. Нажмите "New Project" → выберите репо
# 4. Vercel автоматически всё настроит ✨
# 5. Добавьте домен в Settings → Domains
```

#### Вариант Б: Через Vercel CLI

```bash
# 1. Установите Vercel CLI
npm install -g vercel

# 2. Авторизуйтесь
vercel login

# 3. Разверните
vercel --prod
```

## 📁 Где что находится

| Что | Где | Для чего |
|-----|-----|---------|
| Landing Page | `/public/landing/` | HTML/CSS/JS landing |
| React компоненты | `/src/` | Dashboard приложение |
| Маршруты | `src/App.js` | Router конфиг |
| Vercel конфиг | `vercel.json` | SPA настройки |

## 🔗 Маршруты

| URL | Что открывается |
|-----|-----------------|
| `/` | Landing Page (из HTML) |
| `/app` | Dashboard (React) |
| `/app/dashboard` | Все остальные маршруты идут сюда |

## ⚙️ Переменные окружения

На Vercel в **Settings → Environment Variables** добавьте:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-key-here
```

Используйте в коде:
```javascript
const url = process.env.REACT_APP_SUPABASE_URL;
```

## 🔌 Обновление Landing Page

Landing Page теперь в `/public/landing/`. Чтобы обновить:

1. Отредактируйте файлы в `/public/landing/`
2. При разработке (npm start) обновите страницу в браузере
3. При production просто push на GitHub → Vercel сам разберётся

## 🎯 Что дальше

1. **Откройте проект:**
   ```bash
   npm install
   npm start
   ```

2. **Тестируйте локально:**
   - Перейдите на `http://localhost:3000/` (Landing Page)
   - Перейдите на `http://localhost:3000/app` (React App)

3. **Готовы к production?**
   - Создайте GitHub репо или используйте Vercel CLI
   - Добавьте переменные окружения
   - Привяжите домен

## 📖 Полная документация

Смотрите `DEPLOYMENT.md` для подробных инструкций и решения проблем.

## ✨ Ключевые изменения

- ✅ `react-router-dom` установлен
- ✅ Новый `App.js` с маршрутами
- ✅ `DashboardApp.js` - основное приложение
- ✅ `LandingPage.js` компонент (загружает HTML)
- ✅ `vercel.json` для правильного роутинга на Vercel
- ✅ `public/landing/` - все файлы Landing Page

## 🆘 Проблемы?

Проверьте:
- [ ] `npm install` выполнен успешно
- [ ] `npm start` запускается без ошибок
- [ ] Файлы в `public/landing/` на месте
- [ ] `vercel.json` содержит правильные rewrites

Остальное - смотрите `DEPLOYMENT.md`!
