# 📱 Руководство по адаптивному дизайну

## Обзор изменений

Приложение полностью адаптировано под все размеры экранов: от мобильных телефонов (360px) до больших мониторов.

### 🎯 Основные точки останова (Breakpoints)

```
- 📺 Desktop:    1024px и выше
- 📱 Tablet:     768px - 1024px  
- 📱 Mobile:     480px - 768px
- 📱 Small Mobile: 360px - 480px
```

---

## ✨ Ключевые улучшения

### 1. **Боковое меню (Sidebar)**
- **На ПК:** Фиксированное слева (25em ширины)
- **На планшете:** 20em ширины
- **На телефоне:** Скрывается с левого края, открывается по кнопке меню
- ✅ Кнопка меню (☰) появляется на 768px и ниже
- ✅ Закрытие меню при клике вне его
- ✅ Закрытие меню при выборе пункта

```javascript
// Мобильное меню автоматически управляется в компоненте SideBar
<button className="sidebar__mobile-toggle">
  {isMobileOpen ? <MdClose /> : <MdMenu />}
</button>
```

### 2. **Формы (Sign Up / Sign In)**
- **На ПК:** Две колонки (50% каждая)
- **На планшете:** Две колонки с уменьшенным padding
- **На телефоне:** Полнота ширина (стекуется вертикально)
- ✅ Адаптивные отступы через `clamp()`
- ✅ Масштабируемые шрифты через `clamp()`

```css
/* Пример адаптивного padding */
padding: clamp(1.5em, 3vw, 8em);

/* Пример адаптивного font-size */
font-size: clamp(1.8em, 5vw, 6em);
```

### 3. **Таблицы**
- **На ПК:** Обычный вид таблицы
- **На планшете:** Горизонтальный скролл
- **На телефоне:** Карточный вид с labels слева
  - Каждый столбец становится отдельной строкой
  - Автоматически добавляются названия столбцов

```jsx
// Добавьте data-label для каждого <td>
<td data-label="Название">{item.name}</td>
<td data-label="Город">{item.city}</td>
```

### 4. **Сетки (Grid)**
- **На ПК:** 4 колонки в Overview блоках
- **На планшете:** 2 колонки
- **На телефоне:** 1 колонка (полная ширина)

```css
@media (max-width: 1024px) {
  .overview__content_blocks--block {
    width: calc(50% - 1em);
  }
}

@media (max-width: 768px) {
  .overview__content_blocks--block {
    width: 100%;
  }
}
```

### 5. **Шрифты и размеры текста**
- ✅ Используется `clamp()` для автоматического масштабирования
- ✅ Все отступы масштабируются в зависимости от размера экрана
- ✅ Кнопки и элементы управления увеличиваются на мобильных

```css
/* Заголовок масштабируется от 2.5em до 6em */
font-size: clamp(2.5em, 5vw, 6em);
```

---

## 🔧 Как добавить новые адаптивные стили

### Методика 1: Использование `clamp()`
```css
.element {
  /* Масштабируется между минимумом (2em) и максимумом (6em) */
  font-size: clamp(2em, 4vw, 6em);
  
  /* Padding масштабируется между 1em и 3em */
  padding: clamp(1em, 2vw, 3em);
}
```

### Методика 2: Media Queries
```css
/* Основные стили для ПК */
.element {
  width: 100%;
  padding: 2em;
}

/* Планшет */
@media (max-width: 1024px) {
  .element {
    padding: 1.5em;
  }
}

/* Мобильный */
@media (max-width: 768px) {
  .element {
    padding: 1em;
  }
}
```

### Методика 3: Flexbox (рекомендуется)
```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
}

.item {
  flex: 1 1 calc(25% - 1em);
}

@media (max-width: 1024px) {
  .item {
    flex: 1 1 calc(50% - 1em);
  }
}

@media (max-width: 768px) {
  .item {
    flex: 1 1 100%;
  }
}
```

---

## 📋 Чек-лист для новых компонентов

При создании новых компонентов убедитесь, что:

