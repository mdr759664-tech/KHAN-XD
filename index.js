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
  const sock = makeWASocket({ version, logger: pino({level:"silent"}), auth: state, browser:["Ubuntu","Chrome","20.0.04"] });
  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {
    await delay(5000);
    while (!sock.authState.creds.registered) {
      try {
        const code = await sock.requestPairingCode(PAIR_NUMBER);
        console.log("NEW CODE: " + code + " Time: " + new Date().toLocaleTimeString());
        await delay(60000);
      } catch (e) {
        console.log("Error: " + e.message);
        await delay(10000);
      }
    }
  }
  sock.ev.on("connection.update", (u)=>{
    if(u.connection==="open") console.log("CONNECTED SUCCESSFULLY!");
  });
}
start();
