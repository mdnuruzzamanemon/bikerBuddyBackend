const Conversation = require("../models/conversation");

exports.createOrFetchConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Assuming req.user contains the logged-in user
    const { participantId } = req.body;

    // Check if a conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId] },
    }).populate("participants", "username avatar");

    if (conversation) {
      // Update the lastModified time
      conversation.lastModified = Date.now();
      await conversation.save();
    } else {
      // Create a new conversation if it doesn't exist
      conversation = new Conversation({
        participants: [currentUserId, participantId],
        lastModified: Date.now(),
      });

      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error in createOrFetchConversation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const currentUserId = req.user.id; // Assuming req.user contains the logged-in user

    // Find conversations where the logged-in user is a participant
    const conversations = await Conversation.find({
      participants: { $in: [currentUserId] },
    })
      .populate("participants", "username avatar") // Populate participant details
      .sort({ lastModified: -1 }); // Sort by lastModified date in descending order

    // Pass conversations to locals for rendering
    res.locals.conversations = conversations;
    res.render('inbox', { 
      title: 'Inbox - Biker Buddy', 
      user: req.user,
      conversations: conversations,
      activeConversation: null
    });
  } catch (error) {
    console.error("Error in getConversation:", error);
    res.render('inbox', { 
      title: 'Inbox - Biker Buddy', 
      user: req.user,
      conversations: [],
      activeConversation: null
    });
    next(error); // Pass error to the error-handling middleware
  }
};

