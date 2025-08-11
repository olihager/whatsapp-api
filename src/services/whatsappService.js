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
            Authorization: "Bearer EAASLem8mvQwBPILeqwPrmqW49ZAWZBfuVdkPmlfi6jHp20LZCK4Vt7FFGlOTxSM1SZC27FfC7NrrZAomdu6mrhEVVzYX3bvYTifYRq6gwwuD0EH2HaHSZAyDAKvXibNHI6D4FdBoQrOZBSGEcbclLERPC4ZAkXBwTBuMdDrEzZBxSMDmZBcZByuXiFe6i4VblU5zSJs3ZCtAbeMHaDXLZABIk9n9WKrHJZCbVOSwVc8as4vAjHn3YZD" 
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