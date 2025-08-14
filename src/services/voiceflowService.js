// ---- add this to src/services/voiceflowService.js ----
async function launchVoiceflow(userId, variables = {}) {
  const VERSION_ID = process.env.VOICEFLOW_VERSION_ID;
  const VF_API_KEY = process.env.VOICEFLOW_API_KEY;

  if (!VERSION_ID || !VF_API_KEY) {
    throw new Error("VOICEFLOW_VERSION_ID or VOICEFLOW_API_KEY is missing");
  }

  const url = `https://general-runtime.voiceflow.com/state/${encodeURIComponent(VERSION_ID)}/user/${encodeURIComponent(userId)}/interact`;

  const payload = { type: "launch" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: VF_API_KEY, // if you ever see 401, try: `Bearer ${VF_API_KEY}`
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

  const bodyText = await res.text();
  let body; try { body = JSON.parse(bodyText); } catch { body = bodyText; }

  if (!res.ok) {
    console.error("Voiceflow launch error:", res.status, body);
    throw new Error(`Voiceflow launch ${res.status}`);
  }

  return body; // array of traces (usually your greeting)
}






async function sendToVoiceflow(userId, userText, variables = {}) {
  const VERSION_ID = process.env.VOICEFLOW_VERSION_ID;
  const VF_API_KEY = process.env.VOICEFLOW_API_KEY;

  if (!VERSION_ID || !VF_API_KEY) {
    throw new Error("VOICEFLOW_VERSION_ID or VOICEFLOW_API_KEY is missing");
  }

  const url = `https://general-runtime.voiceflow.com/state/${encodeURIComponent(VERSION_ID)}/user/${encodeURIComponent(userId)}/interact`;

  // ✅ send an OBJECT, not an array
  const payload = { type: "text", payload: userText ?? "" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: VF_API_KEY,            // if you ever get 401, try: `Bearer ${VF_API_KEY}`
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

  const bodyText = await res.text();
  let body;
  try { body = JSON.parse(bodyText); } catch { body = bodyText; }

  if (!res.ok) {
    console.error("Voiceflow error:", res.status, body);
    throw new Error(`Voiceflow API ${res.status}`);
  }

  // Voiceflow still returns an ARRAY of traces here
  return body;
}



function mapTracesToWhatsApp(traces) {
  const outputs = [];
  if (!Array.isArray(traces)) return outputs;

  for (const t of traces) {
    if (!t) continue;

    // Handle text or speak traces
    if ((t.type === "text" || t.type === "speak") && t.payload?.message) {
      outputs.push({
        type: "text",
        text: { preview_url: false, body: String(t.payload.message).slice(0, 4096) }
      });
      continue;
    }

    // Handle choice traces with multiple possible payload shapes
    if (t.type === "choice" && t.payload) {
      const p = t.payload || {};

      // Variations we’ve seen: choices[], buttons[], options[]
      const list =
        Array.isArray(p.choices) ? p.choices :
        Array.isArray(p.buttons) ? p.buttons :
        Array.isArray(p.options) ? p.options :
        [];

      // If no list, skip
      if (!list.length) continue;

      // Extract a prompt from common fields
      const prompt =
        String(p.prompt || p.text || p.message || "Elige una opción:").slice(0, 1024);

      // Convert to WA buttons (max 3)
      const buttons = list.slice(0, 3).map((item, i) => {
        const id =
          String(item.id || item.name || item.value || item.label || `btn_${i}`).slice(0, 256);
        const title =
          String(item.title || item.label || item.name || `Opción ${i + 1}`).slice(0, 20);

        return {
          type: "reply",
          reply: { id, title }
        };
      });

      // Only push if we actually have at least 1 button
      if (buttons.length) {
        outputs.push({
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: prompt },
            action: { buttons }
          }
        });
      }
    }
  }

  return outputs;
}



module.exports = {
  sendToVoiceflow,
  mapTracesToWhatsApp,
  launchVoiceflow,   // <-- ensure this line is present
};