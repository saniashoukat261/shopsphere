const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const applyCoupon = require('../utils/coupon');
const sendMail = require('../utils/mail');
const { wrap } = require('../middleware');

router.post('/coupons/validate', wrap(async (req, res) => {
  const r = await applyCoupon(req.body.code, Number(req.body.subtotal) || 0);
  if (r.error) return res.status(400).json({ error: r.error });
  if (!r.code) return res.status(400).json({ error: 'Enter a coupon code' });
  res.json({ code: r.code, percent: r.percent });
}));

router.post('/contact', rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: 'Too many messages, try later' } }), wrap(async (req, res) => {
  const name = String(req.body.name || '').trim(), email = String(req.body.email || '').trim(), message = String(req.body.message || '').trim();
  if (name.length < 2 || name.length > 60) return res.status(400).json({ error: 'Enter your name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' });
  if (message.length < 10 || message.length > 1500) return res.status(400).json({ error: 'Message must be 10-1500 characters' });
  await sendMail(process.env.ADMIN_EMAIL || 'admin@shop.com', 'New contact message from ' + name.replace(/[\r\n]/g, ' '), `From: ${name} <${email}>\n\n${message}`);
  res.json({ ok: true });
}));

module.exports = router;
