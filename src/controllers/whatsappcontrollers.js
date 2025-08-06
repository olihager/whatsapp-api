const fs = require("fs");
const { title } = require("process");
const myConsole = new console.Console(fs.createWriteStream("./logs.txt"));


console.log("✅ THIS IS THE CLEANED CONTROLLER");

const verifyToken = (req, res) => {
  

            try {

              var accessToken = "ringoringo1232";
              var token = req.query["hub.verify_token"];
              var challenge = req.query["hub.challenge"];

              if (challenge != null && token != null && token == accessToken){
                res.send(challenge);
              }else {
                res.status(400).send();
              }
              
            } catch (error) {
              res.status(400).send();
            }

  
};

const messageReceived = (req, res) => {
  try{
    var entry = (req.body["entry"])[0];
    var changes = (entry["changes"])[0];
    var value = changes["value"];
    const messageObject = value["messages"];
    const messages = messageObject[0];

    console.log("📦 Full message object:", JSON.stringify(messages, null, 2));

    const text = GetTestUser(messages);
    console.log("✅ Final extracted text:", text);

    
    res.send("Event Received");
  }catch(e){
    myConsole.log(e);
    res.send("Event Received");

  }
  
  };



 /* function GetTestUser(messages) {
    var text = "";
    var typeMessage = messages["type"];

    if (typeMessage === text) {

      text = (messages["text"])["body"];

    } else if(typeMessage === "interactive") {
      var interactiveObject = messages["interactive"];
      var typeInteractive = interactiveObject["type"];
      myConsole.log(interactiveObject);
      console.log(interactiveObject); 

      if(typeInteractive === "button_reply"){

        text = (interactiveObject["button_reply"])[title];

      }else if(typeInteractive === "list_reply") {

        
        text = (interactiveObject["list_reply"])[title];

      } else {
        
        myConsole.log("sin mensaje");
        console.log("sin mensaje");
      }

    } else {
        myConsole.log("sin mensaje");
        console.log("sin mensaje");
    }
    return text;
  }*/ 


  function GetTestUser(messages) {
  let text = "";
  const typeMessage = messages["type"];

  console.log("📌 Detected message type:", typeMessage);

  if (typeMessage === "text") {
    // ✅ This should work if it's a regular message
    text = messages["text"]["body"];
    console.log("💬 Text message body:", text);
  } else if (typeMessage === "interactive") {
    const interactiveObject = messages["interactive"];
    const typeInteractive = interactiveObject["type"];

    console.log("🟡 Interactive message object:", interactiveObject);

    if (typeInteractive === "button_reply") {
      text = interactiveObject["button_reply"]["title"];
    } else if (typeInteractive === "list_reply") {
      text = interactiveObject["list_reply"]["title"];
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