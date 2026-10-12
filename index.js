import express from "express";
import makeWASocket, { useMultiFileAuthState, Browsers } from "@whiskeysockets/baileys";
import pino from "pino";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("KHAN-XD Bot is Running! Made by KHAN");
});

app.listen(PORT, () => console.log("Server running on port " + PORT));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: Browsers.macOS("Desktop")
    });

    sock.ev.on("creds.update", saveCreds);
}

startBot();
