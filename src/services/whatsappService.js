// src/services/whatsappService.js

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
  console.warn("⚠️ Missing PHONE_NUMBER_ID or ACCESS_TOKEN env vars.");
}

/**
 * Send any WhatsApp payload (text or interactive).
 * Example payloads:
 *  - { type: "text", text: { preview_url: false, body: "Hola!" } }
 *  - { type: "interactive", interactive: { type: "button", body:{text:"..."}, action:{buttons:[...]}}}
 */
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

  if (!res.ok) {
    throw new Error(`WA send failed ${res.status}: ${text}`);
  }
}

// (Optional) mark incoming message as read before replying
async function markAsRead(messageId) {
  const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId
    })
  });
  if (!res.ok) {
    console.log("markAsRead failed:", await res.text());
  }
}

module.exports = { sendWhatsAppMessage, markAsRead };
