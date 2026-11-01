const router = require('express').Router();
const crypto = require('crypto');
const { Product, Order } = require('../models');
const { wrap, auth } = require('../middleware');
const sendMail = require('../utils/mail');
const applyCoupon = require('../utils/coupon');
const mongoose = require('mongoose');

// Demo payment: any card number is accepted (no real charge, nothing is stored)
function mockPay(card = {}) {
  const num = String(card.number || '').replace(/\D/g, '');
  if (num.length < 12 || num.length > 19) return { error: 'Enter your card number' };
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(card.expiry || ''))) return { error: 'Enter expiry as MM/YY' };
  if (!/^\d{3,4}$/.test(String(card.cvc || ''))) return { error: 'Enter a 3-4 digit CVC' };
  return { transactionId: 'DEMO-' + crypto.randomBytes(5).toString('hex').toUpperCase() };
}

router.post('/', auth, wrap(async (req, res) => {
  const { items, address, card } = req.body;
  if (!Array.isArray(items) || !items.length || items.length > 50) return res.status(400).json({ error: 'Your cart is empty' });
  if (typeof address !== 'string' || address.trim().length < 10) return res.status(400).json({ error: 'Enter a full shipping address (min 10 characters)' });

  const qtyById = new Map();
  for (const i of items) {
    const q = Number(i.qty);
    if (!i.productId || !Number.isInteger(q) || q < 1 || q > 99) return res.status(400).json({ error: 'Invalid cart item' });
    qtyById.set(String(i.productId), (qtyById.get(String(i.productId)) || 0) + q);
  }
  const products = await Product.find({ _id: { $in: [...qtyById.keys()] } });
  if (products.length !== qtyById.size) return res.status(400).json({ error: 'Some products no longer exist' });

  const lines = products.map(p => ({ product: p._id, name: p.name, price: p.price, qty: qtyById.get(String(p._id)) }));
  const subtotal = Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100; // price computed server-side
  const cp = await applyCoupon(req.body.coupon, subtotal);
  if (cp.error) return res.status(400).json({ error: cp.error });
  const discount = cp.discount || 0;
  const total = Math.round((subtotal - discount) * 100) / 100;

  const pay = mockPay(card);
  if (pay.error) return res.status(402).json({ error: pay.error });

  // Reserve stock line by line. If anything fails afterwards, the stock is put back.
  const reserved = [];
  const release = async () => {
    const back = reserved.splice(0);
    await Promise.all(back.map(r => Product.updateOne({ _id: r.product }, { $inc: { stock: r.qty } })))
      .catch(e => console.error('Restock failed:', e.message));
  };
  let order;
  try {
    for (const l of lines) {
      const ok = await Product.findOneAndUpdate({ _id: l.product, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty } });
      if (!ok) { await release(); return res.status(409).json({ error: `Not enough stock for "${l.name}"` }); }
      reserved.push(l);
    }
    order = await Order.create({
      user: req.user._id, items: lines, subtotal, discount, coupon: cp.code, total, address: address.trim(),
      payment: { method: 'card (mock)', status: 'paid', transactionId: pay.transactionId }
    });
  } catch (err) { await release(); throw err; }
  sendMail(req.user.email, `Order confirmed #${String(order._id).slice(-6).toUpperCase()}`,
    `Hi ${req.user.name},\n\nThanks for your order!\n${lines.map(l => `- ${l.name} x${l.qty}`).join('\n')}\n\n${discount ? `Discount (${cp.code}): -$${discount.toFixed(2)}\n` : ''}Total: $${total.toFixed(2)}\nTransaction: ${pay.transactionId}`);
  res.status(201).json(order);
}));

router.get('/mine', auth, wrap(async (req, res) =>
  res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }))));

router.get('/:id', auth, wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const o = await Order.findById(req.params.id).populate('user', 'name email');
  if (!o || (String(o.user._id) !== String(req.user._id) && req.user.role !== 'admin')) return res.status(404).json({ error: 'Order not found' });
  res.json(o);
}));

module.exports = router;