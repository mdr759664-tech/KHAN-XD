import express from "express";
import fs from "fs";
import pino from "pino";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("KHAN-XD Bot Running"));
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

if (!fs.existsSync('./session')) fs.mkdirSync('./session', { recursive: true });

if (process.env.SESSION_ID) {
  try {
    let sess = process.env.SESSION_ID.replace(/KHAN-MD~/gi, '').replace(/RANA-X-D~/gi, '').trim();
    let decoded = Buffer.from(sess, 'base64').toString('utf-8');
    fs.writeFileSync('./session/creds.json', decoded);
    console.log("✅ SESSION LOADED SUCCESS");
  } catch(e) {
    console.log("❌ SESSION_ID INVALID:", e.message);
  }
}

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  // Pairing code চাবে না যদি creds.json থাকে
  if (!sock.authState.creds.registered && !fs.existsSync('./session/creds.json')) {
     console.log("No Session Found! Need Pairing");
  }

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (update) => {
    if(update.connection === "open") console.log("BOT CONNECTED ✅");
    if(update.connection === "close") {
        console.log("Disconnected, restarting...");
        setTimeout(startBot, 3000);
    }
  });
}
startBot();
