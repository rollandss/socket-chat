const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

// Підготовка Next.js додатку
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL || false
          : '*',
      methods: ['GET', 'POST'],
    },
  });

  // Зберігаємо активні з'єднання
  const users = new Map();

  io.on('connection', (socket) => {
    console.log('Користувач підключився:', socket.id);

    // Обробка приєднання користувача до чату
    socket.on('join-chat', (username) => {
      users.set(socket.id, username);
      socket.username = username;

      // Повідомляємо всім про нового користувача
      socket.broadcast.emit('user-joined', {
        username,
        message: `${username} приєднався до чату`,
        timestamp: new Date().toISOString(),
      });

      // Відправляємо список активних користувачів
      const activeUsers = Array.from(users.values());
      io.emit('active-users', activeUsers);
    });

    // Обробка повідомлень
    socket.on('send-message', (data) => {
      const messageData = {
        id: Date.now(),
        username: socket.username || 'Анонім',
        message: data.message,
        timestamp: new Date().toISOString(),
      };

      // Відправляємо повідомлення всім користувачам
      io.emit('new-message', messageData);
    });

    // Обробка набору тексту
    socket.on('typing-start', () => {
      socket.broadcast.emit('user-typing', {
        username: socket.username,
        isTyping: true,
      });
    });

    socket.on('typing-stop', () => {
      socket.broadcast.emit('user-typing', {
        username: socket.username,
        isTyping: false,
      });
    });

    // Обробка відключення
    socket.on('disconnect', () => {
      console.log('Користувач відключився:', socket.id);

      if (socket.username) {
        users.delete(socket.id);

        // Повідомляємо про відключення
        socket.broadcast.emit('user-left', {
          username: socket.username,
          message: `${socket.username} покинув чат`,
          timestamp: new Date().toISOString(),
        });

        // Оновлюємо список активних користувачів
        const activeUsers = Array.from(users.values());
        io.emit('active-users', activeUsers);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `Сервер запущено на ${
          dev ? `http://${hostname}:${port}` : `порт ${port}`
        }`
      );
    });
});
