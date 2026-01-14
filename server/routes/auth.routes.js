const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const authenticateToken = require('../Middlewares/auth');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// multer config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only images allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter
});

module.exports = (pool) => {

  // register
  router.post('/register', upload.single('profile_photo'), async (req, res, next) => {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        phone_number,
        city,
        country,
        additional_info
      } = req.body;
      
      console.log(req.body);

      if (!email || !password || !first_name) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing'
        });
      }

      const [existing] = await pool.query(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existing.length) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      const password_hash = await bcrypt.hash(password, 12);
      const profile_photo = req.file ? `/uploads/${req.file.filename}` : null;

      const [result] = await pool.query(
        `INSERT INTO users
        (first_name, last_name, email, password_hash, phone_number, city, country, profile_photo, additional_info)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name,
          last_name,
          email,
          password_hash,
          phone_number,
          city,
          country,
          profile_photo,
          additional_info,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user_id: result.insertId
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });

  // login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password required'
        });
      }

      const [users] = await pool.query(
        `SELECT user_id, first_name, last_name, email, password_hash, profile_photo
         FROM users WHERE email = ?`,
        [email]
      );

      if (!users.length) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        {
          id: user.user_id,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
          success: true,
          user: {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            profile_photo: user.profile_photo,
          },
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  });
  
  // logout
  router.post('/logout', (req, res) => {
    res.clearCookie('token',{
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });

  // session status (used by useAuth in frontend to restore session) 
  router.get('/status', authenticateToken, (req, res) => {
    // console.log('status route hit');
    res.json({
      authenticated: true,
      user: req.user,
    });
  });

   return router;
};