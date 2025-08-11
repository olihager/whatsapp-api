const https = require("https");
const { type } = require("os");

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

    function sendMessageWhatsApp(textResponse, number) {

        const data = JSON.stringify( {
    "messaging_product": "whatsapp",    
    "recipient_type": "individual",
    "to": number,
    "type": "text",
    "text": {
        "preview_url": false,
        "body": textResponse
    }});

const options = {
    host: "graph.facebook.com",
    path: `/v22.0/${PHONE_NUMBER_ID}/messages`,
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`
    }
};

    const req = https.request(options, res => {
        res.on("data", d=> {
            process.stdout.write(d);
        })
    });

        req.on("error", error => {
            console.error(error);
        });

        req.write(data);
        req.end(); 
    }

    module.exports = {
        sendMessageWhatsApp
    }