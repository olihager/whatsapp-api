const fs = require("fs");
const { title } = require("process");
const myConsole = new console.Console(fs.createWriteStream("./logs.txt"));
const whatsappService = require("../services/whatsappService");
const voiceflowService = require("../services/voiceflowService"); // 👈 NEW: VF integration

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

// 👇 CHANGED: make async to await Voiceflow + sends
const messageReceived = async (req, res) => {
  console.log("📢 ACCESS_TOKEN:", process.env.ACCESS_TOKEN);
  console.log("📢 PHONE_NUMBER_ID:", process.env.PHONE_NUMBER_ID);

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messageObject = value?.messages;

    if (!messageObject?.length) {
      console.log("No messages in webhook payload");
      return res.send("Event Received");
    }

    const messages = messageObject[0];
    console.log("📦 Full message object:", JSON.stringify(messages, null, 2));

    // Extract user text from message
    const text = GetTestUser(messages) || "";
    // Normalize AR number (strip the '9' after 54 if present)
    let number = stripNineForArgentina(messages["from"]);

    console.log("✅ Final extracted text:", text);
    console.log("📤 Sending normalized number:", number);

    // ===== VOICEFLOW: send user text and get traces back =====
    try {
      const traces = await voiceflowService.sendToVoiceflow(
        number,           // userId (per-user session by phone)
        text,             // user text
        { phone: number, locale: "es-AR", channel: "whatsapp" }
      );

      // Map Voiceflow traces to WhatsApp-compatible messages
      const waMessages = voiceflowService.mapTracesToWhatsApp(traces);

      if (!waMessages.length) {
        console.log("Voiceflow returned no messages; sending a default ack.");
        // Fallback (text-only) if Voiceflow returns nothing:
        await safeSendText(`Gracias. Recibí: ${text}`, number);
      } else {
        // Send each mapped message
        for (const m of waMessages) {
          await safeSendPayload(number, m);
        }
      }
    } catch (vfErr) {
      console.error("Voiceflow error:", vfErr);
      // Fallback so user still gets a response
      await safeSendText(`Gracias. Recibí: ${text}`, number);
    }

    res.send("Event Received");
  } catch (e) {
    console.error(e);
    res.send("Event Received");
  }
};

// Fallback-safe senders (works whether you created sendWhatsAppMessage or still have sendMessageWhatsApp only)
async function safeSendText(body, number) {
  try {
    if (typeof whatsappService.sendWhatsAppMessage === "function") {
      await whatsappService.sendWhatsAppMessage(number, { type: "text", text: { preview_url: false, body } });
    } else if (typeof whatsappService.sendMessageWhatsApp === "function") {
      // your original function signature: (textResponse, number)
      await whatsappService.sendMessageWhatsApp(body, number);
    } else {
      console.warn("No WhatsApp send function found in whatsappService.");
    }
  } catch (err) {
    console.error("safeSendText failed:", err);
  }
}

async function safeSendPayload(number, payload) {
  try {
    if (typeof whatsappService.sendWhatsAppMessage === "function") {
      // Generic sender supports text or interactive
      await whatsappService.sendWhatsAppMessage(number, payload);
    } else if (payload?.type === "text" && typeof whatsappService.sendMessageWhatsApp === "function") {
      // Fallback: only text supported by your original function
      await whatsappService.sendMessageWhatsApp(payload.text?.body || "", number);
    } else {
      console.warn("Interactive payload skipped (no generic sender available). Payload:", payload);
    }
  } catch (err) {
    console.error("safeSendPayload failed:", err);
  }
}

function GetTestUser(messages) {
  let text = "";
  const typeMessage = messages["type"];

  console.log("📌 Detected message type:", typeMessage);

  if (typeMessage === "text") {
    text = messages["text"]["body"] || "";
    console.log("💬 Text message body:", text);
  } else if (typeMessage === "interactive") {
    const interactiveObject = messages["interactive"];
    const typeInteractive = interactiveObject?.["type"];

    console.log("🟡 Interactive message object:", interactiveObject);

    if (typeInteractive === "button_reply") {
      text = interactiveObject?.["button_reply"]?.["title"] || "";
    } else if (typeInteractive === "list_reply") {
      text = interactiveObject?.["list_reply"]?.["title"] || "";
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
