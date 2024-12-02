const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const conversationRoutes = require("./routes/conversationRoutes");
require('dotenv').config();
require('./config');
// const http = require('http');
// const socketIO = require('socket.io');
// const Conversation = require('./models/conversation');

const app = express();
// const server = http.createServer(app);
// const io = socketIO(server);

// Middleware
app.use(cookieParser());

// databse
mongoose.connect(process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
  .then(() => {
    console.log('MongoDB connected...');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Socket.IO connection handling
// const connectedUsers = new Map();

// io.on('connection', (socket) => {
//   socket.on('user_connected', (userId) => {
//     connectedUsers.set(userId, socket.id);
//   });

//   socket.on('send_message', async (data) => {
//     try {
//       const conversation = await Conversation.findById(data.conversationId);
//       if (!conversation) return;

//       const newMessage = {
//         sender: data.senderId,
//         content: data.content,
//         timestamp: new Date()
//       };

//       conversation.messages.push(newMessage);
//       conversation.lastMessage = new Date();
//       await conversation.save();

//       // Send to all participants
//       conversation.participants.forEach((participantId) => {
//         const socketId = connectedUsers.get(participantId.toString());
//         if (socketId) {
//           io.to(socketId).emit('receive_message', {
//             conversationId: conversation._id,
//             message: newMessage
//           });
//         }
//       });
//     } catch (error) {
//       console.error('Message sending error:', error);
//     }
//   });

//   socket.on('disconnect', () => {
//     for (const [userId, socketId] of connectedUsers.entries()) {
//       if (socketId === socket.id) {
//         connectedUsers.delete(userId);
//         break;
//       }
//     }
//   });
// });

// Routes
// app.get('/', (req, res) => {
//   const token = req.cookies[process.env.COOKIE_NAME];
//   if (token) {
//     try {
//       jwt.verify(token, process.env.JWT_SECRET);
//       return res.redirect('/inbox');
//     } catch (err) {
//       console.error('Invalid token:', err);
//     }
//   }
//   res.render('index', { title: 'Welcome to Biker Buddy' });
// });



// app.get('/signup', (req, res) => {
//   res.render('signup', { title: 'Sign Up - Biker Buddy' });
// });

app.use('/', authRoutes);
app.use('/', conversationRoutes);





const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
