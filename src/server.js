const http = require('http');
const socketIo = require('socket.io');
const app = require('./app'); // Your Express app
const Conversation = require('./models/conversation');

const server = http.createServer(app);
const io = socketIo(server);

// Attach Socket.IO to the request object
app.use((req, res, next) => {
    req.io = io;
    next();
  });

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for a new message event
  socket.on('newMessage', async (conversationId) => {
    try {
      const updatedConversation = await Conversation.findById(conversationId).populate('messages');
      io.emit('updateConversation', updatedConversation); // Broadcast the updated conversation
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
