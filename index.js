import fs from "fs";
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay } from "@whiskeysockets/baileys";
import pino from "pino";
import express from "express";

if (fs.existsSync("./session")) fs.rmSync("./session", { recursive: true, force: true });

const app = express();
app.get("/", (req,res)=>res.send("Bot Running"));
app.listen(process.env.PORT || 10000);

const PAIR_NUMBER = "8801636487523";

async function start() {
  const { version } = await fetchLatestBaileysVersion();
  console.log("Using WA v" + version.join("."));
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ 
    version, 
    logger: pino({level:"silent"}), 
    auth: state, 
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    syncFullHistory: false
  });
  
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async (u)=>{
    const { connection } = u;
    if(connection==="open") {
      console.log("✅ CONNECTED! Bot online - Code no longer needed");
    }
  });

  if (!sock.authState.creds.registered) {
    await delay(10000);
    const code = await sock.requestPairingCode(PAIR_NUMBER);
    console.log(`\nCODE: ${code}\nEnter fast! Don't wait!\n`);
  }
}
start();
