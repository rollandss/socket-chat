FROM node:18-alpine

WORKDIR /app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо всі залежності (включно з dev) щоб мати доступ до плагінів під час build
RUN npm ci

# Копіюємо решту коду
COPY . .

# Будуємо додаток
RUN npm run build

# Видаляємо devDependencies для зменшення розміру образу
RUN npm prune --production

# Відкриваємо порт
EXPOSE 3000

# Змінна середовища для продакшену
ENV NODE_ENV=production

# Запускаємо додаток
CMD ["npm", "start"]