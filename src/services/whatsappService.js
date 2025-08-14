const fetch = require("node-fetch");

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Voiceflow config
const VF_API_KEY = process.env.VOICEFLOW_API_KEY; // Your Voiceflow API key
const VF_VERSION_ID = process.env.VOICEFLOW_VERSION_ID; // The project version
const VF_API_URL = `https://general-runtime.voiceflow.com/state/${VF_VERSION_ID}`;

// Existing send function to WhatsApp
async function sendWhatsAppMessage(number, payload) {
  const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: number,
    ...payload
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  console.log("WA SEND status:", res.status);
  console.log("WA SEND body:", text);

  if (!res.ok) throw new Error(`WA send failed ${res.status}: ${text}`);
}

// 🔹 New: send incoming WhatsApp message to Voiceflow
async function sendToVoiceflow(userId, message) {
  const res = await fetch(`${VF_API_URL}/user/${userId}/interact`, {
    method: "POST",
    headers: {
      Authorization: VF_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "text",
      payload: message
    })
  });

  if (!res.ok) {
    throw new Error(`Voiceflow request failed: ${res.status}`);
  }

  return res.json();
}

// 🔹 New: handle WhatsApp → Voiceflow → WhatsApp loop
async function handleIncomingMessage(fromNumber, messageText) {
  // Send to Voiceflow
  const vfResponse = await sendToVoiceflow(fromNumber, messageText);

  // Loop over Voiceflow messages and send to WhatsApp
  for (const trace of vfResponse) {
    if (trace.type === "text") {
      await sendWhatsAppMessage(fromNumber, {
        type: "text",
        text: { body: trace.payload.message }
      });
    }
  }
}

module.exports = { sendWhatsAppMessage, handleIncomingMessage };
