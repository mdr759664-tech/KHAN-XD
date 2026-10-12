import express from "express";
import makeWASocket, { useMultiFileAuthState, Browsers } from "@whiskeysockets/baileys";
import pino from "pino";
const app = express();
const PORT = process.env.PORT || 10000;
app.get("/", (req, res) => { res.send("KHAN-XD Bot is Running!"); });
app.listen(PORT, () => console.log("Server running on port " + PORT));
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ logger: pino({ level: "silent" }), auth: state, browser: Browsers.macOS("Desktop") });
    if (!sock.authState.creds.registered) {
        const phoneNumber = "8801626487523";
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`PAIRING CODE: ${code}`);
    }
    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", (update) => { if (update.connection === "open") console.log("BOT CONNECTED!"); });
}
startBot();
