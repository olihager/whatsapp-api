    const https = require("https");
const { type } = require("os");

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
        path: "/v22.0/658914070648187/messages",
        method: "POST",
        body: data,
        headers: {
            "Content-Type":"application/json",
            Authorization: "Bearer EAASLem8mvQwBPJBa2kH5Q6A4k62PZC0us07aZCtv5pMUPf4SXTMNAOGZBZC8tjWLbMZBdispl0lu5NEOcJ36GL2vAvXSVHezAENaRpAwX6ZAYCBPbSJ9KKobod5GsrjStdDrbaCUPUVCGTz2Xvv7wSsdlQx10rnMtbdqZBK2PauKs5mWZALZBOmcso0zAdFpwGACvRDpCqZB0dy5Frm80jZCJacriJGvBHs6AMkskoTuHrobK8ZD" 
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