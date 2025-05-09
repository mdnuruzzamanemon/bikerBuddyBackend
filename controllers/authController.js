const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Temporary in-memory store for OTPs
const otpStore = {};

// Transporter configuration for sending emails
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service (e.g., Gmail, SMTP)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to remove avatar file
const removeAvatarFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error removing avatar file:', err);
  }
};

// Signup process
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      // Remove avatar file if signup fails
      if (req.file) {
        const avatarPath = path.resolve('public', 'uploads', 'avatars', req.file.filename);
        removeAvatarFile(avatarPath);
      }
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

    // Store OTP and user data temporarily
    otpStore[email] = {
      otp,
      userData: {
        username,
        email,
        password,
        avatar: req.file ? `/uploads/avatars/${req.file.filename}` : null,
      },
      createdAt: Date.now(), // Store OTP creation time
    };

    // Send OTP to the user's email
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: 'Your OTP for Signup',
    //   text: `Your OTP for completing the signup process is: ${otp}. It is valid for 10 minutes.`,
    // };
    const mailOptions = {
      from: `"Let's Chat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Signup',
      text: `Your OTP for completing the signup process is: ${otp}. It is valid for 10 minutes.`,
      html: `
        <p>Your OTP for completing the signup process is: 
          <strong style="color: #2E86C1; font-size: 18px;">${otp}</strong>.
        </p>
        <p>It is valid for <strong>10 minutes</strong>.</p>
      `
    };
    

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email. Please verify to complete signup.' });
  } catch (error) {
    console.error('Error during signup:', error);

    // Remove avatar file in case of server error
    if (req.file) {
      const avatarPath = path.resolve('public', 'uploads', 'avatars', req.file.filename);
      removeAvatarFile(avatarPath);
    }

    res.status(500).json({ error: 'Server error, please try again later.' });
  }
};

// OTP Verification
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists
    const storedOtp = otpStore[email];
    if (!storedOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if OTP is expired (10 minutes = 600,000 milliseconds)
    const currentTime = Date.now();
    if (currentTime - storedOtp.createdAt > 600000) {
      // Remove avatar file if signup fails due to OTP expiration
      const avatarPath = storedOtp.userData.avatar
        ? path.resolve( 'public', storedOtp.userData.avatar)
        : null;
      removeAvatarFile(avatarPath);

      delete otpStore[email]; // Remove expired OTP
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check if OTP matches
    if (storedOtp.otp !== otp) {
      return res.status(400).json({ error: 'Incorrect OTP' });
    }

    // OTP is valid, create user
    const { username, password, avatar } = storedOtp.userData;
    const newUser = new User({
      username,
      email,
      password, // Password is hashed before saving in the User model
      avatar,
    });
    await newUser.save();

    // Remove OTP from store after successful verification
    delete otpStore[email];

    res.status(201).json({ message: 'Signup successful!' });
  } catch (error) {
    console.error('Error during OTP verification:', error);

    // Remove avatar file in case of server error
    const storedOtp = otpStore[req.body.email];
    if (storedOtp && storedOtp.userData.avatar) {
      const avatarPath = path.resolve('src', 'public', storedOtp.userData.avatar);
      removeAvatarFile(avatarPath);
    }

    res.status(500).json({ error: 'Server error, please try again later.' });
  }
};
