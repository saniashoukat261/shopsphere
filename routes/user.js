const router = require('express').Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { User, Product } = require('../models');
const { wrap, auth } = require('../middleware');
router.use(auth);

router.get('/wishlist', wrap(async (req, res) => {
  const u = await User.findById(req.user._id).populate('wishlist');
  res.json(u.wishlist.filter(Boolean));
}));

router.post('/wishlist/:id', wrap(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
  const u = await User.findById(req.user._id);
  const has = u.wishlist.some(x => String(x) === id);
  if (has) await User.updateOne({ _id: u._id }, { $pull: { wishlist: id } });
  else {
    if (!(await Product.exists({ _id: id }))) return res.status(404).json({ error: 'Product not found' });
    await User.updateOne({ _id: u._id }, { $addToSet: { wishlist: id } });
  }
  res.json({ wished: !has });
}));

router.put('/profile', wrap(async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (name.length < 2 || name.length > 60) return res.status(400).json({ error: 'Name must be 2-60 characters' });
  const u = await User.findByIdAndUpdate(req.user._id, { name }, { new: true });
  res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role } });
}));

router.put('/password', wrap(async (req, res) => {
  const u = await User.findById(req.user._id);
  if (!(await bcrypt.compare(String(req.body.current || ''), u.password))) return res.status(400).json({ error: 'Current password is incorrect' });
  const next = String(req.body.next || '');
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/.test(next)) return res.status(400).json({ error: 'New password needs 8+ characters with uppercase, lowercase and a number' });
  u.password = await bcrypt.hash(next, 10); await u.save();
  res.json({ ok: true });
}));

module.exports = router;
