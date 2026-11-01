const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = mongoose.model('User', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true }));

const productSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  category: { type: String, default: 'General', trim: true },
  image: { type: String, default: '' },
  images: [String],
  oldPrice: { type: Number, default: 0 },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text' });
const Product = mongoose.model('Product', productSchema);

const Order = mongoose.model('Order', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: Schema.Types.ObjectId, ref: 'Product' }, name: String, price: Number, qty: Number }],
  subtotal: Number,
  discount: { type: Number, default: 0 },
  coupon: String,
  total: { type: Number, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
  payment: { method: String, status: String, transactionId: String }
}, { timestamps: true }));

const reviewSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500, default: '' },
  verified: { type: Boolean, default: false }
}, { timestamps: true });
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
const Review = mongoose.model('Review', reviewSchema);

const Coupon = mongoose.model('Coupon', new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  percent: { type: Number, required: true, min: 1, max: 90 },
  active: { type: Boolean, default: true },
  expires: Date
}, { timestamps: true }));

module.exports = { User, Product, Order, Review, Coupon };
