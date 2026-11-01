const jwt = require('jsonwebtoken');
const { User } = require('./models');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function loadUser(req) {
  const token = req.cookies && req.cookies.token;
  if (!token) return null;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(id).select('-password');
  } catch { return null; }
}

const auth = wrap(async (req, res, next) => {
  const user = await loadUser(req);
  if (!user) return res.status(401).json({ error: 'Please log in' });
  req.user = user; next();
});

const admin = (req, res, next) =>
  req.user && req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access only' });

// Redirects browsers to login for protected HTML pages
const pageGuard = role => wrap(async (req, res, next) => {
  const user = await loadUser(req);
  if (!user) return res.redirect('/login.html');
  if (role && user.role !== role) return res.redirect('/');
  next();
});

module.exports = { wrap, auth, admin, pageGuard };
