// ---- add this to src/services/voiceflowService.js ----
/*async function launchVoiceflow(userId, variables = {}) {
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
}*/






async function sendToVoiceflow(userId, userText, variables = {}) {
  const VERSION_ID = process.env.VOICEFLOW_VERSION_ID;
  const VF_API_KEY = process.env.VOICEFLOW_API_KEY;

  if (!VERSION_ID || !VF_API_KEY) {
    throw new Error("VOICEFLOW_VERSION_ID or VOICEFLOW_API_KEY is missing");
  }

  const url = `https://general-runtime.voiceflow.com/state/${encodeURIComponent(VERSION_ID)}/user/${encodeURIComponent(userId)}/interact`;

  const payload = { type: "text", payload: userText ?? "" };

  console.log("📤 Sending to Voiceflow");
  console.log({
    userId,
    userText,
    url,
    payload,
    metadata: {
      locale: variables.locale || "es-AR",
      channel: "whatsapp",
      phone: variables.phone || userId
    }
  });

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

  const bodyText = await res.text();
  let body;
  try { body = JSON.parse(bodyText); } catch { body = bodyText; }

  console.log("✅ Voiceflow responded:");
  console.dir(body, { depth: null });

  if (!res.ok) {
    console.error("❌ Voiceflow error:", res.status, body);
    throw new Error(`Voiceflow API ${res.status}`);
  }

  return body;
}



/*async function deleteUserSession(userId) {
  const VF_API_KEY = process.env.VOICEFLOW_API_KEY;
  const url = `https://general-runtime.voiceflow.com/state/user/${encodeURIComponent(userId)}/interactions`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: VF_API_KEY,
        "Content-Type": "application/json"
      }
    });

    if (res.status === 404) {
      console.warn("🟡 No existing session to delete (already cleared).");
      return;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to delete session: ${res.status} - ${body}`);
    }

    console.log("✅ Voiceflow session deleted.");
  } catch (err) {
    console.error("❌ Error deleting user session:", err);
    throw err; // You can choose to NOT throw here if you want to ignore silently
  }
}*/




function mapTracesToWhatsApp(traces) {
  const outputs = [];
  if (!Array.isArray(traces)) return outputs;

  for (const t of traces) {
    if (!t) continue;

    // text / speak -> WhatsApp text
    if ((t.type === "text" || t.type === "speak") && t.payload?.message) {
      outputs.push({
        type: "text",
        text: { preview_url: false, body: String(t.payload.message).slice(0, 4096) }
      });
      continue;
    }

    // choice -> (1) text with prompt, (2) interactive buttons
    if (t.type === "choice" && t.payload) {
      const p = t.payload || {};

      // Common list shapes
      const list =
        Array.isArray(p.choices) ? p.choices :
        Array.isArray(p.buttons) ? p.buttons :
        Array.isArray(p.options) ? p.options :
        [];

      if (!list.length) continue;

      // Prompt text the user should see
      const prompt =
        String(p.prompt || p.text || p.message || "Elige una opción:").slice(0, 1024);

      // (A) Send the prompt as a separate text message FIRST
      outputs.push({
        type: "text",
        text: { preview_url: false, body: prompt }
      });

      // Build up to 3 WA buttons
      const buttons = list.slice(0, 3).map((item, i) => {
        const id =
          String(item.id || item.name || item.value || item.label || `btn_${i}`).slice(0, 256);
        const title =
          String(item.title || item.label || item.name || `Opción ${i + 1}`).slice(0, 20);
        return { type: "reply", reply: { id, title } };
      });

      // (B) Then send the interactive with a short body
      outputs.push({
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: "Selecciona una opción:" }, // short label for the buttons
          action: { buttons }
        }
      });
    }
  }

  return outputs;
}



module.exports = {
  sendToVoiceflow,
  mapTracesToWhatsApp,
  //launchVoiceflow,
  //deleteUserSession    // <-- ensure this line is present
};