const { Api } = require('telegram');

class AlwaysOnline {
  constructor(client) {
    this.client = client;
    this.interval = null;
  }
  async goOnline() {
    if (!this.client) return;
    try {
      await this.client.invoke(new Api.account.UpdateStatus({ offline: false }));
      console.log(`🟢 ONLINE ${new Date().toLocaleTimeString()}`);
    } catch(e){}
  }
  start() {
    if (!this.client) return;
    this.goOnline();
    this.interval = setInterval(() => this.goOnline(), 120000);
    console.log("🟢 AlwaysOnline active - NEVER OFFLINE");
  }
  stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

module.exports = AlwaysOnline;
