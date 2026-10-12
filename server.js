require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const BaldwinSpy = require('./spy');
const AlwaysOnline = require('./alwaysonline');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const bot = new Telegraf(process.env.BOT_TOKEN);
const ai = process.env.OPENAI_KEY ? new OpenAI({ apiKey: process.env.OPENAI_KEY }) : null;

let userClient = null;
let spy = null;
let online = null;

// INIT USER CLIENT
async function initUserClient() {
  if (!process.env.API_ID || !process.env.API_HASH) return;
  const session = new StringSession("");
  userClient = new TelegramClient(session, parseInt(process.env.API_ID), process.env.API_HASH, { connectionRetries: 5 });
  await userClient.connect();
  online = new AlwaysOnline(userClient);
  online.start();
  spy = new BaldwinSpy(userClient, bot, ai);
}

// BOT COMMANDS

bot.start(async (ctx) => {
  const name = ctx.from.first_name;
  const botUsername = ctx.botInfo.username;
  await ctx.reply(
`👻 *BALDWIN SPY BOT* 👻

Hello ${name}!

24/7 bot wey go dey gist for you.
✅✅ Double tick
🟢 Always Online
♾️ Endless Gist

Click [Menu ☰] below:`,
{
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [{ text: "🔴 🔗 Connect", callback_data: "connect" }],
      [{ text: "🟣 📖 Instructions", callback_data: "instructions" }],
      [{ text: "🔵 ⚡ Features", callback_data: "features" }],
      [{ text: "🟠 🕘 History", callback_data: "history" }],
      [{ text: "🟢 ⚙️ Settings", callback_data: "settings" }],
      [{ text: "⚪ ❓ Help", callback_data: "help" }],
      [{ text: "➕ ADD BOT TO GROUP", url: `https://t.me/${botUsername}?startgroup=true&admin=post_messages+delete_messages+pin_messages+invite_users` }]
    ]
  }
}
  );
});

bot.action('connect', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(`🔗 *CONNECT*\n\n1. Go to @BotFather get BOT_TOKEN\n2. Go to my.telegram.org get API_ID & API_HASH\n3. Put them in .env\n4. Open Dashboard to connect`, { parse_mode: "Markdown" });
});
bot.action('instructions', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply("📖 Instructions: Create bot, get API, put in .env, deploy."); });
bot.action('features', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply("⚡ Features: ✅✅ Double Tick, 🟢 Always Online, ♾️ Endless, 👻 Hide Number, Group Spy"); });
bot.action('history', async (ctx) => {
  await ctx.answerCbQuery();
  if (!fs.existsSync('memory.json')) return ctx.reply("No history yet");
  const data = JSON.parse(fs.readFileSync('memory.json'));
  const last = data.history.slice(-5).map(h => `${h.name}: ${h.userMsg}`).join('\n');
  await ctx.reply(`🕘 Last Chats:\n${last}`);
});
bot.action('settings', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply(`⚙️ Settings:\nEndless: ${config.settings.endlessMode}\nDoubleTick: ${config.settings.doubleTick}\nOnline: ${config.settings.onlineMode}`); });
bot.action('help', async (ctx) => { await ctx.answerCbQuery(); await ctx.reply("❓ Help: Type /start for menu. Add bot to group with admin rights."); });

bot.on('new_chat_members', async (ctx) => {
  if (ctx.message.new_chat_members.some(m => m.username === ctx.botInfo.username)) {
    await ctx.reply(`👻 Thanks for adding me! Make me ADMIN to enable ✅✅ and 🟢 Online`);
  }
});

bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return;
  if (userClient) {
    try { await userClient.invoke(new (require('telegram').Api.account.UpdateStatus)({ offline: false }); } catch(e){}
  }
  if (spy) {
    await spy.handleIncomingMessage(ctx);
  } else {
    await ctx.sendChatAction('typing');
    await new Promise(r => setTimeout(r, 1000));
    await ctx.reply(`Hey ${ctx.from.first_name}, bot dey online 🟢, you don chop?`);
  }
});

// API ROUTES FOR DASHBOARD
app.get('/api/history', (req, res) => {
  if (!fs.existsSync('memory.json')) return res.json([]);
  res.json(JSON.parse(fs.readFileSync('memory.json')).history);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on ${PORT}`);
  await initUserClient();
  bot.launch();
  console.log("Bot launched");
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
