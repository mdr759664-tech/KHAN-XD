import express from "express";
import fs from "fs";
import pino from "pino";
import { makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("RANA-X-XD Pair Running"));
app.listen(PORT, () => console.log(`Server on ${PORT}`));

async function startBot() {
  if (fs.existsSync('./session/creds.json')) {
    console.log("Deleting old session to get fresh pair code...");
    fs.rmSync('./session', { recursive: true, force: true });
  }
  if (!fs.existsSync('./session')) fs.mkdirSync('./session', { recursive: true });

  const { version } = await fetchLatestBaileysVersion();
  console.log(`Using WA Version: ${version}`);

  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    printQRInTerminal: false,
    shouldSyncHistoryMessage: () => false
  });

  sock.ev.on("creds.update", saveCreds);

  if (!state.creds.registered) {
    await delay(4000);
    const phoneNumber = "8801636487523";
    try {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`
================ PAIR CODE ================
NUMBER: ${phoneNumber}
CODE: ${code}

WhatsApp > Linked Devices > Link with phone number > Enter CODE
`);
    } catch (e) {
      console.log("Pair Error:", e.message);
    }
  }

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ BOT CONNECTED SUCCESSFULLY");
    }
    if (connection === "close") {
      console.log("Connection closed, restarting in 3 sec...");
      await delay(3000);
      startBot();
    }
  });
}

startBot();
