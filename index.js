import fs from "fs";
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay } from "@whiskeysockets/baileys";
import pino from "pino";
import express from "express";

if (fs.existsSync("./session")) fs.rmSync("./session", { recursive: true, force: true });

const app = express();
app.get("/", (req,res)=>res.send("Bot Running"));
app.listen(process.env.PORT || 10000);
const PAIR_NUMBER = "8801837450067";

async function start() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ version, logger: pino({level:"silent"}), auth: state, browser:["Ubuntu","Chrome","20.0.04"] });
  sock.ev.on("creds.update", saveCreds);
  if (!sock.authState.creds.registered) {
    await delay(5000);
    let count = 1;
    while(true){
      try{
        const code = await sock.requestPairingCode(PAIR_NUMBER);
        console.log(`[${count}] NEW CODE: ${code} - ${new Date().toLocaleTimeString()}`);
        count++;
      }catch(e){ console.log("Retry: " + e.message); }
      console.log("Waiting 60 sec for next code...");
      await delay(60000);
    }
  }
}
start();
