const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Users in the conversation
    ],
    lastModified: { type: Date, default: Date.now }, // Used for sorting conversations
    messages: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Message" } // Reference to messages
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
