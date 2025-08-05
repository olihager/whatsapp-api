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
  res.send("✅ POST received yes yes");
};

module.exports = {
  verifyToken,
  messageReceived
};