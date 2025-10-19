'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

interface UserActivity {
  username: string;
  message: string;
  timestamp: string;
}

interface TypingUser {
  username: string;
  isTyping: boolean;
}

export default function ChatRoom() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Підключаємося до сокет-сервера
    const newSocket = io();
    setSocket(newSocket);

    // Слухачі подій
    newSocket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('user-joined', (activity: UserActivity) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          username: 'Система',
          message: activity.message,
          timestamp: activity.timestamp,
        },
      ]);
    });

    newSocket.on('user-left', (activity: UserActivity) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          username: 'Система',
          message: activity.message,
          timestamp: activity.timestamp,
        },
      ]);
    });

    newSocket.on('active-users', (users: string[]) => {
      setActiveUsers(users);
    });

    newSocket.on('user-typing', (data: TypingUser) => {
      setTypingUsers((prev) => {
        if (data.isTyping) {
          return prev.includes(data.username) ? prev : [...prev, data.username];
        } else {
          return prev.filter((user) => user !== data.username);
        }
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // Автоматичне прокручування до останнього повідомлення
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && socket) {
      socket.emit('join-chat', username.trim());
      setIsJoined(true);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('send-message', { message: newMessage.trim() });
      setNewMessage('');

      // Зупиняємо індикатор набору
      if (isTyping) {
        socket.emit('typing-stop');
        setIsTyping(false);
      }
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!socket) return;

    if (value.trim() && !isTyping) {
      socket.emit('typing-start');
      setIsTyping(true);
    }

    // Скидаємо таймер
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Встановлюємо новий таймер
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        socket.emit('typing-stop');
        setIsTyping(false);
      }
    }, 1000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isJoined) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-xl p-8 w-full max-w-md'>
          <div className='text-center mb-6'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              💬 Socket Chat
            </h1>
            <p className='text-gray-600'>
              Введіть ваше ім&#39;я для входу в чат
            </p>
          </div>

          <form onSubmit={joinChat} className='space-y-4'>
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Ім&#39;я користувача
              </label>
              <input
                type='text'
                id='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors'
                placeholder='Введіть ваше ім&#39;я...'
                required
                minLength={2}
                maxLength={20}
              />
            </div>

            <button
              type='submit'
              className='w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium'
            >
              Приєднатися до чату
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-2rem)]'>
        {/* Бічна панель з активними користувачами */}
        <div className='lg:col-span-1 bg-white rounded-lg shadow-xl p-4 lg:order-1 order-2'>
          <h3 className='font-bold text-gray-800 mb-4 flex items-center'>
            <span className='w-3 h-3 bg-green-500 rounded-full mr-2'></span>
            Активні користувачі ({activeUsers.length})
          </h3>

          <div className='space-y-2'>
            {activeUsers.map((user, index) => (
              <div
                key={index}
                className='flex items-center p-2 bg-gray-50 rounded-lg'
              >
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2'>
                  {user.charAt(0).toUpperCase()}
                </div>
                <span className='text-sm text-gray-700'>{user}</span>
                {user === username && (
                  <span className='ml-auto text-xs text-blue-600 font-medium'>
                    (Ви)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Основна область чату */}
        <div className='lg:col-span-3 bg-white rounded-lg shadow-xl flex flex-col lg:order-2 order-1'>
          {/* Заголовок чату */}
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-bold text-gray-800'>Socket Chat</h2>
                <p className='text-sm text-gray-600'>
                  Ласкаво просимо, {username}!
                </p>
              </div>
              <div className='text-right'>
                <div className='text-sm text-gray-500'>
                  {activeUsers.length}{' '}
                  {activeUsers.length === 1 ? 'користувач' : 'користувачів'}{' '}
                  онлайн
                </div>
              </div>
            </div>
          </div>

          {/* Область повідомлень */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.username === username
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.username === username
                      ? 'bg-blue-600 text-white'
                      : message.username === 'Система'
                      ? 'bg-gray-200 text-gray-700 text-center italic'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.username !== username &&
                    message.username !== 'Система' && (
                      <div className='text-xs font-medium mb-1 text-gray-600'>
                        {message.username}
                      </div>
                    )}
                  <div className='break-words'>{message.message}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.username === username
                        ? 'text-blue-200'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Індикатор набору */}
            {typingUsers.length > 0 && (
              <div className='flex justify-start'>
                <div className='bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm italic'>
                  {typingUsers.join(', ')}{' '}
                  {typingUsers.length === 1 ? 'набирає' : 'набирають'}...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Форма відправки повідомлення */}
          <div className='p-4 border-t border-gray-200'>
            <form onSubmit={sendMessage} className='flex space-x-2'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors'
                placeholder='Введіть повідомлення...'
                maxLength={500}
              />
              <button
                type='submit'
                disabled={!newMessage.trim()}
                className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Відправити
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
