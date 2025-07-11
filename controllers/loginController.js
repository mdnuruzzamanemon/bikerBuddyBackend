const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const path = require('path');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const authToken = process.env.COOKIE_NAME;
const COOKIE_EXPIRY = parseInt(process.env.COOKIE_EXPIRY, 10);

// Login Controller
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username, avatar: user.avatar }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Set cookie
    res.cookie(authToken, token, {
      httpOnly: true,
      maxAge: COOKIE_EXPIRY,
    });

    // Check if request accepts JSON (from fetch API) or prefers HTML (from form submit)
    const acceptsJson = req.headers['content-type'] === 'application/json';
    
    if (acceptsJson) {
      return res.status(200).json({ message: 'Login successful', redirectUrl: '/inbox' });
    } else {
      // Redirect to inbox for traditional form submission
      return res.redirect('/inbox');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Logout Controller
exports.logout = (req, res) => {
  res.clearCookie(authToken);
  res.redirect('/');
};

