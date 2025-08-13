const fs = require("fs");
const { title } = require("process");
const myConsole = new console.Console(fs.createWriteStream("./logs.txt"));
const whatsappService = require("../services/whatsappService");

console.log("✅ THIS IS THE CLEANED CONTROLLER");

// 🔹 Helper to normalize Argentine numbers by removing the "9" after country code
function stripNineForArgentina(number) {
  let n = (number || "").replace(/\D/g, ""); // keep only digits
  if (!n) return n;

  // If starts with 549, remove the "9"
  if (n.startsWith("549")) {
    return "54" + n.slice(3);
  }

  return n;
}

const verifyToken = (req, res) => {
  try {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    var token = req.query["hub.verify_token"];
    var challenge = req.query["hub.challenge"];

    if (challenge != null && token != null && token === VERIFY_TOKEN) {
      res.send(challenge);
    } else {
      res.status(400).send();
    }
  } catch (error) {
    res.status(400).send();
  }
};

const messageReceived = (req, res) => {
  console.log("📢 ACCESS_TOKEN:", process.env.ACCESS_TOKEN);
  console.log("📢 PHONE_NUMBER_ID:", process.env.PHONE_NUMBER_ID);

  try {
    var entry = req.body["entry"][0];
    var changes = entry["changes"][0];
    var value = changes["value"];
    const messageObject = value["messages"];
    const messages = messageObject[0];

    console.log("📦 Full message object:", JSON.stringify(messages, null, 2));

    if (typeof messageObject != "undefined") {
      const messages = messageObject[0];
      const text = GetTestUser(messages);

      // Original number from incoming message
      var number = messages["from"];

      // ✅ Normalize number for Argentina
      number = stripNineForArgentina(number);
      console.log("📤 Sending normalized number:", number);

      console.log("✅ Final extracted text:", text);
      whatsappService.sendMessageWhatsApp("el usuario dijo " + text, number);
    }

    res.send("Event Received");
  } catch (e) {
    myConsole.log(e);
    res.send("Event Received");
  }
};

function GetTestUser(messages) {
  let text = "";
  const typeMessage = messages["type"];

  console.log("📌 Detected message type:", typeMessage);

  if (typeMessage === "text") {
    // ✅ This should work if it's a regular message
    text = messages["text"]["body"];
    console.log("💬 Text message body:", text);
  } else if (typeMessage === "interactive") {
    const interactiveObject = messages["interactive"];
    const typeInteractive = interactiveObject["type"];

    console.log("🟡 Interactive message object:", interactiveObject);

    if (typeInteractive === "button_reply") {
      text = interactiveObject["button_reply"]["title"];
    } else if (typeInteractive === "list_reply") {
      text = interactiveObject["list_reply"]["title"];
    } else {
      console.log("⚠️ Unknown interactive type");
    }
  } else {
    console.log("❗️Unhandled message type or missing:", typeMessage);
  }

  return text;
}

module.exports = {
  verifyToken,
  messageReceived
};
