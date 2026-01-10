const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const authenticateToken = (req, res, next) => {
  // read token from cookie
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      user_id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message:
        err.name === 'TokenExpiredError'
          ? 'Session expired'
          : 'Invalid token',
    });
  }
};

module.exports = authenticateToken;
