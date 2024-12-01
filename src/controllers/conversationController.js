const Conversation = require("../models/conversation");
const Message = require("../models/Message");

// Get all conversations for the logged-in user
exports.getConversations = async (req, res) => {
  const userId = req.user._id; // Assuming logged-in user is in req.user
  const conversations = await Conversation.find({ participants: userId })
    .sort({ lastModified: -1 })
    .populate("participants", "username") // Populate participant usernames
    .exec();
  res.json(conversations);
};

// Add a new conversation or set active
exports.addOrActivateConversation = async (req, res) => {
  const userId = req.user._id;
  const { participantId } = req.body;

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, participantId] }
  });

  if (!conversation) {
    conversation = new Conversation({
      participants: [userId, participantId]
    });
    await conversation.save();
  }

  conversation.lastModified = new Date();
  await conversation.save();

  res.json(conversation);
};

// Delete a conversation
exports.deleteConversation = async (req, res) => {
  const { conversationId } = req.params;

  await Conversation.findByIdAndDelete(conversationId);
  await Message.deleteMany({ conversation: conversationId }); // Cleanup related messages

  res.json({ success: true });
};
