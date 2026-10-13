const { Telegraf } = require('telegraf');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const fs = require('fs');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply(
`Welcome to RANA-X-MD Pair Bot!

Send your WhatsApp Number with country code
Example: 8801636487523

Channel: https://whatsapp.com/channel/0029VbDjPSq9mrGZ25AYA021`
));

bot.on('text', async (ctx) => {
  let num = ctx.message.text.replace(/[^0-9]/g, '');
  if(num.length < 11) return ctx.reply('Invalid Number! Send like: 8801636487523');

  await ctx.reply(`Generating Pair Code for ${num}... Please wait 20 sec`);

  try {
    if(fs.existsSync('./temp')) fs.rmSync('./temp', {recursive:true, force:true});
    const { state, saveCreds } = await useMultiFileAuthState('./temp');
    const sock = makeWASocket({ 
        auth: state, 
        printQRInTerminal: false,
        browser: ["RANA-X-MD", "Chrome", "121.0"]
    });
    sock.ev.on('creds.update', saveCreds);
    await delay(3000);
    let code = await sock.requestPairingCode(num);
    await ctx.reply(`Your Pair Code: ${code}\n\nGo to WhatsApp > Linked Devices > Link with phone number > Enter this code\nExpire in 60 sec`);
  } catch(e) {
    ctx.reply('Error! Try again after 2 min: ' + e.message);
  }
});

bot.launch();
console.log('Bot Live');
