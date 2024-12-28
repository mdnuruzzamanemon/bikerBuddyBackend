const express = require('express');
const {protectRoute} = require('../middleware/protectRoute');
const { createOrFetchConversation, getMessages, sendMessage } = require('../controllers/conversationController');
const router = express.Router();

router.post('/conversations', protectRoute, createOrFetchConversation);

router.get("/inbox/messages/:conversation_id", protectRoute, getMessages);
router.post("/inbox/message", protectRoute, sendMessage);


module.exports = router;
