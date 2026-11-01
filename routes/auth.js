const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { wrap, auth } = require('../middleware');
const sendMail = require('../utils/mail');

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/;

function setCookie(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 864e5 });
}
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', wrap(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (name.length < 2 || name.length > 60) return res.status(400).json({ error: 'Name must be 2-60 characters' });
  if (!emailRe.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
  if (!passRe.test(password)) return res.status(400).json({ error: 'Password needs 8+ characters with uppercase, lowercase and a number' });
  if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  setCookie(res, user);
  sendMail(email, 'Welcome to ShopSphere', `Hi ${name},\n\nYour account has been created. Happy shopping!`);
  res.status(201).json({ user: pub(user) });
}));

router.post('/login', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password)))
    return res.status(401).json({ error: 'Invalid email or password' });
  setCookie(res, user);
  res.json({ user: pub(user) });
}));

router.post('/logout', (req, res) => { res.clearCookie('token'); res.json({ ok: true }); });
router.get('/me', auth, (req, res) => res.json({ user: pub(req.user) }));

module.exports = router;
