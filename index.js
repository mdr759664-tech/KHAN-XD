import express from "express";
import fs from "fs";
import pino from "pino";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("KHAN-XD Running"));
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

if (fs.existsSync('./session')) {
  fs.rmSync('./session', { recursive: true, force: true });
}
fs.mkdirSync('./session', { recursive: true });

if (process.env.SESSION_ID) {
  try {
    let sess = process.env.SESSION_ID.replace(/KHAN-MD~/gi, '').replace(/RANA-X-D~/gi, '').replace(/KHAN-XD~/gi, '').trim();
    let decoded = Buffer.from(sess, 'base64').toString('utf-8');
    fs.writeFileSync('./session/creds.json', decoded);
    console.log("Session Loaded");
  } catch(e) {
    console.log("SESSION INVALID:", e.message);
  }
} else {
  console.log("NO SESSION_ID FOUND");
}

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
      logger: pino({ level: "silent" }),
      auth: state,
      printQRInTerminal: false,
      browser: ["KHAN-XD", "Chrome", "1.0"]
    });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", (update) => {
      console.log(update);
      const { connection, lastDisconnect } = update;
      if(connection === "open") console.log("BOT CONNECTED");
      if(connection === "close") {
        console.log("Closed:", lastDisconnect?.error?.message);
        setTimeout(startBot, 3000);
      }
    });
  } catch(err) {
    console.log("Error:", err.message);
  }
}

startBot();
