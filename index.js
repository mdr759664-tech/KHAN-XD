import express from "express";
import fs from "fs";
import pino from "pino";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => res.send("KHAN-XD Running - Pair Mode ON"));
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

if (!fs.existsSync('./session')) {
  fs.mkdirSync('./session', { recursive: true });
}

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
      logger: pino({ level: "silent" }),
      auth: state,
      printQRInTerminal: false,
      browser: ["KHAN-XD", "Chrome", "1.0.0"]
    });

    if (!sock.authState.creds.registered) {
      let phoneNumber = "8801636487523";
      console.log("Waiting for Pair Code...");
      setTimeout(async () => {
        try {
          let code = await sock.requestPairingCode(phoneNumber);
          console.log(`\n================================`);
          console.log(`PAIR CODE FOR ${phoneNumber} : ${code}`);
          console.log(`================================\n`);
        } catch(e) {
          console.log("Pair Error:", e.message);
        }
      }, 5000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async ({ connection }) => {
      if (connection === "open") {
        console.log("BOT CONNECTED WITH PAIR CODE");
      }
      if (connection === "close") {
        console.log("Connection closed, restarting in 5 sec...");
        setTimeout(startBot, 5000);
      }
    });

  } catch (e) {
    console.log("Bot Error:", e.message);
    setTimeout(startBot, 5000);
  }
}

startBot();
