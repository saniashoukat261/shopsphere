const { Coupon } = require('../models');
// Returns { code, percent, discount } or { error } or { discount: 0 } when no code given
module.exports = async function applyCoupon(code, subtotal) {
  if (!code) return { discount: 0 };
  const c = await Coupon.findOne({ code: String(code).trim().toUpperCase(), active: true });
  if (!c || (c.expires && c.expires < new Date())) return { error: 'Invalid or expired coupon code' };
  return { code: c.code, percent: c.percent, discount: Math.round(subtotal * c.percent) / 100 };
};
