const User = require('../models/User');

exports.searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const currentUser = req.user.username;

    if (!searchQuery) {
      return res.json([]);
    }

    const users = await User.find({
      username: { 
        $regex: searchQuery, 
        $options: 'i',
        $ne: currentUser // Exclude current user
      }
    })
    .select('username avatar')
    .limit(5);

    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}; 