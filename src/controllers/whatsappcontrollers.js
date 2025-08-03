console.log("✅ THIS IS THE CLEANED CONTROLLER");

const verifyToken = (req, res) => {
  console.log("✅ verifyToken was hit");
  res.send("✅ FROM verifyToken in controller");
};

const messageReceived = (req, res) => {
  res.send("✅ POST received yes yes");
};

module.exports = {
  verifyToken,
  messageReceived
};