require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { pageGuard } = require('./middleware');

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Missing MONGO_URI or JWT_SECRET in .env');
  process.exit(1);
}
// Refuse to start with a weak or placeholder JWT secret (anyone could forge login tokens)
if (process.env.JWT_SECRET.length < 32 || /paste_a_long|changeme|secret$/i.test(process.env.JWT_SECRET)) {
  console.error('JWT_SECRET is too weak or still the placeholder. Generate one with:\n  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  process.exit(1);
}
const app = express();
app.set('trust proxy', 1);
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Too many attempts, try again later' } }));

// Protected pages (server-side guard, in addition to client checks)
app.get('/admin.html', pageGuard('admin'));
app.get(['/cart.html', '/orders.html', '/wishlist.html', '/profile.html', '/invoice.html'], pageGuard());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/user', require('./routes/user'));
app.use('/api', require('./routes/misc'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.use((err, req, res, next) => {
  if (err.name === 'MulterError') err.status = 400;
  if (err.name === 'CastError') { err.status = 400; err.message = 'Invalid id'; }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message });
});

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`ShopSphere running on http://localhost:${PORT}`)))
  .catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });