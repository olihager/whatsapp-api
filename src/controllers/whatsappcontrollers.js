const fs = require("fs");
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

    myConsole.log(messageObject);

    res.send("Event Received");
  }catch(e){
    myConsole.log(e);
    res.send("Event Received");

  }
  
  };

module.exports = {
  verifyToken,
  messageReceived
};