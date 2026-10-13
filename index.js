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
  const sock = makeWASocket({ version, logger: pino({level:"silent"}), auth: state, browser:["Ubuntu","Chrome","20.0.04"] });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (u)=>{
    if(u.connection==="open") console.log("✅ CONNECTED! BOT ONLINE");
  });
  if (!sock.authState.creds.registered) {
    await delay(3000);
    while(!sock.authState.creds.registered){
      try{
        const code = await sock.requestPairingCode(PAIR_NUMBER);
        console.log(`\n===== NEW CODE: ${code} =====`);
        console.log(`Time: ${new Date().toLocaleTimeString()}`);
        console.log(`Valid for 60 sec! Use fast!`);
        for(let i=30;i>0;i--){
          process.stdout.write(`\rNext code in ${i} sec...   `);
          await delay(1000);
        }
        console.log("\nRefreshing code...");
      }catch(e){
        console.log("Blocked, waiting 60 sec... " + e.message);
        await delay(60000);
      }
    }
  }
}
start();
