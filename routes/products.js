const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Product } = require('../models');
const { wrap, auth, admin } = require('../middleware');

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ? cb(null, true) : cb(Object.assign(new Error('Only JPG, PNG, WEBP or GIF images allowed'), { status: 400 }))
});

const removeImage = img => {
  if (img && img.startsWith('/uploads/')) fs.unlink(path.join(__dirname, '..', img), () => {});
};
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parse(body) {
  const name = String(body.name || '').trim();
  const price = Number(body.price), stock = Number(body.stock);
  if (!name) return { error: 'Product name is required' };
  if (!(price >= 0) || body.price === '') return { error: 'Price must be a number >= 0' };
  if (!Number.isInteger(stock) || stock < 0) return { error: 'Stock must be a whole number >= 0' };
  const data = { name, price, stock, description: String(body.description || '').slice(0, 2000), category: String(body.category || 'General').trim() || 'General' };
  const url = String(body.imageUrl || '').trim();
  if (/^https?:\/\/\S+$/i.test(url) && url.length < 500) data.image = url;
  const old = Number(body.oldPrice);
  if (old > price) data.oldPrice = old; else if (body.oldPrice !== undefined) data.oldPrice = 0;
  if (body.images !== undefined) data.images = String(body.images).split(/\r?\n/).map(x => x.trim()).filter(x => /^https?:\/\/\S+$/i.test(x) && x.length < 500).slice(0, 5);
  return { data };
}

// READ (list) with search, filters, sort, pagination
router.get('/', wrap(async (req, res) => {
  const { q, category, min, max, sort } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 8));
  const filter = {};
  if (q) filter.$or = [{ name: { $regex: esc(String(q)), $options: 'i' } }, { description: { $regex: esc(String(q)), $options: 'i' } }];
  if (category) filter.category = String(category);
  if (min || max) filter.price = { ...(min && { $gte: +min }), ...(max && { $lte: +max }) };
  const sorts = { price_asc: { price: 1 }, price_desc: { price: -1 }, name: { name: 1 }, newest: { createdAt: -1 }, rating: { ratingAvg: -1, ratingCount: -1 } };
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sorts[sort] || sorts.newest).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
}));

router.get('/categories', wrap(async (req, res) => res.json(await Product.distinct('category'))));
router.get('/:id', wrap(async (req, res) => {
  const p = await Product.findById(req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'Product not found' });
}));

// CREATE
router.post('/', auth, admin, upload.single('image'), wrap(async (req, res) => {
  const { data, error } = parse(req.body);
  if (error) { if (req.file) removeImage('/uploads/' + req.file.filename); return res.status(400).json({ error }); }
  if (req.file) data.image = '/uploads/' + req.file.filename;
  res.status(201).json(await Product.create(data));
}));

// UPDATE
router.put('/:id', auth, admin, upload.single('image'), wrap(async (req, res) => {
  const { data, error } = parse(req.body);
  if (error) { if (req.file) removeImage('/uploads/' + req.file.filename); return res.status(400).json({ error }); }
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  if (req.file) { removeImage(p.image); data.image = '/uploads/' + req.file.filename; }
  else if (data.image) removeImage(p.image);
  Object.assign(p, data);
  res.json(await p.save());
}));

// DELETE
router.delete('/:id', auth, admin, wrap(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  removeImage(p.image);
  res.json({ ok: true });
}));

module.exports = router;
