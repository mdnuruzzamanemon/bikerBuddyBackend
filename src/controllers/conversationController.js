const Conversation = require("../models/conversation");


exports.createOrFetchConversation = async (req, res) => {

  try {
    const currentUserId = req.user._id; // Assuming req.user contains the logged-in user
    const { participantId } = req.body;
    // Check if a conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId] },
    }).populate('participants', 'username avatar');

    if (!conversation) {
      // Create a new conversation if it doesn't exist
      conversation = new Conversation({
        participants: [currentUserId, participantId],
        lastModified: Date.now(),
      });

      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error in createOrFetchConversation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
