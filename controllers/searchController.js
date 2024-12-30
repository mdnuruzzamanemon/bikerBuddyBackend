const User = require('../models/User');

// Search for users based on the query
exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    // Return an empty response if the query is empty
    if (!query) {
      return res.json([]);
    }

    // Find users whose username or email matches the query (case-insensitive)
    const users = await User.find(
      { 
        $or: [
          { username: { $regex: query, $options: 'i' } }, 
          { email: { $regex: query, $options: 'i' } }
        ] 
      },
      'username email avatar' // Only return these fields
    );

    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
