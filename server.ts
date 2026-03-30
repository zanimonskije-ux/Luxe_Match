import express from "express";
import { createServer as createViteServer } from "vite";
import TelegramBot from "node-telegram-bot-api";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.TELEGRAM_BOT_TOKEN;
const devUrl = process.env.APP_URL;

if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN is not set. Bot features will be disabled.");
}

// Simple in-memory database (replaces localStorage/Firebase for the bot)
interface UserProfile {
  id: number;
  name: string;
  username?: string;
  age: number;
  bio: string;
  city?: string;
  location?: { lat: number; lon: number };
  photo?: string;
  likes: number[];
  dislikes: number[];
  matches: number[];
  state: 'idle' | 'naming' | 'aging' | 'bioing' | 'citying' | 'photoing' | 'searching';
  currentSearchIndex?: number;
}

const usersFile = path.join(process.cwd(), 'database.json');
let users: Record<number, UserProfile> = {};

if (fs.existsSync(usersFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    // Convert string keys back to numbers if necessary, though JS handles this mostly fine
    users = data;
    console.log(`Loaded ${Object.keys(users).length} users from database.`);
  } catch (e) {
    console.error("Failed to load database:", e);
    users = {};
  }
}

function saveUsers() {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const bot = token ? new TelegramBot(token, { polling: true }) : null;

if (bot) {
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const user = users[chatId] || { 
      id: chatId, 
      name: '', 
      username: msg.from?.username,
      age: 0, 
      bio: '', 
      likes: [], 
      dislikes: [], 
      matches: [], 
      state: 'idle' 
    };
    if (msg.from?.username) user.username = msg.from.username;
    users[chatId] = user;
    saveUsers();

    if (text === '/start') {
      if (user.name) {
        bot.sendMessage(chatId, `С возвращением в *Luxe Match Bot*, ${user.name}!`, { parse_mode: 'Markdown' });
        showMainMenu(chatId);
      } else {
        user.state = 'naming';
        saveUsers();
        bot.sendMessage(chatId, "👋 *Добро пожаловать в Luxe Match Bot!*\n\nДавайте создадим вашу анкету. Как вас зовут?", { parse_mode: 'Markdown' });
      }
      return;
    }

    // Registration Flow
    if (user.state === 'naming') {
      user.name = text || '';
      user.state = 'aging';
      saveUsers();
      bot.sendMessage(chatId, `Приятно познакомиться, ${user.name}! Сколько вам лет?`);
      return;
    }

    if (user.state === 'aging') {
      const age = parseInt(text || '0');
      if (isNaN(age) || age < 18 || age > 99) {
        bot.sendMessage(chatId, "Пожалуйста, введите корректный возраст (число от 18 до 99).");
        return;
      }
      user.age = age;
      user.state = 'bioing';
      saveUsers();
      bot.sendMessage(chatId, "Расскажите немного о себе (ваше хобби, интересы или что вы ищете):");
      return;
    }

    if (user.state === 'bioing') {
      user.bio = text || '';
      user.state = 'citying';
      saveUsers();
      bot.sendMessage(chatId, "В каком городе вы живете? Вы можете ввести название вручную или отправить свою геолокацию кнопкой ниже:", {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Отправить геолокацию', request_location: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
      return;
    }

    if (user.state === 'citying') {
      if (msg.location) {
        user.location = { lat: msg.location.latitude, lon: msg.location.longitude };
        // We don't have reverse geocoding, so we'll just mark it as "Геолокация" or ask for city name still
        bot.sendMessage(chatId, "📍 Геолокация получена! Но для поиска по названию, пожалуйста, напишите также название вашего города текстом:");
        return;
      }
      if (text) {
        user.city = text;
        user.state = 'photoing';
        saveUsers();
        bot.sendMessage(chatId, "Отлично! Теперь отправьте ваше лучшее фото для анкеты:", {
          reply_markup: { remove_keyboard: true }
        });
      }
      return;
    }

    if (user.state === 'photoing' && msg.photo) {
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      user.photo = photoId;
      user.state = 'idle';
      saveUsers();
      bot.sendMessage(chatId, "✅ Анкета создана! Теперь вы можете искать пару.");
      showMainMenu(chatId);
      return;
    }

    // Commands handling
    if (text === '🔍 Искать') {
      user.state = 'searching';
      saveUsers();
      showNextProfile(chatId);
    } else if (text === '👤 Моя анкета') {
      showMyProfile(chatId);
    } else if (text === '❤️ Пары') {
      showMatches(chatId);
    }
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message?.chat.id;
    if (!chatId) return;
    const user = users[chatId];
    const data = query.data;

    if (data?.startsWith('like_')) {
      const targetId = parseInt(data.split('_')[1]);
      user.likes.push(targetId);
      
      // Check for match
      if (users[targetId]?.likes.includes(chatId)) {
        const target = users[targetId];
        user.matches.push(targetId);
        target.matches.push(chatId);
        
        const userLink = user.username ? `@${user.username}` : `[${user.name}](tg://user?id=${user.id})`;
        const targetLink = target.username ? `@${target.username}` : `[${target.name}](tg://user?id=${target.id})`;

        bot.sendMessage(chatId, `🎉 *Это взаимно!*\n\nВаша пара: *${target.name}*\nНапишите прямо сейчас: ${targetLink}`, { parse_mode: 'Markdown' });
        bot.sendMessage(targetId, `🎉 *Это взаимно!*\n\nВаша пара: *${user.name}*\nНапишите прямо сейчас: ${userLink}`, { parse_mode: 'Markdown' });
      }
      
      saveUsers();
      showNextProfile(chatId);
    } else if (data?.startsWith('dislike_')) {
      const targetId = parseInt(data.split('_')[1]);
      user.dislikes.push(targetId);
      saveUsers();
      showNextProfile(chatId);
    } else if (data === 'stop_search') {
      user.state = 'idle';
      saveUsers();
      showMainMenu(chatId);
    } else if (data === 'edit_profile') {
      user.state = 'naming';
      saveUsers();
      bot.sendMessage(chatId, "Хорошо, давайте обновим вашу анкету. Как вас зовут?");
    } else if (data === 'update_location') {
      user.state = 'citying';
      saveUsers();
      bot.sendMessage(chatId, "📍 Отправьте вашу новую геолокацию или напишите название города:", {
        reply_markup: {
          keyboard: [[{ text: '📍 Отправить геолокацию', request_location: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }

    bot.answerCallbackQuery(query.id);
  });
}

function showMainMenu(chatId: number) {
  bot?.sendMessage(chatId, "Выберите действие:", {
    reply_markup: {
      keyboard: [
        [{ text: '🔍 Искать' }],
        [{ text: '👤 Моя анкета' }, { text: '❤️ Пары' }]
      ],
      resize_keyboard: true
    }
  });
}

function showMyProfile(chatId: number) {
  const user = users[chatId];
  
  if (!user.name || !user.age) {
    user.state = 'naming';
    saveUsers();
    bot?.sendMessage(chatId, "🤔 Ваша анкета не заполнена. Давайте это исправим!\n\nКак вас зовут?");
    return;
  }

  const caption = `*${user.name}, ${user.age}*\n📍 ${user.city || 'Не указан'}\n\n${user.bio}`;
  const opts = {
    parse_mode: 'Markdown' as const,
    reply_markup: {
      inline_keyboard: [
        [{ text: '📝 Изменить анкету', callback_data: 'edit_profile' }],
        [{ text: '📍 Обновить город/локацию', callback_data: 'update_location' }]
      ]
    }
  };

  if (user.photo) {
    bot?.sendPhoto(chatId, user.photo, { ...opts, caption });
  } else {
    bot?.sendMessage(chatId, caption, opts);
  }
}

function showNextProfile(chatId: number) {
  const user = users[chatId];
  const allUsers = Object.values(users);
  const potential = allUsers.filter(u => 
    u.id !== chatId && 
    !user.likes.includes(u.id) && 
    !user.dislikes.includes(u.id) &&
    u.name && // Only registered users
    u.age >= user.age - 2 && u.age <= user.age + 2 && // Age filter: ±2 years
    (u.city === user.city) // City filter
  );

  if (potential.length === 0) {
    bot?.sendMessage(chatId, "😔 Пока новых анкет в вашем городе и вашей возрастной категории нет. Зайдите позже!");
    user.state = 'idle';
    showMainMenu(chatId);
    return;
  }

  const target = potential[Math.floor(Math.random() * potential.length)];
  
  let distanceText = '';
  if (user.location && target.location) {
    const dist = Math.round(getDistance(user.location.lat, user.location.lon, target.location.lat, target.location.lon));
    distanceText = `, 📍 ${dist} км`;
  }

  const caption = `*${target.name}, ${target.age}${distanceText}*\n\n${target.bio}`;
  const opts = {
    parse_mode: 'Markdown' as const,
    reply_markup: {
      inline_keyboard: [
        [
          { text: '❤️', callback_data: `like_${target.id}` },
          { text: '👎', callback_data: `dislike_${target.id}` }
        ],
        [{ text: '💤 Стоп', callback_data: 'stop_search' }]
      ]
    }
  };

  if (target.photo) {
    bot?.sendPhoto(chatId, target.photo, { ...opts, caption });
  } else {
    bot?.sendMessage(chatId, caption, opts);
  }
}

function showMatches(chatId: number) {
  const user = users[chatId];
  if (user.matches.length === 0) {
    bot?.sendMessage(chatId, "У вас пока нет взаимных симпатий.");
    return;
  }

  bot?.sendMessage(chatId, "💞 *Ваши взаимные симпатии:*", { parse_mode: 'Markdown' });
  user.matches.forEach(mId => {
    const m = users[mId];
    const link = m.username ? `@${m.username}` : `[Профиль](tg://user?id=${m.id})`;
    bot?.sendMessage(chatId, `👤 *${m.name}*\n🔗 ${link}`, { parse_mode: 'Markdown' });
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Keep Vite for potential future use or fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
