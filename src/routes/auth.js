const express = require('express');
const { validateSignup } = require('../middleware/validateSignup');
const { signup, verifyOtp } = require('../controllers/authController');
const upload = require('../middleware/uploadAvatar');

const router = express.Router();

router.post('/signup', (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, validateSignup, signup);

router.post('/verify-otp', verifyOtp);

module.exports = router;
