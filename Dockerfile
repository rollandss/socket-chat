FROM node:18-alpine

WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm ci --only=production

# Копіюємо решту коду
COPY . .

# Будуємо додаток
RUN npm run build

# Відкриваємо порт
EXPOSE 3000

# Змінна середовища для продакшену
ENV NODE_ENV=production

# Запускаємо додаток
CMD ["npm", "start"]