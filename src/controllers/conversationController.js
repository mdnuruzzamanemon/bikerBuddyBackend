const Conversation = require("../models/conversation");
const Message = require('../models/message');

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

// exports.getMessages = async (req, res, next) => {
//   try {
//     const messages = await Message.find({
//       conversation_id: req.params.conversation_id,
//     }).sort("-createdAt");

//     const { participant } = await Conversation.findById(req.params.conversation_id);

//     res.status(200).json({
//       data: {
//         messages,
//         participant,
//       },
//       user: req.user.userid,
//       conversation_id: req.params.conversation_id,
//     });
//   } catch (err) {
//     res.status(500).json({ errors: { common: { msg: "Unknown error occurred!" } } });
//   }
// };

// exports.sendMessage = async (req, res, next) => {
//   if (req.body.message || (req.files && req.files.length > 0)) {
//     try {
//       let attachments = null;
//       if (req.files && req.files.length > 0) {
//         attachments = req.files.map((file) => file.filename);
//       }

//       const newMessage = new Message({
//         text: req.body.message,
//         attachment: attachments,
//         sender: {
//           id: req.user.userid,
//           name: req.user.username,
//           avatar: req.user.avatar || null,
//         },
//         receiver: {
//           id: req.body.receiverId,
//           name: req.body.receiverName,
//           avatar: req.body.avatar || null,
//         },
//         conversation_id: req.body.conversationId,
//       });

//       const result = await newMessage.save();

//       // Emit socket event
//       io.to(req.body.conversationId).emit("new_message", {
//         message: {
//           conversation_id: req.body.conversationId,
//           sender: req.user,
//           message: req.body.message,
//           attachment: attachments,
//           date_time: result.date_time,
//         },
//       });

//       res.status(200).json({ message: "Successful!", data: result });
//     } catch (err) {
//       res.status(500).json({ errors: { common: { msg: err.message } } });
//     }
//   } else {
//     res.status(500).json({ errors: { common: "Message text or attachment is required!" } });
//   }
// }




exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversation_id })
      .sort({ createdAt: -1 }) // Sort messages by newest first
      .populate('sender', 'username avatar'); // Populate sender details

    const conversation = await Conversation.findById(req.params.conversation_id)
      .populate('participants', 'username avatar');

    if (!conversation) {
      return res.status(404).json({
        errors: { common: { msg: "Conversation not found!" } },
      });
    }

    const participant = conversation.participants.find(
      (participant) => participant._id.toString() !== req.user.id
    );

    res.status(200).json({
      data: {
        messages,
        participant,
      },
      user: req.user.id,
      conversation_id: req.params.conversation_id,
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "An unknown error occurred!",
        },
      },
    });
  }
};



exports.sendMessage = async (req, res) => {
  if (req.body.content ) {
    try {
      // Process attachments if any
      let attachment = null;

      if (req.files && req.files.length > 0) {
        attachment = req.files.map((file) => file.filename);
      }

      // Create new message
      const newMessage = new Message({
        conversation: req.body.conversationId,
        sender: req.user.id,
        content: req.body.content,
        attachment,
      });

      const result = await newMessage.save();

      // Update conversation with the new message
      await Conversation.findByIdAndUpdate(req.body.conversationId, {
        $push: { messages: result._id },
        lastModified: Date.now(),
      });

      // Emit socket event to notify clients of a new message
      global.io.emit("new_message", {
        message: {
          conversation: req.body.conversationId,
          sender: {
            id: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar || null,
          },
          content: req.body.content,
          attachment: attachment,
          sentAt: result.createdAt,
        },
      });

      res.status(200).json({
        message: "Message sent successfully!",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: err.message,
          },
        },
      });
    }
  } else {
    res.status(400).json({
      errors: {
        common: {
          msg: "Message text or attachment is required!",
        },
      },
    });
  }
};
