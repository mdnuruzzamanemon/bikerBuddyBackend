const express = require('express');
const http = require("http");
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
const server = http.createServer(app);
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


// socket initiation
const io = require("socket.io")(server);




// Make Socket.IO globally accessible
global.io = io;

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Additional socket events can go here

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});
// socket end

app.use('/', authRoutes);
app.use('/', conversationRoutes);





const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
