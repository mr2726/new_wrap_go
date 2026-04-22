# ✅ Чек-лист подготовки к Production

## 🔍 Перед началом

- [ ] Все файлы скопированы успешно
- [ ] `npm install` выполнен без ошибок
- [ ] `npm start` запускается локально
- [ ] Обе страницы работают локально

## 🧪 Локальное тестирование (npm start)

### Landing Page (http://localhost:3000/)

- [ ] Страница загружается полностью
- [ ] Все стили применены (зелёный цвет, шрифты, адаптивность)
- [ ] Изображения видны
- [ ] Кнопки кликаются
- [ ] Ссылки работают
- [ ] Адаптивность на мобильных

### React Dashboard (http://localhost:3000/app)

- [ ] Приложение загружается после Landing Page
- [ ] Форма входа работает
- [ ] Регистрация работает
- [ ] Навигация между страницами работает
- [ ] Таблицы и графики отображаются
- [ ] Карта отображается
- [ ] Работает поиск, фильтры

### Переходы

- [ ] С Landing Page есть кнопка на /app
- [ ] С /app возврат на / работает
- [ ] Все внутренние ссылки работают

## 🏗️ Проверка сборки

```bash
npm run build
# Ожидаемо:
# - ✓ build/ создана
# - ✓ build/index.html есть
# - ✓ build/static/ есть
# - ✓ build/landing/ есть
# - ✓ Размер bundle <500KB (оптимально)
```

Проверьте:
- [ ] Сборка завершена без ошибок
- [ ] build/landing/ содержит все файлы
- [ ] Размер bundle приемлем

## 🌍 Переменные окружения

### На Vercel Dashboard:

Settings → Environment Variables добавьте:

```
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyxxxx...
```

### Проверьте в коде:

- [ ] `src/data/supabase.js` использует `process.env.REACT_APP_SUPABASE_URL`
- [ ] Все API endpoints настроены на production
- [ ] Токены не hardcoded в коде

## 📝 Git и GitHub

```bash
# 1. Инициализация если нужна
git init
git add .
git commit -m "Merged landing page with React dashboard"

# 2. Добавьте remote
git remote add origin https://github.com/YOUR_USERNAME/new-wrapgo-customer.git

# 3. Push
git push -u origin main
```

Проверьте:
- [ ] GitHub репо создано
- [ ] Все файлы загружены
- [ ] Нет node_modules в репо (есть .gitignore)
- [ ] Нет .env файлов с секретами

## 🚀 Развёртывание на Vercel

### Способ 1: GitHub Интеграция (Рекомендуется)

1. Откройте [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Выберите GitHub репо
4. Vercel автоматически подберёт настройки
5. Нажмите "Deploy"

Проверьте после развёртывания:
- [ ] Deployment успешен (зелёная галочка)
- [ ] Предпросмотр ссылка работает
- [ ] Landing Page загружается
- [ ] Dashboard загружается на /app

### Способ 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 🌐 Домен

### Связываем домен с Vercel:

1. На Vercel Dashboard → Settings → Domains
2. Добавьте домен (например, wrapgo.com)
3. Скопируйте NS записи от Vercel
4. На хостинге домена обновите DNS:

```
NS1: cname.vercel-dns.com
NS2: cname.vercel-dns.com
```

Проверьте:
- [ ] Домен добавлен на Vercel
- [ ] DNS обновлены у регистратора
- [ ] Ждите 24-48 часов для полного распространения
- [ ] Проверьте: `nslookup wrapgo.com`

## 🔒 Безопасность

- [ ] Нет hardcoded секретов в коде
- [ ] Все переменные окружения установлены на Vercel
- [ ] HTTPS включён (Vercel автоматически)
- [ ] CORS правильно настроен
- [ ] .env файл в .gitignore

## 📊 Мониторинг

### После развёртывания:

1. Перейдите на https://yourdomain.com
2. Откройте DevTools (F12)
3. Проверьте Console на ошибки
4. Проверьте Network на failed запросы
5. Проверьте Performance

Ожидаемо:
- [ ] Нет ошибок 404
- [ ] Нет CORS ошибок
- [ ] Supabase успешно подключается
- [ ] Все ассеты загружаются
- [ ] Performance Score > 80

### Vercel Analytics:

- Перейдите Settings → Analytics
- Включите Edge Middleware Analytics
- Мониторьте Web Vitals

Проверьте:
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

## 🔄 Автоматическое развёртывание

После первого Deploy Vercel будет автоматически:
- Собирать на каждый push
- Раздавать на yourdomain.com
- Хранить history всех версий

Можно откатиться на любую версию в Deployments.

## 🧹 Cleanup

После успешного развёртывания:

```bash
# Удалить локальный build
rm -rf build/

# Можно удалить файл Landing Page из src
rm -rf src/Pages/Landing/public/

# Но сохраните:
# - src/Pages/Landing/LandingPage.js
# - src/Pages/Landing/landing.css
# - public/landing/*
```

## ⚠️ Возможные проблемы и решения

### Landing Page белая страница
- Проверьте: `curl https://yourdomain.com/landing/index.html`
- Файлы скопированы в `public/landing/`?
- MIME типы правильные?

### Dashboard не загружается на /app
- Проверьте vercel.json rewrites
- Есть ошибка в консоли?
- Переменные окружения установлены?

### Supabase не подключается
- Проверьте REACT_APP_SUPABASE_URL
- Правильный ANON_KEY?
- Правила Row Level Security настроены?

### Медленная загрузка
- Проверьте bundle size: `npm run analyze`
- Включена ли gzip на Vercel? (автоматически)
- Есть ли лишние зависимости?

## 📞 Финальные шаги

1. **Тестирование функциональности**
   - [ ] Войти/Выйти работает
   - [ ] Все данные загружаются
   - [ ] Форма отправки работает

2. **SEO и метаданные**
   - [ ] Правильные title и description
   - [ ] Open Graph метаданные
   - [ ] robots.txt правильный

3. **Уведомления**
   - [ ] Email уведомления работают
   - [ ] Webhook'и работают
   - [ ] Логирование включено

4. **Backup и восстановление**
   - [ ] Database backup настроена
   - [ ] Есть plan восстановления
   - [ ] Vercel backups работают

## ✨ Готово!

```
✅ Landing: https://yourdomain.com/
✅ Dashboard: https://yourdomain.com/app
✅ Auto-deploy при push на GitHub
✅ SSL/HTTPS включён
✅ CDN кэширование работает
```

Приложение готово к production! 🎉
