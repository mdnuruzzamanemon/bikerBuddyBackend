const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
      conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
      },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Sender reference
      content: { type: String }, // Message text
      attachment: { type: String }, // Optional attachment URL
      sentAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Message", messageSchema);
  