console.log("📍 Running from", __filename);

const express = require("express");

const apiRoute = require("./routes/routes");

const app = express();

const PORT = process.env.PORT || 3000; 

app.use(express.json());

app.use("/whatsapp", apiRoute);

app.get("/whatsapp", (req, res) => {
  res.send("🔥 HARDCODED RESPONSE FROM index.js");
});

app.listen(PORT, () => {console.log("el puerto es " + PORT)});