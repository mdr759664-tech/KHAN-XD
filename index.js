import fs from "fs";
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, delay } from "@whiskeysockets/baileys";
import pino from "pino";
import express from "express";

if (fs.existsSync("./session")) {
  fs.rmSync("./session", { recursive: true, force: true });
  console.log("Old session deleted!");
}

const app = express();
app.get("/", (req,res)=>res.send("Bot Running"));
app.listen(process.env.PORT || 10000);

const PAIR_NUMBER = "8801636487523";

async function start() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ 
    version, 
    logger: pino({level:"silent"}), 
    auth: state, 
    browser:["Chrome","Chrome",""] 
  });
  
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (u)=>{
    if(u.connection==="open") console.log("CONNECTED SUCCESSFULLY!");
  });

  if (!sock.authState.creds.registered) {
    await delay(8000);
    const code = await sock.requestPairingCode(PAIR_NUMBER);
    console.log(`FRESH CODE: ${code}`);
    console.log(`Valid for 60 seconds - Use now!`);
  }
}
start();
