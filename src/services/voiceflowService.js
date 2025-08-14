// src/services/voiceflowService.js

async function sendToVoiceflow(userId, userText, variables = {}) {
  const VERSION_ID = process.env.VOICEFLOW_VERSION_ID;
  const VF_API_KEY = process.env.VOICEFLOW_API_KEY;

  if (!VERSION_ID || !VF_API_KEY) {
    throw new Error("VOICEFLOW_VERSION_ID or VOICEFLOW_API_KEY is missing");
  }

  const url = `https://general-runtime.voiceflow.com/state/${VERSION_ID}/user/${encodeURIComponent(userId)}/interact`;

  const payload = [{ type: "text", payload: userText }];

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: VF_API_KEY,
      "Content-Type": "application/json",
      accept: "application/json",
      "x-voiceflow-metadata": JSON.stringify({
        locale: variables.locale || "es-AR",
        channel: "whatsapp",
        phone: variables.phone || userId
      })
    },
    body: JSON.stringify(payload)
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Voiceflow error:", res.status, body);
    throw new Error(`Voiceflow API ${res.status}`);
  }
  return body; // array of traces
}

function mapTracesToWhatsApp(traces) {
  const outputs = [];
  if (!Array.isArray(traces)) return outputs;

  for (const t of traces) {
    if (!t) continue;

    // Handle text or speak traces as WhatsApp text
    if ((t.type === "text" || t.type === "speak") && t.payload?.message) {
      outputs.push({
        type: "text",
        text: { preview_url: false, body: t.payload.message }
      });
    }

    // Choice traces -> WhatsApp buttons (max 3)
    if (t.type === "choice" && Array.isArray(t.payload?.choices) && t.payload.choices.length) {
      const buttons = t.payload.choices.slice(0, 3).map((choice, i) => ({
        type: "reply",
        reply: {
          id: String(choice.name || choice.label || `btn_${i}`),
          title: String(choice.name || choice.label || `Opción ${i + 1}`).slice(0, 20)
        }
      }));

      const promptText = String(t.payload?.prompt || "Elige una opción:");
      outputs.push({
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: promptText.slice(0, 1024) },
          action: { buttons }
        }
      });
    }
  }

  return outputs;
}

module.exports = {
  sendToVoiceflow,
  mapTracesToWhatsApp
};
