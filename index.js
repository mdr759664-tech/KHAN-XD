import express from "express";
import fs from "fs";
import pino from "pino";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("RANA-X-D Bot Running"));
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

if (!fs.existsSync('./session')) fs.mkdirSync('./session', { recursive: true });

if (process.env.SESSION_ID) {
  try {
    let sess = process.env.SESSION_ID.replace(/KHAN-MD~/gi, '').replace(/RANA-X-D~/gi, '').trim();
    let decoded = Buffer.from(sess, 'base64').toString('utf-8');
    fs.writeFileSync('./session/creds.json', decoded);
    console.log("✅ Session ID Loaded From ENV");
  } catch(e) {
    console.log("❌ SESSION INVALID");
  }
} else {
  console.log("❌ NO SESSION_ID IN ENV!");
}

async function startBot() {
  if (!fs.existsSync('./session/creds.json')) {
    console.log("❌ creds.json not found! Check SESSION_ID");
    return;
  }
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ logger: pino({ level: "silent" }), auth: state, printQRInTerminal: false });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (u) => {
    if(u.connection === "open") console.log("BOT CONNECTED ✅");
    if(u.connection === "close") setTimeout(startBot, 3000);
  });
}
startBot();
