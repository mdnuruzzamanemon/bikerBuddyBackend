const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");

// Get conversations for logged-in user
router.get("/", conversationController.getConversations);

// Add or activate a conversation
router.post("/", conversationController.addOrActivateConversation);

// Delete a conversation
router.delete("/:conversationId", conversationController.deleteConversation);

module.exports = router;
