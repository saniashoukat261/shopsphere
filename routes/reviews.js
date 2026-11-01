const router = require('express').Router();
const mongoose = require('mongoose');
const { Review, Product, Order } = require('../models');
const { wrap, auth } = require('../middleware');

async function recalc(pid) {
  const r = await Review.aggregate([{ $match: { product: new mongoose.Types.ObjectId(String(pid)) } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  await Product.findByIdAndUpdate(pid, { ratingAvg: r[0] ? Math.round(r[0].avg * 10) / 10 : 0, ratingCount: r[0] ? r[0].n : 0 });
}
const bad = (res, m = 'Invalid id') => res.status(400).json({ error: m });

router.get('/:productId', wrap(async (req, res) => {
  const pid = req.params.productId;
  if (!mongoose.isValidObjectId(pid)) return bad(res);
  const [items, dist] = await Promise.all([
    Review.find({ product: pid }).sort({ createdAt: -1 }).limit(50).populate('user', 'name'),
    Review.aggregate([{ $match: { product: new mongoose.Types.ObjectId(pid) } }, { $group: { _id: '$rating', n: { $sum: 1 } } }])
  ]);
  res.json({ items, dist });
}));

router.post('/:productId', auth, wrap(async (req, res) => {
  const pid = req.params.productId;
  if (!mongoose.isValidObjectId(pid)) return bad(res);
  const rating = Number(req.body.rating), comment = String(req.body.comment || '').trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return bad(res, 'Rating must be 1 to 5');
  if (comment.length < 3 || comment.length > 500) return bad(res, 'Review must be 3-500 characters');
  if (!(await Product.exists({ _id: pid }))) return res.status(404).json({ error: 'Product not found' });
  const verified = !!(await Order.exists({ user: req.user._id, 'items.product': pid, status: { $ne: 'cancelled' } }));
  const r = await Review.findOneAndUpdate({ product: pid, user: req.user._id }, { rating, comment, verified }, { new: true, upsert: true, setDefaultsOnInsert: true });
  await recalc(pid);
  res.status(201).json(r);
}));

router.delete('/:id', auth, wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return bad(res);
  const r = await Review.findById(req.params.id);
  if (!r) return res.status(404).json({ error: 'Review not found' });
  if (String(r.user) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
  await r.deleteOne(); await recalc(r.product);
  res.json({ ok: true });
}));

module.exports = router;
