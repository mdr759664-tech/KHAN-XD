import express from "express";
import pino from "pino";
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => res.send("RANA-X-D Bot Running"));
app.listen(PORT, () => console.log("Server running on " + PORT));
if (!fs.existsSync('./session')) {
  fs.mkdirSync('./session');
}

if (process.env.SESSION_ID) {
  try {
    let sess = process.env.SESSION_ID.replace(/KHAN-MD~/gi, '').replace(/RANA-X-D~/gi, '').trim();
    let decoded = Buffer.from(sess, 'base64').toString('utf-8');
    fs.writeFileSync('./session/creds.json', decoded);
    console.log("✅ Session ID Loaded From ENV");
  } catch(e) {
    console.log("Session Load Error:", e.message);
  }
}
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  if (!sock.authState.creds.registered) {
    console.log("Waiting 8 seconds before requesting pairing code...");
    setTimeout(async () => {
      try {
        const phoneNumber = "8801636487523";
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`PAIRING CODE: ${code}`);
      } catch(e) {
        console.log("Pairing error, restarting...", e.message);
        startBot();
      }
    }, 8000); // 8 second delay
  }

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (update) => {
    if(update.connection === "open") console.log("BOT CONNECTED!");
    if(update.connection === "close") startBot();
  });
}
startBot();
