require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { Telegraf } = require('telegraf');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let MEMORY = fs.existsSync('memory.json')? JSON.parse(fs.readFileSync('memory.json')) : { history:[], connected:false, account:null };
const save = () => fs.writeFileSync('memory.json', JSON.stringify(MEMORY,null,2));

// Dashboard APIs
app.get('/api/stats', (req,res) => res.json({ connected: MEMORY.connected, account: MEMORY.account, total: MEMORY.history.length }));
app.get('/api/history', (req,res) => res.json(MEMORY.history));

// CONNECT FLOW API
app.post('/api/connect', async (req,res) => {
  const { bot_token, api_id, api_hash, phone, code } = req.body;
  try{
    // Save env
    MEMORY.connected = true;
    MEMORY.account = phone;
    MEMORY.bot_token = bot_token;
    save();
    fs.appendFileSync('.env', `\nBOT_TOKEN=${bot_token}\nAPI_ID=${api_id}\nAPI_HASH=${api_hash}\nPHONE=${phone}\n`);
    res.json({ ok:true, message: "Connected! Session saved. Restart bot." });
  }catch(e){ res.json({ ok:false, error:e.message }); }
});

// Start Telegraf if BOT_TOKEN exists
if(process.env.BOT_TOKEN){
  const bot = new Telegraf(process.env.BOT_TOKEN);
  const ai = new OpenAI({ apiKey: process.env.AI_KEY, baseURL:"https://openrouter.ai/api/v1" });
  bot.start(ctx => ctx.reply("👻 Baldwin Spy Online - Endless Mode"));
  bot.on('text', async ctx => {
    const reply = await ai.chat.completions.create({
      model:"meta-llama/llama-3-8b-instruct:free",
      messages:[{role:"system",content:"You are human PH boy, never end chat, always ask question back, short 1 line pidgin"},{role:"user",content:ctx.message.text}]
    }).then(r=>r.choices[0].message.content).catch(()=>`Yeah ${ctx.from.first_name}, I dey here, tell me more na?`);
    MEMORY.history.push({ name:ctx.from.first_name, text:ctx.message.text, reply, date:new Date().toISOString() }); save();
    ctx.reply(reply);
  });
  bot.launch();
}

app.listen(process.env.PORT||3000, ()=>console.log("Dashboard + Bot Running on 3000"));
