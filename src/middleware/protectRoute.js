const jwt = require('jsonwebtoken');
require('dotenv').config();

const authToken = process.env.COOKIE_NAME;

exports.protectRoute = (req, res, next) => {
  const token = req.cookies[authToken]; // Get the JWT from cookies

  if (!token) {
    console.error('No token found in cookies');
    return res.redirect('/'); // Redirect unauthenticated users to the login page
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Only include non-sensitive user data
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email, // Include email if stored in token
      avatar: decoded.avatar || '/images/user1.png', // Placeholder avatar if not available
    };

    // pass user info to response locals
    if (res.locals.html) {
      res.locals.loggedInUser = decoded;
    }
    
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Invalid token:', err.message);
    res.redirect('/'); // Redirect on invalid or expired token
  }
};


// Middleware to redirect logged-in users from the index route
exports.redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies[authToken];
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET); // Verify token
      return res.redirect('/inbox'); // Redirect to inbox if authenticated
    } catch (err) {
      console.error('Invalid or expired token:', err.message);
    }
  }
  next(); // Proceed to the next middleware or route handler
};
