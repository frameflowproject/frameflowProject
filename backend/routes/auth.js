const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Registration = require('../models/Registration');
const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// @route   POST /api/auth/register
// @desc    Register a new user and send OTP
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        const field = existingUser.email === email ? 'email' : 'username';
        return res.status(400).json({
          success: false,
          message: `User with this ${field} already exists`
        });
      } else {
        // If user exists but not verified, we can overwrite or resend OTP.
        // For simplicity, let's just delete the unverified user and create new (or update).
        // Actually, safer to just tell them to login checks verification? No, they can't login.
        // Let's delete the stale unverified user entry for now to keep it clean.
        await User.deleteOne({ _id: existingUser._id });
      }
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user (Not verified yet)
    const user = new User({
      fullName,
      username,
      email,
      password,
      otp,
      otpExpires,
      isVerified: false
    });

    await user.save();

    // Send OTP via Email using Brevo (via Nodemailer)
    const nodemailer = require('nodemailer');
    const brevoTransport = require('nodemailer-brevo-transport');

    // Check if API Key exists to prevent crash
    if (!process.env.BREVO_API_KEY) {
      console.error("❌ CRITICAL ERROR: BREVO_API_KEY is missing in .env file");
      return res.status(500).json({
        success: false,
        message: "Server Configuration Error: Email service not configured."
      });
    }

    const transporter = nodemailer.createTransport(new brevoTransport({
      apiKey: process.env.BREVO_API_KEY
    }));

    const mailOptions = {
      from: '"FrameFlow" <noreply@frameflow.app>',
      to: email,
      subject: 'Your FrameFlow Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #6d28d9; text-align: center;">Welcome to FrameFlow!</h2>
          <p style="color: #333; font-size: 16px;">
            Hi ${fullName},
          </p>
          <p style="color: #333; font-size: 16px;">
            Thank you for registering. Please use the following code to verify your email address and activate your account:
          </p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #6d28d9; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in 10 minutes. If you did not request this, please ignore this email.
          </p>
          <p style="color: #333; font-size: 16px;">
            Best regards,<br/>
            The FrameFlow Team
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`📧 OTP sent to ${email} via Brevo`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    // For now, console log the OTP so developer can see it
    console.log(`🔒 OPT for ${email}: ${otp}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP code.',
      requireVerification: true,
      email: email,
      // userId: user._id // Optional, can use email to verify
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate account
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user with this email
    // We need to select +otp and +otpExpires because they are select: false
    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified. Please login.'
      });
    }

    // Check if OTP matches
    // Magic Code: 123456 (Always works for everyone)
    if (otp !== '123456' && user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP matches
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please register again.'
      });
    }

    // Verify User
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check Verification
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address first.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;