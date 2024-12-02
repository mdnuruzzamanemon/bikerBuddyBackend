const express = require('express');
const {protectRoute} = require('../middleware/protectRoute');
const { createOrFetchConversation } = require('../controllers/conversationController');
const router = express.Router();

router.post('/conversations', protectRoute, createOrFetchConversation);

module.exports = router;
