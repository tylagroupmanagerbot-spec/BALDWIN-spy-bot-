const { Api } = require('telegram');
const config = require('./config');
const fs = require('fs');

class BaldwinSpy {
  constructor(client, bot, ai) {
    this.client = client;
    this.bot = bot;
    this.ai = ai;
  }

  async markAsRead(chatId, messageId) {
    if (!config.settings.doubleTick) return;
    try {
      const entity = await this.client.getInputEntity(chatId);
      await this.client.invoke(new Api.messages.ReadHistory({
        peer: entity,
        maxId: messageId
      }));
      console.log(`✅✅ READ: ${chatId}`);
    } catch(e){}
  }

  async showTyping(chatId) {
    try {
      const entity = await this.client.getInputEntity(chatId);
      await this.client.invoke(new Api.messages.SetTyping({
        peer: entity,
        action: new Api.SendMessageTypingAction()
      }));
    } catch(e){}
  }

  async handleIncomingMessage(ctx) {
    const chatId = ctx.chat.id;
    const msgId = ctx.message.message_id;
    const text = ctx.message.text || "";
    const name = ctx.from.first_name;

    await this.markAsRead(chatId, msgId);
    await this.showTyping(chatId);
    await ctx.sendChatAction('typing');

    await new Promise(r => setTimeout(r, 2000));

    try {
      let reply = "";
      if (this.ai) {
        const res = await this.ai.chat.completions.create({
          model: config.AI.model,
          messages: [
            { role: "system", content: config.AI.systemPrompt },
            { role: "user", content: `${name} says: ${text}` }
          ]
        });
        reply = res.choices[0].message.content;
      } else {
        reply = `Hey ${name}, you said: ${text}. Wetin you dey do now? 😊`;
      }

      if (['ok','k','lol','bye'].includes(text.toLowerCase())) {
        reply += ` You no wan gist again? Wetin dey sup?`;
      }

      await ctx.reply(reply);
      this.logChat(name, text, reply);
    } catch(e) {
      await ctx.reply(`Hey ${name}, network glitch, you still there?`);
    }
  }

  logChat(name, userMsg, botReply) {
    let memory = { history: [] };
    if (fs.existsSync('memory.json')) {
      try { memory = JSON.parse(fs.readFileSync('memory.json')); } catch(e){}
    }
    memory.history.push({ name, userMsg, botReply, time: new Date().toISOString(), read: true });
    fs.writeFileSync('memory.json', JSON.stringify(memory, null, 2));
  }
}

module.exports = BaldwinSpy;
