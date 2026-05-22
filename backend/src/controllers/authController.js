const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '30d' });
};

// @desc    Register a new user
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide all fields');
    }

    const userExists = await User.findOne({ email: String(email) });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email: String(email) });

    if (userExists && (await userExists.matchPassword(password))) {
      res.json({
        _id: userExists.id,
        name: userExists.name,
        email: userExists.email,
        token: generateToken(userExists._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
const logoutUser = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current logged in user data
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    // req.user is securely attached by the authMiddleware before this function even runs!
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      // Format the date nicely for the frontend Profile UI
      joinDate: new Date(req.user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    };

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe };