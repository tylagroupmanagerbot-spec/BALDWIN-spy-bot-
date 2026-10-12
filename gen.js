const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

(async () => {
  const client = new TelegramClient(new StringSession(""), parseInt(process.env.API_ID), process.env.API_HASH, {});
  await client.start({
    phoneNumber: async () => await input.text("Phone number: "),
    password: async () => await input.text("2FA Password: "),
    phoneCode: async () => await input.text("Code: "),
    onError: (err) => console.log(err),
  });
  console.log("SESSION:", client.session.save());
})();
