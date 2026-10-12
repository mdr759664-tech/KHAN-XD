const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req,res) => {
  res.send("Bot is Running! Fix by Siam");
});

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
  // 
  try {
    require("./src/bot.js");
  } catch(e) {
    console.log("Bot file not found, server running only");
  }
});
