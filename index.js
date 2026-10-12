const express = require("express");
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("KHAN-XD Bot is Running! Made by Siam ❤️");
});

app.listen(PORT, () => console.log("Server Live on " + PORT));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: Browsers.macOS("Desktop")
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;
    if (connection === "open") {
      console.log("✅ Bot Connected to WhatsApp!");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (text === ".ping") {
      await sock.sendMessage(msg.key.remoteJid, { text: "Pong! Bot Alive 🔥" });
    }
  });
}

startBot();
