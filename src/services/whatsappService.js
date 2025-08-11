const https = require("https");
const { type } = require("os");

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

 /*   function sendMessageWhatsApp(textResponse, number) {

        const data = JSON.stringify( {
    "messaging_product": "whatsapp",    
    "recipient_type": "individual",
    "to": number,
    "type": "text",
    "text": {
        "preview_url": false,
        "body": textResponse
    }});

/*const options = {
    host: "graph.facebook.com",
    path: `/v22.0/${PHONE_NUMBER_ID}/messages`,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`
    }
};

 /*   const req = https.request(options, res => {
        res.on("data", d=> {
            process.stdout.write(d);
        })
    });

        req.on("error", error => {
            console.error(error);
        });

        req.write(data);
        req.end(); 
    }*/

 

    const https = require("https");

function sendMessageWhatsApp(textResponse, number) {
  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

  // sanity log
  console.log("➡️ Sending to:", number);
  console.log("➡️ Using PHONE_NUMBER_ID:", PHONE_NUMBER_ID);

  const data = JSON.stringify({
    messaging_product: "whatsapp",
    to: number, // E.164, same as messages[0].from
    type: "text",
    text: { preview_url: false, body: textResponse }
  });

  const options = {
    host: "graph.facebook.com",
    path: `/v22.0/${PHONE_NUMBER_ID}/messages`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",          // fixed
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Length": Buffer.byteLength(data)    // add this
    }
  };

  const req = https.request(options, (res) => {
    let buf = "";
    res.on("data", (d) => (buf += d));
    res.on("end", () => {
      console.log("WA SEND status:", res.statusCode);
      console.log("WA SEND body:", buf); // SUCCESS shows {"messages":[{"id":"..."}]}
    });
  });

  req.on("error", (err) => console.error("WA SEND failed:", err));
  req.write(data);
  req.end();
}
    

   module.exports = {
        sendMessageWhatsApp
    } 