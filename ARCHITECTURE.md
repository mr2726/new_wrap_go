# 📐 Архитектура объединённого проекта

## 🏗️ Общая структура

```
new-wrapgo-customer/
│
├── 📄 package.json                    # Зависимости (добавлен react-router-dom)
├── 🔧 vercel.json                    # Конфиг для Vercel (SPA роутинг)
├── 📖 INTEGRATION_GUIDE.md           # Быстрый старт
├── 📚 DEPLOYMENT.md                   # Полные инструкции развёртывания
│
├── public/                            # Статические файлы (раздаются как /public/...)
│   ├── index.html                     # HTML для React app
│   ├── manifest.json
│   ├── robots.txt
│   │
│   └── landing/                       # 🔥 Landing Page HTML файлы
│       ├── index.html                 # Landing page главный файл
│       ├── font.css
│       ├── main.js
│       ├── main2.js
│       ├── partnerprogram.html
│       ├── privacy_policy.html
│       ├── termsofservice.html
│       └── lufga/                     # Шрифты
│
├── src/                               # React исходный код
│   │
│   ├── App.js                         # 🔥 ГЛАВНЫЙ МАРШРУТИЗАТОР (новый файл)
│   │                                  # Содержит BrowserRouter с двумя маршрутами:
│   │                                  # - / → LandingPage
│   │                                  # - /app/* → DashboardApp
│   │
│   ├── DashboardApp.js                # 🔥 Основное приложение (переименован из App.js)
│   │                                  # Содержит всю логику аутентификации и навигации
│   │
│   ├── index.js                       # Entry point React
│   ├── index.css
│   ├── App.css
│   │
│   ├── Pages/                         # React компоненты страниц
│   │   ├── Landing/                   # 🔥 Новая папка для Landing Page
│   │   │   ├── LandingPage.js        # Компонент загружает /public/landing/index.html
│   │   │   └── landing.css
│   │   │
│   │   ├── Lending.js
│   │   ├── Singup.js
│   │   ├── Singin.js
│   │   ├── Terms.js
│   │   ├── PrivacyPolicy.js
│   │   ├── confirmEmail.js
│   │   ├── CompanyInfoForm.js
│   │   │
│   │   ├── Content/
│   │   │   ├── Content.js
│   │   │   ├── Overview.js
│   │   │   ├── Analitics.js
│   │   │   ├── Billing.js
│   │   │   ├── Contacts.js
│   │   │   ├── CampaignBuilder.js
│   │   │   ├── Settings.js
│   │   │   └── ...
│   │   │
│   │   └── ResetPassword/
│   │       ├── ResetOTP.js
│   │       ├── ResetPassword.js
│   │       ├── ResetPasswordEmail.js
│   │       └── ResetPasswordStatus.js
│   │
│   ├── Components/                    # Переиспользуемые компоненты
│   │   ├── SideBar.js
│   │   ├── Loader.js
│   │   ├── Logo.js
│   │   ├── SettingsForm.js
│   │   ├── Chart.js
│   │   └── ...
│   │
│   ├── data/
│   │   ├── data.json
│   │   └── supabase.js
│   │
│   ├── assets/                        # Изображения React приложения
│   └── Fonts/
│
├── build/                             # Результат сборки (после npm run build)
│   ├── index.html
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── landing/                       # Скопирована из /public/landing
│
└── node_modules/                      # Зависимости (npm install)
```

## 🔄 Поток данных и маршрутинг

### При доступе к `https://yourdomain.com/`

```
index.html (public/index.html)
    ↓
React App загружается
    ↓
App.js (BrowserRouter)
    ↓
Route "/" → LandingPage компонент
    ↓
LandingPage загружает: <iframe src="/landing/index.html" />
    ↓
Vercel обслуживает: public/landing/index.html
    ↓
Landing Page видна пользователю
```

### При доступе к `https://yourdomain.com/app`

```
index.html (public/index.html)
    ↓
React App загружается
    ↓
App.js (BrowserRouter)
    ↓
Route "/app/*" → DashboardApp компонент
    ↓
DashboardApp показывает основное приложение
    ↓
Dashboard видна пользователю
```

## 🔑 Ключевые файлы и их роль

### App.js (ГЛАВНЫЙ)
```javascript
<Router>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/app/*" element={<DashboardApp />} />
  </Routes>
</Router>
```
**Роль:** Управляет маршрутизацией между Landing Page и Dashboard

### DashboardApp.js
Содержит всю логику основного приложения (была старым App.js):
- Аутентификация через Supabase
- Навигация между страницами
- Управление состоянием (email, credentials и т.д.)

### LandingPage.js
```javascript
<iframe src="/landing/index.html" />
```
**Роль:** Загружает Landing Page как отдельную страницу через iframe

### vercel.json
Конфигурирует Vercel для:
- Сборки React приложения
- Правильного SPA роутинга (все пути идут на index.html)
- Исключения путей `/landing/*` (это статические файлы)

## 🔧 Как добавлять новые страницы

### Вариант 1: Страница в React Dashboard

1. Создайте компонент:
   ```javascript
   // src/Pages/NewPage.js
   export default function NewPage() {
     return <div>New Page</div>;
   }
   ```

2. Добавьте в DashboardApp.js:
   ```javascript
   case "new-page":
     return <NewPage />;
   ```

3. Используйте `setPage("new-page")` для навигации

### Вариант 2: Статическая страница в Landing Page

1. Добавьте HTML файл:
   ```
   public/landing/new-page.html
   ```

2. Добавьте ссылку на Landing Page:
   ```html
   <a href="/landing/new-page.html">New Page</a>
   ```

## 📦 Развёртывание процесс

```
git push origin main
    ↓
GitHub → Vercel webhook
    ↓
Vercel запускает: npm run build
    ↓
React собирается в /build
    ↓
Vercel раздаёт:
  - /build/index.html → все маршруты
  - /build/landing/* → статические файлы
    ↓
Приложение live на yourdomain.com ✨
```

## 🛡️ Безопасность

- Landing Page файлы статические (HTML/CSS/JS)
- React приложение скомпилировано и минифицировано
- Supabase credentials используют env переменные
- CORS обрабатывается через Vercel rewrites

## 📊 Производительность

- Landing Page загружается отдельно через iframe (не блокирует React)
- React bundle минифицирован и кэширован на Vercel CDN
- CSS обработан PostCSS + Tailwind
- JS бандлы оптимизированы

## 🔍 Отладка

### Проверить struktur сборки:
```bash
npm run build
ls -la build/
# Должны быть: index.html, static/, landing/
```

### Проверить маршруты локально:
- `http://localhost:3000/` → Landing Page
- `http://localhost:3000/app` → Dashboard
- `http://localhost:3000/any-path` → Dashboard (fallback)

### Проверить на Vercel:
1. Перейдите в Settings → Deployments
2. Нажмите на последнее развёртывание
3. Проверьте логи сборки
