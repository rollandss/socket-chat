# Socket Chat 💬

Це веб-додаток для чату в реальному часі, створений з використанням Next.js та Socket.IO.

## Особливості ✨

- 🔄 **Чат в реальному часі** - миттєвий обмін повідомленнями
- 👥 **Список активних користувачів** - бачте, хто зараз онлайн
- ✍️ **Індикатор набору** - коли хтось друкує повідомлення
- 📱 **Адаптивний дизайн** - працює на всіх пристроях
- 🎨 **Сучасний UI** - використовує Tailwind CSS
- 🔔 **Системні повідомлення** - сповіщення про входи та виходи користувачів

## Технології 🛠️

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.IO
- **Real-time Communication**: WebSockets

## Встановлення та запуск 🚀

1. **Клонуйте репозиторій**:

   ```bash
   git clone <your-repo-url>
   cd socket-chat
   ```

2. **Встановіть залежності**:

   ```bash
   npm install
   ```

3. **Запустіть додаток**:

   ```bash
   npm run dev
   ```

4. **Відкрийте браузер** та перейдіть на `http://localhost:3000`

## Як користуватися 📖

1. Введіть ваше ім'я на сторінці входу
2. Натисніть "Приєднатися до чату"
3. Почніть спілкуватися з іншими користувачами!

## Структура проєкту 📁

```
socket-chat/
├── app/
│   ├── components/
│   │   └── ChatRoom.tsx    # Основний компонент чату
│   ├── globals.css         # Глобальні стилі
│   ├── layout.tsx          # Макет додатку
│   └── page.tsx           # Головна сторінка
├── server.js              # Socket.IO сервер
├── package.json
└── README.md
```

## API подій Socket.IO 🔌

### Клієнт → Сервер

- `join-chat` - приєднання до чату з ім'ям користувача
- `send-message` - відправка повідомлення
- `typing-start` - початок набору повідомлення
- `typing-stop` - кінець набору повідомлення

### Сервер → Клієнт

- `new-message` - нове повідомлення
- `user-joined` - новий користувач приєднався
- `user-left` - користувач покинув чат
- `active-users` - список активних користувачів
- `user-typing` - хтось набирає повідомлення

## Розробка 🔧

Для розробки використовуйте:

```bash
npm run dev    # Запуск в режимі розробки
npm run build  # Збірка для продакшену
npm run start  # Запуск збудованого додатку
```

## Деплой 🚀

### Railway (Рекомендовано) ⭐

1. **Встановіть Railway CLI**:

   ```bash
   npm install -g @railway/cli
   ```

2. **Увійдіть та ініціалізуйте**:

   ```bash
   railway login
   railway init
   ```

3. **Задеплойте**:
   ```bash
   railway up
   ```

Примітка: Railway (Nixpacks) за замовчуванням може не встановлювати `devDependencies` під час збірки. Якщо у вас виникають помилки на кшталт `Cannot find module '@tailwindcss/postcss'`, то є два шляхи вирішення:

- У `railway.toml` додайте змінну середовища `NPM_CONFIG_PRODUCTION = "false"` (це вже зроблено у цьому репо). Це дозволить встановлювати devDependencies під час build.
- Або перемістіть `@tailwindcss/postcss` з `devDependencies` у `dependencies` у `package.json`, щоб він був доступний під час production build.

### Render 🌟

1. Підключіть GitHub репозиторій до [render.com](https://render.com)
2. Створіть новий Web Service
3. Налаштування автоматично підтягнуться з `render.yaml`

### Heroku 💎

1. **Встановіть Heroku CLI** та увійдіть
2. **Створіть додаток**:
   ```bash
   heroku create your-chat-app-name
   ```
3. **Задеплойте**:
   ```bash
   git push heroku main
   ```

### DigitalOcean App Platform 🌊

1. Підключіть репозиторій до DigitalOcean App Platform
2. Використайте ці налаштування:
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`

### Docker 🐳

```bash
# Створіть образ
docker build -t socket-chat .

# Запустіть контейнер
docker run -p 3000:3000 socket-chat
```

## Змінні середовища 🔧

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
FRONTEND_URL=https://your-domain.com
```

## Ліцензія 📝

MIT License
