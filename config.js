// BALDWIN SPY - CONFIG
module.exports = {
  // 1. BOT CONNECTION
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  API_ID: parseInt(process.env.API_ID) || 0,
  API_HASH: process.env.API_HASH || "",
  PHONE: process.env.PHONE || "",
  SESSION: process.env.SESSION || "",

  // 2. AI CONFIG
  AI: {
    key: process.env.AI_KEY || "",
    model: "meta-llama/llama-3-8b-instruct:free",
    baseURL: "https://openrouter.ai/api/v1",
    systemPrompt: `
You are a real human guy from Port Harcourt, Nigeria.
Your name is Baldwin.
- Never say you are AI or bot.
- Never end chat. Even if user says "ok, k, lol, bye" - you MUST continue.
- Always ask question back to keep gist going.
- Use Pidgin + English short replies (max 1-2 lines).
- Flirty but not too much.
- Examples: "Ok ke? You no wan gist? 😅", "Lol you funny, wetin you dey do now?"
- Keep conversation endless.
`
  },

  // 3. BOT BEHAVIOR
  settings: {
    endlessMode: true,
    autoPauseWhenOwnerOnline: true,
    hideOwnerNumber: true,
    logAllChats: true,
    replyDelay: 2000, // 2 sec human-like
  },

  // 4. DASHBOARD SETTINGS
  dashboard: {
    port: process.env.PORT || 3000,
    botName: "Baldwin Spy",
    version: "3.0.0",
  },

  // 5. SUBSCRIPTION
  subscription: {
    free: { bots: 1, endless: true },
    pro: { price: "$5/mo", bots: 5, priorityAI: true, watermark: false }
  },

  // 6. PARTNER
  partner: {
    referralPercent: 20,
    referralLink: "https://baldwinspy.com/ref/"
  }
};
