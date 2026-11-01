const router = require('express').Router();
const { User, Product, Order, Coupon } = require('../models');
const { wrap, auth, admin } = require('../middleware');
const sendMail = require('../utils/mail');
router.use(auth, admin);

const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const paged = async (Model, filter, req, sel, pop) => {
  const page = Math.max(1, parseInt(req.query.page) || 1), limit = 10;
  let q = Model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  if (sel) q = q.select(sel);
  if (pop) q = q.populate(pop, 'name email');
  const [items, total] = await Promise.all([q, Model.countDocuments(filter)]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
};

router.get('/stats', wrap(async (req, res) => {
  const since = new Date(Date.now() - 7 * 864e5), live = { status: { $ne: 'cancelled' } };
  const [users, products, orders, revenue, byStatus, recent, lowStock, salesByDay, topProducts] = await Promise.all([
    User.countDocuments(), Product.countDocuments(), Order.countDocuments(),
    Order.aggregate([{ $match: live }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email'),
    Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(6),
    Order.aggregate([{ $match: { ...live, createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' } } }]),
    Order.aggregate([{ $match: live }, { $unwind: '$items' }, { $group: { _id: '$items.name', qty: { $sum: '$items.qty' } } }, { $sort: { qty: -1 } }, { $limit: 5 }])
  ]);
  res.json({ users, products, orders, revenue: revenue[0] ? revenue[0].sum : 0, byStatus, recent, lowStock, salesByDay, topProducts });
}));

router.get('/orders', wrap(async (req, res) =>
  res.json(await paged(Order, req.query.status ? { status: String(req.query.status) } : {}, req, null, 'user'))));

router.put('/orders/:id/status', wrap(async (req, res) => {
  const status = req.body.status;
  if (!Order.schema.path('status').enumValues.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const order = await Order.findById(req.params.id).populate('user', 'email name');
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (status === 'cancelled' && order.status !== 'cancelled')
    for (const i of order.items) await Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } }); // restock
  order.status = status; await order.save();
  sendMail(order.user.email, 'Your order status changed', `Hi ${order.user.name}, your order is now "${status}".`);
  res.json(order);
}));

router.get('/users', wrap(async (req, res) => {
  const filter = req.query.q ? { $or: ['name', 'email'].map(f => ({ [f]: { $regex: esc(req.query.q), $options: 'i' } })) } : {};
  res.json(await paged(User, filter, req, '-password'));
}));

router.put('/users/:id/role', wrap(async (req, res) => {
  if (!['user', 'admin'].includes(req.body.role)) return res.status(400).json({ error: 'Invalid role' });
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ error: "You can't change your own role" });
  const u = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  u ? res.json(u) : res.status(404).json({ error: 'User not found' });
}));

// CSV export of all orders
router.get('/export/orders.csv', wrap(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
  const q = v => { let t = String(v ?? ''); if (/^[=+\-@]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; };
  const rows = [['Order ID', 'Date', 'Customer', 'Email', 'Items', 'Subtotal', 'Discount', 'Total', 'Status', 'Payment ID']];
  orders.forEach(o => rows.push([o._id, o.createdAt.toISOString(), o.user ? o.user.name : '', o.user ? o.user.email : '', o.items.map(i => i.name + ' x' + i.qty).join('; '), o.subtotal ?? o.total, o.discount || 0, o.total, o.status, o.payment && o.payment.transactionId]));
  res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
  res.send(rows.map(r => r.map(q).join(',')).join('\n'));
}));

// Coupons
router.get('/coupons', wrap(async (req, res) => res.json(await Coupon.find().sort({ createdAt: -1 }))));
router.post('/coupons', wrap(async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase(), percent = Number(req.body.percent);
  if (!/^[A-Z0-9]{3,20}$/.test(code)) return res.status(400).json({ error: 'Code must be 3-20 letters or numbers' });
  if (!Number.isInteger(percent) || percent < 1 || percent > 90) return res.status(400).json({ error: 'Percent must be 1-90' });
  if (await Coupon.exists({ code })) return res.status(409).json({ error: 'Coupon already exists' });
  res.status(201).json(await Coupon.create({ code, percent }));
}));
router.delete('/coupons/:id', wrap(async (req, res) => { await Coupon.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

module.exports = router;
