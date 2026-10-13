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
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ 
    version, 
    logger: pino({level:"silent"}), 
    auth: state, 
    browser:["Ubuntu","Chrome","20.0.04"] 
  });
  
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (u)=>{
    if(u.connection==="open") console.log("✅ CONNECTED! BOT ONLINE - NO MORE CODE NEEDED");
    if(u.connection==="close") console.log("Connection closed");
  });

  if (!sock.authState.creds.registered) {
    await delay(5000);
    let count = 1;
    while(true){
      try{
        const code = await sock.requestPairingCode(PAIR_NUMBER);
        console.log(`\n[${count}] CODE: ${code} - ${new Date().toLocaleTimeString()}`);
        console.log(`Valid for 60 sec!`);
        console.log(`Next code after 10 min...`);
        count++;
      }catch(e){
        console.log("WhatsApp blocked, waiting 10 min: " + e.message);
      }
      await delay(10 * 60 * 1000); // 10 মিনিট
    }
  }
}
start();
