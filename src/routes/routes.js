const express = require("express");
const router = express.Router();
const whatsAppController = require("../controllers/whatsappcontrollers");

router.get("/", whatsAppController.verifyToken);
router.post("/", whatsAppController.messageReceived);

module.exports = router;