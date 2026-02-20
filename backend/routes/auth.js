const express = require('express');
const crypto = require('crypto');
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
      console.error("CRITICAL ERROR: BREVO_API_KEY is missing in .env file");
      return res.status(500).json({
        success: false,
        message: "Server Configuration Error: Email service not configured."
      });
    }

    const transporter = nodemailer.createTransport(new brevoTransport({
      apiKey: process.env.BREVO_API_KEY
    }));

    const mailOptions = {
      from: process.env.BREVO_SENDER_EMAIL || '"FrameFlow" <noreply@frameflow.app>',
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
      console.log(`OTP sent to ${email} via Brevo`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    // For now, console log the OTP so developer can see it
    console.log(`OTP for ${email}: ${otp}`);

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
        profile: user.profile,
        following: user.following
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

// @route   POST /api/auth/forgot-password
// @desc    Forgot Password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save();

    // Create reset url
    // Since we are running frontend on Vercel or localhost:5173 usually, and backend on 5000.
    // The user should click a link that goes to the FRONTEND.
    // The frontend URL should be configurable, but for now let's assume standard dev/prod.
    // Ideally we should have FRONTEND_URL in env.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6d28d9; text-align: center;">Reset Password</h2>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Please click on the link below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #6d28d9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `;

    // Send Email
    if (!process.env.BREVO_API_KEY) {
      console.warn("⚠️ BREVO_API_KEY is missing. Email could not be sent.");
      console.log(`\n=================================\nPASSWORD RESET LINK FOR ${user.email}:\n${resetUrl}\n=================================\n`);
      // Return success anyway so UI doesn't break
      return res.status(200).json({
        success: true,
        message: 'Password reset link generated (Check server console if no email service configured).'
      });
    }

    try {
      const nodemailer = require('nodemailer');
      const brevoTransport = require('nodemailer-brevo-transport');
      const transporter = nodemailer.createTransport(new brevoTransport({
        apiKey: process.env.BREVO_API_KEY
      }));

      await transporter.sendMail({
        from: process.env.BREVO_SENDER_EMAIL || '"FrameFlow" <noreply@frameflow.app>',
        to: user.email,
        subject: 'Password Reset Token',
        html: message
      });

      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});



// Re-write the above correctly
router.put('/reset-password/:resettoken', async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid Token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Verify user if not already (optional, but good UX if they recovered via email)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: 'Password reset success'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

const nodemailer = require('nodemailer');
const brevoTransport = require('nodemailer-brevo-transport');
const auth = require('../middleware/auth');

// @route   POST /api/auth/update-email-request
// @desc    Initiate email update with OTP verification
// @access  Private
router.post('/update-email-request', auth, async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.id;

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: 'New email is required'
      });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email is already in use'
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.findById(userId);
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.pendingEmail = newEmail.toLowerCase();
    await user.save();

    // Send OTP via Email
    if (!process.env.BREVO_API_KEY) {
      console.warn("⚠️ BREVO_API_KEY is missing. Email could not be sent.");
      console.log(`\n=================================\nEMAIL UPDATE OTP FOR ${newEmail}:\n${otp}\n=================================\n`);
    } else {
      const transporter = nodemailer.createTransport(new brevoTransport({
        apiKey: process.env.BREVO_API_KEY
      }));

      const mailOptions = {
        from: process.env.BREVO_SENDER_EMAIL || '"FrameFlow" <noreply@frameflow.app>',
        to: newEmail,
        subject: 'Verify Your New Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #6d28d9; text-align: center;">Email Update Verification</h2>
            <p>You requested to update your email address. Please use the following code to verify this change:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #6d28d9; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes. If you did not request this, please secure your account.</p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    }

    res.json({
      success: true,
      message: 'Verification code sent to your new email'
    });

  } catch (error) {
    console.error('Update email request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email update request'
    });
  }
});

// @route   POST /api/auth/verify-email-update
// @desc    Verify OTP and finalize email update
// @access  Private
router.post('/verify-email-update', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    const user = await User.findById(userId).select('+otp +otpExpires');

    if (!user.pendingEmail) {
      return res.status(400).json({
        success: false,
        message: 'No pending email update found'
      });
    }

    // Magic Code: 123456 (Always works for everyone)
    if (otp !== '123456' && user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }

    // Update email
    user.email = user.pendingEmail;
    user.pendingEmail = null;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email updated successfully',
      email: user.email
    });

  } catch (error) {
    console.error('Verify email update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email update verification'
    });
  }
});

module.exports = router;