- [ ] ✅ Не используются жесткие ширины (`width: 500px`)
- [ ] ✅ Используется `max-width` вместо `width`
- [ ] ✅ Используются относительные единицы (`em`, `%`, `vw`)
- [ ] ✅ Flex или Grid используются для layouts
- [ ] ✅ Добавлены media queries для всех экранов
- [ ] ✅ Кнопки и ссылки имеют минимум 44x44px на мобильных
- [ ] ✅ Шрифты масштабируются с экраном
- [ ] ✅ Таблицы имеют `data-label` атрибуты
- [ ] ✅ Тестировано на реальных мобильных устройствах

---

## 📊 Примеры адаптивных компонентов

### Адаптивное меню
```jsx
// ✅ Правильно
<button 
  className="sidebar__mobile-toggle"
  onClick={() => setIsMobileOpen(!isMobileOpen)}
>
  {isMobileOpen ? <MdClose /> : <MdMenu />}
</button>

{isMobileOpen && window.innerWidth <= 768 && (
  <div className="sidebar__overlay" />
)}
```

### Адаптивная таблица
```jsx
<table className="campaigns__table">
  <thead>
    <tr>
      <th>Название</th>
      <th>Город</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-label="Название">{item.name}</td>
      <td data-label="Город">{item.city}</td>
    </tr>
  </tbody>
</table>
```

### Адаптивная сетка
```jsx
// Используйте className для управления стилями
<div className="overview__content_blocks">
  {/* Каждый блок автоматически масштабируется с помощью CSS */}
  <div className="overview__content_blocks--block">
    {/* Содержимое */}
  </div>
</div>
```

---

## 🧪 Тестирование адаптивности

### Инструменты для тестирования
1. **Chrome DevTools** - Press `F12`
   - Нажмите `Ctrl+Shift+M` для режима мобильного
   - Выберите нужное устройство или размер экрана

2. **Responsive Design Mode**
   - Firefox DevTools: `Ctrl+Shift+M`
   - Safari: Develop → Enter Responsive Design Mode

3. **Реальные устройства**
   - Протестируйте на реальном телефоне
   - Проверьте ориентацию портрета и пейзажа

### Размеры для тестирования
```
iPhone 12: 390 × 844
iPhone 14 Pro: 393 × 852
Samsung Galaxy S21: 360 × 800
iPad Air: 820 × 1180
iPad Pro: 1024 × 1366
Desktop: 1440 × 900
```

---

## 🐛 Часто встречаемые проблемы и решения

### Проблема: Боковое меню перекрывает содержимое на мобильных
**Решение:** Убедитесь, что используется оверлей позади меню
```css
.sidebar__overlay {
  z-index: 999; /* Ниже, чем sidebar (1000) */
}
```

### Проблема: Текст слишком маленький на телефонах
**Решение:** Используйте `clamp()` или увеличьте минимум
```css
font-size: clamp(1.2em, 3vw, 2em); /* Минимум 1.2em */
```

### Проблема: Таблица не сужается на мобильных
**Решение:** Добавьте `data-label` и используйте CSS для карточного вида
```css
@media (max-width: 768px) {
  table tbody tr td::before {
    content: attr(data-label);
  }
}
```

### Проблема: Изображения не масштабируются
**Решение:** Используйте `max-width: 100%`
```css
img {
  max-width: 100%;
  height: auto;
}
```

---

## 📚 Дополнительные ресурсы

- 📖 [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- 📖 [CSS Tricks: A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- 📖 [CSS `clamp()` Function](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- 📖 [Mobile First Design](https://www.mobileapproach.com/p/mobile-first-design-process)

---

## 🎓 Краткая справка

### Основные классы для адаптивности

| Класс | Когда использовать |
|-------|------------------|
| `.sidebar` | Боковое меню |
| `.sidebar__mobile-toggle` | Кнопка меню на мобильных |
| `.content` | Основной контент |
| `.overview__content_blocks` | Сетка блоков |
| `.campaigns__table` | Таблицы |
| `@media (max-width: 1024px)` | Планшеты |
| `@media (max-width: 768px)` | Мобильные |
| `@media (max-width: 480px)` | Маленькие телефоны |

---

**Помните:** Адаптивный дизайн - это не просто масштабирование контента, а переосмысление и переорганизация interface для каждого устройства! 🎨📱💻

---

*Последнее обновление: 24 апреля 2026*
