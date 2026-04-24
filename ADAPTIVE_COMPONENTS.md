# 🚀 Примеры адаптивных компонентов

Этот файл содержит готовые примеры для создания адаптивных компонентов в React + CSS.

## 1. Адаптивное меню (Navigation)

### React компонент
```jsx
import { useState } from 'react';
import { MdMenu, MdClose } from 'react-icons/md';

function AdaptiveMenu({ items }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="adaptive-menu">
      <button 
        className="menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Переключить меню"
      >
        {isOpen ? <MdClose /> : <MdMenu />}
      </button>

      {isOpen && window.innerWidth <= 768 && (
        <div 
          className="menu-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`menu ${isOpen ? 'menu--open' : ''}`}>
        {items.map(item => (
          <a 
            key={item.id} 
            href={item.href}
            onClick={() => window.innerWidth <= 768 && setIsOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

export default AdaptiveMenu;
```

### CSS стили
```css
.adaptive-menu {
  position: relative;
}

.menu-toggle {
  display: none;
  background: var(--block-bg);
  border: 1px solid var(--input-border);
  border-radius: 0.5em;
  padding: 0.5em;
  cursor: pointer;
  font-size: 1.5em;
  color: var(--primary-color);
}

.menu {
  display: flex;
  gap: 1em;
}

.menu-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .menu-overlay {
    display: block;
  }

  .menu {
    position: fixed;
    left: -100%;
    top: 0;
    width: 80%;
    height: 100vh;
    flex-direction: column;
    background: var(--block-bg);
    transition: left 0.3s ease;
    z-index: 1000;
  }

  .menu--open {
    left: 0;
  }
}
```

---

## 2. Адаптивная таблица

### React компонент
```jsx
function AdaptiveTable({ data, columns }) {
  return (
    <div className="table-wrapper">
      <table className="adaptive-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.id}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              {columns.map(col => (
                <td 
                  key={`${row.id}-${col.id}`}
                  data-label={col.label}
                >
                  {row[col.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdaptiveTable;
```

### CSS стили
```css
.table-wrapper {
  overflow-x: auto;
}

.adaptive-table {
  width: 100%;
  border-collapse: collapse;
}

.adaptive-table thead {
  background-color: var(--input-border);
}

.adaptive-table th,
.adaptive-table td {
  padding: 1em;
  text-align: left;
  border-bottom: 1px solid var(--input-border);
}

/* Мобильная версия */
@media (max-width: 768px) {
  .adaptive-table thead {
    display: none;
  }

  .adaptive-table tbody tr {
    display: grid;
    grid-template-columns: 1fr;
    margin-bottom: 1.5em;
    background: var(--block-bg);
    border-radius: 0.8em;
    overflow: hidden;
  }

  .adaptive-table tbody tr td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1em;
    border: none;
    border-bottom: 1px solid var(--input-border);
  }

  .adaptive-table tbody tr td:last-child {
    border-bottom: none;
  }

  .adaptive-table tbody tr td::before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: 1em;
    min-width: 100px;
  }
}
```

---

## 3. Адаптивная форма

### React компонент
```jsx
import { useState } from 'react';

function AdaptiveForm({ fields, onSubmit }) {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className="adaptive-form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      {fields.map(field => (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name}>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              placeholder={field.placeholder}
            />
          ) : (
            <input
              id={field.name}
              type={field.type}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}
      <button type="submit" className="adaptive-form__submit">
        Отправить
      </button>
    </form>
  );
}

export default AdaptiveForm;
```

### CSS стили
```css
.adaptive-form {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 1.4em;
  color: var(--lables);
  margin-bottom: 0.5em;
  font-family: 'LufgaMedium', sans-serif;
}

.form-group input,
.form-group textarea {
  background-color: transparent;
  border: 1px solid var(--input-border);
  border-radius: 1em;
  padding: clamp(0.75em, 2vw, 1em);
  font-size: clamp(1.2em, 2vw, 1.6em);
  color: var(--text-color);
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--primary-color);
  outline: none;
}

.adaptive-form__submit {
  background-color: var(--primary-color);
  color: var(--background-color);
  border: none;
  border-radius: 5em;
  padding: clamp(0.5em, 2vw, 1em);
  font-size: clamp(1.2em, 2vw, 1.8em);
  font-family: 'LufgaBold', sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-height: 44px; /* Минимум для мобильных */
}

.adaptive-form__submit:hover {
  background-color: var(--primary-color-hover);
}

@media (max-width: 768px) {
  .adaptive-form {
    gap: 1em;
  }

  .form-group label {
    font-size: clamp(1.2em, 3vw, 1.4em);
  }
}
```

---

## 4. Адаптивная карточка

### React компонент
```jsx
function AdaptiveCard({ 
  title, 
  description, 
  icon, 
  onClick,
  highlighted = false 
}) {
  return (
    <div 
      className={`adaptive-card ${highlighted ? 'adaptive-card--highlighted' : ''}`}
      onClick={onClick}
    >
      {icon && <div className="card-icon">{icon}</div>}
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </div>
  );
}

export default AdaptiveCard;
```

