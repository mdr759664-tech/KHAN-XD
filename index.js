import express from "express";
import pino from "pino";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => { res.send("KHAN-XD Bot is Running!"); });
app.listen(PORT, () => console.log("Server running on " + PORT));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  const sock = makeWASocket({ 
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  if(!sock.authState.creds.registered) {
    const phoneNumber = "8801636487523";
    setTimeout(async () => {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`PAIRING CODE: ${code}`);
    }, 3000);
  }

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (update) => {
    const { connection } = update;
    if(connection === "close") startBot();
    else if(connection === "open") console.log("Connected!");
  });
}

startBot();
