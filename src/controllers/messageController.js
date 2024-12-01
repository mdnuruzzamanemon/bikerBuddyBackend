exports.getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.params;
    const currentUserId = req.user.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId] }
    })
    .populate('participants', 'username avatar _id')
    .populate('messages.sender', 'username avatar _id');

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUserId, participantId],
        messages: []
      });
      await conversation.save();
      await conversation.populate('participants', 'username avatar _id');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({ error: 'Failed to get or create conversation' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'username avatar _id')
    .populate('messages.sender', 'username avatar _id')
    .sort({ lastMessage: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}; 