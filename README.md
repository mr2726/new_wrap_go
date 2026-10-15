# WrapGo Customer App

Клиентская часть платформы WrapGo для управления рекламными кампаниями на автомобилях.

Проект объединяет:
- лендинг с точками входа для рекламодателей, водителей и владельцев автопарков;
- CRM-кабинет рекламодателя;
- Fleet-кабинет владельца автопарка;
- карту активных зон и водителей на Mapbox;
- интеграцию с Supabase (Auth, Database, Storage, Realtime, MFA).

## 1. Технологический стек

- Frontend: React 19, React Router, React Icons, Recharts, Mapbox GL
- Backend-as-a-Service: Supabase
- Стили: CSS + Tailwind/PostCSS (доступны в проекте)
- Сборка: Create React App (react-scripts)
- Деплой: Vercel

## 2. Архитектура и маршрутизация

В приложении два главных маршрута:

- /: публичный лендинг
- /app/*: внутренняя часть приложения (аутентификация и кабинеты)

Поток в App:
- Если на / пришел auth hash/query от Supabase, пользователь перенаправляется на /app.
- Неизвестные маршруты также переводятся в DashboardApp.

Поток в DashboardApp:
- Проверка сессии и подтверждения почты.
- Определение типа аккаунта через таблицы profiles, fleets, drivers.
- Выбор стартовой страницы: signin, company-info, content, fleet-content, drivers-download и т.д.

## 3. Роли пользователей

- Advertiser (рекламодатель): работает в CRM-контуре Content.
- Fleet owner (владелец автопарка): работает в Fleet-контуре.
- Driver (водитель): отдельный поток с подсказкой по установке приложения.

## 4. Основные модули

### 4.1 Лендинг

- Отрисовывается через iframe на /landing/index.html.
- Содержит маркетинговые секции, contact форму и форму запроса Fleet-регистрации.
- Кнопки Login/Get Started ведут в /app.

### 4.2 CRM рекламодателя (Content)

Разделы:
- Overview: сводка по кампаниям, активным водителям, прогрессу и дистанции.
- Campaign Builder: создание кампаний, расчет бюджета, загрузка документа, создание invoice и аналитики.
- Live Map: active zone + маркеры водителей с обновлением из БД.
- Analytics: таблицы и графики.
- Contacts, Billing, Settings.

### 4.3 Fleet кабинет

Разделы:
- Signup: регистрация автопарка, включая OTP/обычный поток.
- Dashboard: автомобили, водители, контракты, доходы.
- Contracts: доступные/мои/завершенные контракты.
- Billing: банковские реквизиты, вывод средств, история транзакций.
- Profile.

Дополнительно:
- 2FA Gate для fleet-аккаунтов через Supabase MFA.

### 4.4 Карта (Mapbox)

Функциональность:
- Active zone приходит из active_zone и рисуется как Polygon.
- Водители берутся из driver_location_updates (latitude/longitude), с fallback логикой.
- Фото авто для карточки водителя подгружаются из vehicles.left_img/right_img по vehicles.signeddriveremail.
- Поддерживается Realtime-подписка на изменения водителей/кампаний/локаций.
- Камера карты центрируется по active zone.

## 5. Интеграция с Supabase

В проекте используется единый слой сервисов в src/data/service.js:

- Auth: signIn, signUp, signOut, reset password, session, onAuthStateChange
- MFA: enroll/challenge/verify/list factors
- Profiles/Fleets/Drivers/Vehicles/Campaigns/Invoices/Transfers/BankData/Analytics
- Storage: загрузка документов
- Realtime: подписки на postgres_changes

Используемые сущности БД (основные):
- profiles
- campaigns
- drivers
- fleets
- vehicles
- fleet_signed_contracts
- driver_location_updates
- invoices
- transfers
- bankdata
- analitics
- active_zone

## 6. Переменные окружения

Создайте файл .env в корне проекта:

```env
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
REACT_APP_MAPBOX_ACCESS_TOKEN=
REACT_APP_MAPBOX_STYLE_URL_DARK=
REACT_APP_MAPBOX_STYLE_URL_LITE=
```

Примечание:
- Без Supabase URL/KEY авторизация и запросы к БД работать не будут.
- Без Mapbox токена/стилей раздел Live Map не отобразится корректно.

Для contact формы задайте секреты Supabase Edge Function:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=...
supabase functions deploy contact-form --no-verify-jwt
```

Форма отправляет POST-запрос в `contact-form`, а Telegram credentials не попадают в браузер.

## 7. Локальный запуск

1. Установить зависимости:

```bash
npm install
```

2. Запустить проект:

```bash
npm start
```

3. Production-сборка:

```bash
npm run build
```

4. Тесты:

```bash
npm test
```

## 8. Деплой

Vercel конфигурация:
- buildCommand: npm run build
- outputDirectory: build
- rewrites:
	- /landing/(.*) -> /landing/$1
	- /(.*) -> /index.html

Это нужно для корректной работы SPA-роутинга и лендинга.

## 9. Структура проекта (кратко)

- src/App.js: верхнеуровневая маршрутизация
- src/DashboardApp.js: логика страницы /app и auth-flow
- src/Pages/Landing: контейнер лендинга
- src/Pages/Content: CRM рекламодателя
- src/Pages/Fleet: кабинет владельца автопарка
- src/Components/MapBox.js: live-карта
- src/data/service.js: API-слой Supabase
- src/data/supabase.js: клиент Supabase
- public/landing: статический лендинг
- supabase/functions: директория под Edge Functions

## 10. Ограничения и важные заметки

- Contact форма отправляется через `supabase/functions/contact-form`.
- Для production рекомендуется вынести все чувствительные ключи из клиентского кода лендинга в backend/edge слой.
- Некоторые финансовые сценарии имеют мок-или частично интегрированную логику и требуют финализации под реальный процессинг.

## 11. Команды npm

```json
{
	"start": "react-scripts start",
	"build": "react-scripts build",
	"test": "react-scripts test",
	"eject": "react-scripts eject"
}
```

## Architecture and delivery review

See [docs/review/README.md](docs/review/README.md) for the GitHub-based architecture/IT PM assessment, MAVI matrix, SWOT, fishbone, diagrams, risk analysis, release gates and Jira traceability.