### CSS стили
```css
.adaptive-card {
  padding: clamp(1em, 2vw, 2em);
  border-radius: 1.2em;
  border: 1px solid var(--input-border);
  background-color: var(--block-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.adaptive-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-4px);
}

.card-icon {
  font-size: clamp(2em, 5vw, 3em);
  margin-bottom: 0.5em;
  color: var(--primary-color);
}

.card-title {
  font-size: clamp(1.4em, 3vw, 1.8em);
  font-family: 'LufgaBold', sans-serif;
  margin-bottom: 0.5em;
}

.card-description {
  font-size: clamp(1em, 2vw, 1.4em);
  color: var(--sign-secondary-color);
  flex-grow: 1;
}

.adaptive-card--highlighted {
  border-color: var(--primary-color);
  background-color: var(--primary-color-light);
}

@media (max-width: 768px) {
  .adaptive-card {
    width: 100%;
  }
}
```

---

## 5. Адаптивная сетка

### React компонент
```jsx
function AdaptiveGrid({ items, columns = 4 }) {
  return (
    <div 
      className="adaptive-grid"
      style={{
        '--columns': columns,
      }}
    >
      {items.map(item => (
        <div key={item.id} className="grid-item">
          {item.content}
        </div>
      ))}
    </div>
  );
}

export default AdaptiveGrid;
```

### CSS стили
```css
.adaptive-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns, 4), 1fr);
  gap: clamp(1em, 2vw, 2em);
  width: 100%;
}

.grid-item {
  min-width: 0; /* Важно для overflow */
}

@media (max-width: 1024px) {
  .adaptive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .adaptive-grid {
    grid-template-columns: 1fr;
    gap: 1em;
  }
}
```

---

## 6. Адаптивный контейнер

### CSS стили
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: clamp(1em, 2vw, 2em);
  max-width: 1200px;
}

.container--small {
  max-width: 600px;
}

.container--large {
  max-width: 1400px;
}

@media (max-width: 1024px) {
  .container {
    padding: clamp(0.75em, 2vw, 1.5em);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1em;
  }
}
```

---

## 7. Адаптивный Flex Layout

### CSS стили
```css
/* Базовый flex */
.flex {
  display: flex;
  gap: clamp(1em, 2vw, 2em);
}

.flex--column {
  flex-direction: column;
}

.flex--center {
  justify-content: center;
  align-items: center;
}

.flex--space-between {
  justify-content: space-between;
  align-items: center;
}

.flex--wrap {
  flex-wrap: wrap;
}

/* На мобильных */
@media (max-width: 768px) {
  .flex--column-mobile {
    flex-direction: column;
  }

  .flex--center-mobile {
    justify-content: center;
    align-items: center;
  }
}
```

---

## 8. Адаптивный текст

### CSS стили
```css
/* Заголовки */
.heading-1 {
  font-size: clamp(2.5em, 6vw, 4em);
  line-height: 1.2;
}

.heading-2 {
  font-size: clamp(1.8em, 5vw, 2.5em);
  line-height: 1.3;
}

.heading-3 {
  font-size: clamp(1.4em, 4vw, 1.8em);
  line-height: 1.4;
}

/* Основной текст */
.body-text {
  font-size: clamp(1em, 2vw, 1.6em);
  line-height: 1.6;
}

.body-text--small {
  font-size: clamp(0.9em, 1.5vw, 1.2em);
}

/* Мобильное оптимизация */
@media (max-width: 768px) {
  .heading-1,
  .heading-2,
  .heading-3 {
    margin-bottom: 1em;
  }

  .body-text {
    margin-bottom: 0.75em;
  }
}
```

---

## 9. Адаптивные кнопки

### React компонент
```jsx
function AdaptiveButton({ 
  children, 
  size = 'medium', 
  variant = 'primary',
  fullWidth = false,
  onClick,
  ...props 
}) {
  return (
    <button
      className={`btn btn--${size} btn--${variant} ${fullWidth ? 'btn--full-width' : ''}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default AdaptiveButton;
```

### CSS стили
```css
.btn {
  border: none;
  border-radius: 5em;
  font-family: 'LufgaBold', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px; /* Минимум для мобильных */
  min-width: 44px;
}

/* Размеры */
.btn--small {
  padding: clamp(0.3em, 1vw, 0.5em) clamp(0.8em, 2vw, 1.2em);
  font-size: clamp(1em, 1.5vw, 1.2em);
}

.btn--medium {
  padding: clamp(0.5em, 1.5vw, 0.7em) clamp(1em, 2.5vw, 2em);
  font-size: clamp(1.2em, 2vw, 1.6em);
}

.btn--large {
  padding: clamp(0.7em, 2vw, 1em) clamp(1.5em, 3vw, 2.5em);
  font-size: clamp(1.4em, 2.5vw, 1.8em);
}

/* Варианты */
.btn--primary {
  background-color: var(--primary-color);
  color: var(--background-color);
}

.btn--primary:hover {
  background-color: var(--primary-color-hover);
}

.btn--secondary {
  background-color: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.btn--secondary:hover {
  background-color: var(--primary-color-light);
}

/* Полная ширина */
.btn--full-width {
  width: 100%;
}

@media (max-width: 768px) {
  .btn {
    width: 100%;
  }
}
```

---

## 🎓 Быстрые советы

1. **Всегда используйте `clamp()`** для масштабируемого шрифта и отступов
2. **Мобильное меню на 768px и ниже** - стандартная точка останова
3. **Добавляйте `data-label`** к таблицам для мобильных версий
4. **Минимум 44x44px** для всех интерактивных элементов
5. **Тестируйте на реальных устройствах** перед релизом

---

*Используйте эти примеры как шаблоны для своих адаптивных компонентов!* 🚀
