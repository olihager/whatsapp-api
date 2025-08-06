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
    var messageObject = value["messages"];

    // ✅ Shows up in Render dashboard
    console.log("✅ Webhook triggered");
    console.log(JSON.stringify(messageObject, null, 2));

    var messages = messageObject[0];
    var text = GetTestUser(messages);
    console.log(text);
    res.send("Event Received");
  }catch(e){
    myConsole.log(e);
    res.send("Event Received");

  }
  
  };



  function GetTestUser(messages) {
    var text = "";
    var typeMessage = messages["type"];

    if (typeMessage == text) {

      text = (messages["text"])["body"];

    } else if(typeMessage == "interactive") {
      var interactiveObject = messages["interactive"];
      var typeInteractive = interactiveObject["type"];
      myConsole.log(interactiveObject);
      console.log(interactiveObject); 

      if(typeInteractive == "button_reply"){

        text = (interactiveObject[button_reply])[title];

      }else if(typeInteractive == "list_reply") {

        
        text = (interactiveObject[list_reply])[title];

      } else {
        
        myConsole.log("sin mensaje");
        console.log("sin mensaje");
      }

    } else {
        myConsole.log("sin mensaje");
        console.log("sin mensaje");
    }
    return text;
  } 

module.exports = {
  verifyToken,
  messageReceived
};