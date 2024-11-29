const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
require('dotenv').config();
require('./config');

const app = express();

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


// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Welcome to Biker Buddy' }); // Pass variables if needed
});


app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up - Biker Buddy' });
});

app.use('/', authRoutes);






const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
