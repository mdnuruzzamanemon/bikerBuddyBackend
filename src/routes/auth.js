const express = require('express');
const { validateSignup } = require('../middleware/validateSignup');
const { signup, verifyOtp } = require('../controllers/authController');
const { login, logout } = require('../controllers/loginController');
const { protectRoute, redirectIfAuthenticated } = require('../middleware/protectRoute');
const upload = require('../middleware/uploadAvatar');
const { searchUsers } = require('../controllers/searchController');
const Conversation = require("../models/conversation");


const router = express.Router();


// Root route with redirection for authenticated users
router.get('/', redirectIfAuthenticated, (req, res) => {
  res.render('index', { title: 'Welcome to Biker Buddy' });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up - Biker Buddy' });
});

// signUp route
router.post('/signup', (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, validateSignup, signup);

router.post('/verify-otp', verifyOtp);


// Login and logout routes
router.post('/', login);
router.get('/logout', logout);

// Protected route
router.get('/inbox', protectRoute, async (req, res) => {
  try {
    // Fetch conversations for the current user
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'username avatar')
    .sort({ lastModified: -1 });

    res.render('inbox', { 
      title: 'Inbox - Biker Buddy', 
      user: req.user,
      conversations: conversations,
      activeConversation: null
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.render('inbox', { 
      title: 'Inbox - Biker Buddy', 
      user: req.user,
      conversations: [],
      activeConversation: null
    });
  }
});

// Add a search route
router.get('/search', protectRoute, searchUsers);


module.exports = router;
