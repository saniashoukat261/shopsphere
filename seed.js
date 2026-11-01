require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Product, Review, Coupon } = require('./models');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = (process.env.ADMIN_EMAIL || 'admin@shop.com').toLowerCase();
  if (!(await User.findOne({ email })))
    await User.create({ name: 'Admin', email, password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10), role: 'admin' });
  const all = [
  {
    "name": "Wireless Headphones",
    "price": 59.99,
    "stock": 25,
    "category": "Electronics",
    "description": "Bluetooth over-ear headphones with 30h battery.",
    
    "image": "https://www.boat-lifestyle.com/cdn/shop/files/Artboard1_ac192d39-3b63-4a80-a049-73e0a6c2b149.png?v=1728871112",
    "images": [
      "https://www.fingers.co.in/secure/api/uploads/products/1722244510_B2.png",
      "https://cdn.shopify.com/s/files/1/0057/8938/4802/files/425.png?v=1645772065",
      "https://images.priceoye.pk/g5000-wireless-gaming-headset-with-mic-pakistan-priceoye-pfuko-500x500.webp"
    ],
    "oldPrice": 74.99
  },
  {
    "name": "Smart Watch",
    "price": 89.5,
    "stock": 15,
    "category": "Electronics",
    "description": "Fitness tracking, heart-rate and notifications.",
    
    "image": "https://www.laptab.com.pk/theme/mobile/204360/ba4a135bea57e604c236d359ff0f7d3e_jpg_2200x2200q80_jpg_.jpg",
    "images": [
      "https://static.webx.pk/files/19643/Images/boost-astro-smart-watch-price-in-pakistan-2-19643-0-260924022712341.png",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaofkn0ZCPbIWriUMvQN9wBjpxILkVuBkj50ufm8XvC-M8GF9akB7K-2nI&s=10",
      "https://rukminim3.flixcart.com/image/480/480/xif0q/smartwatch/n/o/z/-enriched-transparent-original-imah76jstup5zdww.png?q=90"
    ],
    "oldPrice": 125.3
  },
  {
    "name": "Mechanical Keyboard",
    "price": 74,
    "stock": 30,
    "category": "Electronics",
    "description": "RGB backlit, hot-swappable switches.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkBoPoE9_Mba5WzytMmMHsv36-ecNVtcClm3j5njhOxxMxUvq0FTT-k_NB&s=10",
    "images": [
      "https://bloodygaming.pk/cdn/shop/files/s520n-mechanical-switch-rgb-gaming-keyboard-5725859.png?v=1761126344",
      "https://static.webx.pk/files/87161/Images/czone.com.pk-11-1540-19244-240925071926-87161-2461611-021025124645.webp",
      
    ],
    "oldPrice": 85.1
  },
  {
    "name": "Portable Bluetooth Speaker",
    "price": 39.99,
    "stock": 40,
    "category": "Electronics",
    "description": "Waterproof speaker with 12 hours of playtime.",
    
    "image": "https://images.priceoye.pk/x-521-wireless-portable-speaker-pakistan-priceoye-xekpd.jpg",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6tfXUsz6inrgI0bvln-GlHN4NOmf11BLM9UTugv_zOw&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPyAZT3b8JN1WaqjrZnjN6SNMugOQ8L3xIR7A4zZj5qNMjLlwKAG2_nLvq&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkzrGDkPusMJoDizfCUttV1nsVw6bp1KLUkhn15ngL5Q&s=10"
    ],
    "oldPrice": 0
  },
  {
    "name": "Wireless Mouse",
    "price": 18.5,
    "stock": 70,
    "category": "Electronics",
    "description": "Ergonomic silent-click mouse, 2.4GHz.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq0U5U7pmnifOYfWaPCKk9rr8fMNNTUVxvlwzhIsafbA&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLEzGtRwznZaLvt8HLJ0ewldQvbIvFr8qZMfgwFnbXHQ&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCcK6RYZw3o4wMUXLOB5tIApmpXC8hquwVVpVyLSXcPA&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQetZzXgJUKImjWVZvdQ-sNlPPNfmwpdXhvuQNbm0bTdQ&s=10"
    ],
    "oldPrice": 24.05
  },
  {
    "name": "Power Bank 20000mAh",
    "price": 27.9,
    "stock": 45,
    "category": "Electronics",
    "description": "Fast-charging power bank with dual USB ports.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0jeLTYsCKMdeoIt5xctRP_sNnmyiMSXOdcLKXNbDLQg&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcS0enwB1PblwvuuwNYPFx6mWiItsHDABcKMxu79w0nA&s=10"
    
    ],
    "oldPrice": 34.88
  },
  {
    "name": "1080p Webcam",
    "price": 34,
    "stock": 22,
    "category": "Electronics",
    "description": "Full HD webcam with built-in microphone.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEnosJ5HmBR-nfJjZkviOiuPGJ_6FkNIisYXEtl7kvKA&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0SCD_akbJi7VXlcadObNxGXITpS_lE8LUJNJTmA7f_Q&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnCqEGHCbwBdSHhLgK90aj0FT4w9-SEMgZG2SzlizhHg&s=10"
      
    ],
    "oldPrice": 47.6
  },
  {
    "name": "Running Shoes",
    "price": 65,
    "stock": 40,
    "category": "Fashion",
    "description": "Lightweight and breathable daily trainers.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjsdUkphMB1OCaiDNtjGkGPgJe2UOe2BVXdr1vvCUePA&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmtFF-iAsL66M_YqEVDlTKdi-A-Y5P6S3oEGmOA5Hrog&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT25xOjyFGQ9ivwepnSOLnGtXxiVH3q6zmQw37khhQZSw&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrtQyT5vnnbye-fO_Ezz6zSR5CeJhs1CSgsccPYePQqw&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDwAgP7d9Ok_qhM4BOf0ZDR1FmRaYyx-be-2Sjk27quA&s=10"
    ],
    "oldPrice": 74.75
  },
  {
    "name": "Denim Jacket",
    "price": 48.25,
    "stock": 12,
    "category": "Fashion",
    "description": "Classic fit unisex denim jacket.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDuJNAcwwy5-KEQbibYOGeHMNU-ArJ2XH8jUFv95-POA&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBTvl0yN1iYX99VtErOQyUxd84Wv1IYg9Pab0ehbl5XA&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDVSpyMmHzj4ruP_cHgp0KgtLEpq3wWDwyshB7JSTobQ&s=10"
     
    ],
    "oldPrice": 0
  },
  {
    "name": "Backpack 25L",
    "price": 35,
    "stock": 50,
    "category": "Fashion",
    "description": "Water-resistant backpack with laptop sleeve.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhIHiwrocRNmxOmJwabyaGTb7RR2o4M1GuG_yZHnX62A&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTok2nMb6oB7veZ8iOo_xxBSFq3Thhd3DX2bUGsWHXDbA&s=10"
      
    ],
    "oldPrice": 45.5
  },
  {
    "name": "Cotton T-Shirt",
    "price": 14.99,
    "stock": 100,
    "category": "Fashion",
    "description": "100% soft cotton crew-neck tee.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe-tF40lEIeWlOvNX0L9GBFjSn-o66vudpnHBub2shCg&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ-KEFvOKMIfbvSqIPpxmHOXeCZ4Ry-1nEBC3hgb4F9Q&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLlykta28Dm5TUVZosnR46qg_UCaafGRaKmhmVHd2nUQ&s=10"
     
    ],
    "oldPrice": 18.74
  },
  {
    "name": "Leather Wallet",
    "price": 24.5,
    "stock": 35,
    "category": "Fashion",
    "description": "Slim genuine leather bifold wallet.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm8yf64cZIcOZmBTXmi0tRA77gZ30JfxTq_OOAAoi_Ig&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsGhYBfEeMmurV6y1iL8nlCinlZDTjZFGterlz2cly7Q&s=10"
   
    ],
    "oldPrice": 34.3
  },
  {
    "name": "Aviator Sunglasses",
    "price": 21,
    "stock": 28,
    "category": "Fashion",
    "description": "UV400 protection polarized lenses.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvjaPhH-1lV0SvE5rWzJ3Wj2xAa2CYsFiy_YWIZWp2vg&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLvpVQMwtYc42ejeWh90qa_sdq1p5lWyp93J52KCTW0Q&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-E9CTcrqDU8A6vuw2LN4KUeevjzvCjmE6ShcaN3A7Od-69OH3bs_bOlQ&s=10"

    ],
    "oldPrice": 24.15
  },
  {
    "name": "Ceramic Mug Set",
    "price": 22,
    "stock": 60,
    "category": "Home",
    "description": "Set of 4 handmade ceramic mugs.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkaebUmToIzL4Mxi9zVC1byoq7AM2MJD4v3ccN6C2MmQ&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJFISe5X_HpB2wp3IvDrQwiJUUiu7NQ4OHOMxT2k9Y5g&s",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyFEXJQ6qUm447ug92TDElbwCQyfdbpFZK5PCnUp89zw&s=10"
     
    ],
    "oldPrice": 0
  },
  {
    "name": "Desk Lamp",
    "price": 29.9,
    "stock": 4,
    "category": "Home",
    "description": "Dimmable LED desk lamp with USB port.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5CCb5LyS5OJxuw7Hr2C9zlC9reuqVqNyexbyJkrJsyA&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrk0MxOqvn7yNm9xTv1Sj2TwT7zhu-cL4RGkWWlWoj1Q&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNnW517TtVxc8tdLPPE432UES3YXSO4KYd-4G1edmkgQ&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuMlEG-G0xC66s8eW9dhKkM_zbNM0MmPLuKVgHUV9Oqg&s=10"
    ],
    "oldPrice": 38.87
  },
  {
    "name": "Scented Candle Trio",
    "price": 17.5,
    "stock": 55,
    "category": "Home",
    "description": "Lavender, vanilla and sandalwood soy candles.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfFZGNFT6AV1z3CAMp3Tt7Gh8PYv7ixmxKwWKRTpuKrw&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDDsU8P5UcEXABQyWnuK9zD0HN4YaooOOq3pCERhapMQ&s=10"
     
    ],
    "oldPrice": 21.88
  },
  {
    "name": "Throw Blanket",
    "price": 31,
    "stock": 26,
    "category": "Home",
    "description": "Ultra-soft fleece blanket, 150x200cm.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM7Fz-dfD0aEIWRFZVdba1qdYn41nXYswtIHa41gLhnw&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx2Y8iYmVaN7jVCXhmXOliR4-3sR2F2kQYzdVlDlNGXg&s=10"
    
    ],
    "oldPrice": 43.4
  },
  {
    "name": "Wall Clock",
    "price": 19.99,
    "stock": 33,
    "category": "Home",
    "description": "Minimalist silent wall clock, 30cm.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyiwVrziS4btLRswRNKSNZNkTUe_YbBoo3L7-yAMxnBg&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1KG9THqg-WdJq05tsTnrx5sv6bp0pkzfMix5kmZoxMw&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHpGXVl0URfLr1A-drUhAp6U-byA3nIm1-4BJU-sINPg&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuBstPY8jF9WVgsSkFMqMPQVZMiraSPvzj5mLQZL7_yA&s=10"
    ],
    "oldPrice": 22.99
  },
  {
    "name": "Yoga Mat",
    "price": 19.99,
    "stock": 35,
    "category": "Sports",
    "description": "Non-slip 6mm exercise mat.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZ47TO7CB9AB3ggNcpS897kz7mYcfKA1aYv4cxtAQjQw&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHqn0zSfQwYOchOdeCWdqHeh-jSGWn_PQgn3uWrMoU6g&s=10"
     
    ],
    "oldPrice": 0
  },
  {
    "name": "Stainless Water Bottle",
    "price": 16.5,
    "stock": 80,
    "category": "Sports",
    "description": "Insulated 750ml bottle, keeps cold 24h.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_Fo9pVlT74_hYbni3fvIa7nfwRY85D2cOgofs88OF7Q&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSloLa5glGPPVDRE4-zWi63NW0cyMWacvUIsKPUyoqyvA&s=10",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLSP2MCB5mFuO61qFBwLf5iFw_ifm1x0f6_wvh_HoTYw&s=10"
      
    ],
    "oldPrice": 21.45
  },
  {
    "name": "Adjustable Dumbbell Set",
    "price": 79,
    "stock": 14,
    "category": "Sports",
    "description": "Pair of adjustable dumbbells, 2-12kg.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ59Q2IN4Ct0GGhrvxbsbRvzCPE8Qcr4QVVf0RJ2xMAow&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx7Wko0tDHTZG8eSRbqouwz9XqKA_Rr5POwAFSlBO2rg&s=10"
    ],
    "oldPrice": 98.75
  },
  {
    "name": "Football",
    "price": 23.5,
    "stock": 40,
    "category": "Sports",
    "description": "Size 5 match-quality football.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxY1-YAiek6wFYrIdH7NLIuZJUsgBXGLQjZtrswDSs7A&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjjAsZY3P08rD6mOrt-S8r0ldg4T4tKKJ221eSAV0kSA&s=10"
    ],
    "oldPrice": 32.9
  },
  {
    "name": "Skipping Rope",
    "price": 8.99,
    "stock": 90,
    "category": "Sports",
    "description": "Speed rope with ball bearings.",
  
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSX3FuLfh3VdhzJ_Bd4-u2SKAxEANW-2pWGO6-5ui89g&s=10",
    "images": [
      "https://loremflickr.com/640/480/jumprope?lock=211",
      "https://loremflickr.com/640/480/jumprope?lock=212",
      "https://loremflickr.com/640/480/jumprope?lock=213"
    ],
    "oldPrice": 10.34
  },
  {
    "name": "JavaScript: The Good Parts",
    "price": 18.9,
    "stock": 30,
    "category": "Books",
    "description": "Classic guide to the best features of JavaScript.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf9NZMswK1j3os9OJj7UC5D3BPbsML9y5SNd3Glxgdcg&s=10",
    "images": [
      "https://loremflickr.com/640/480/book?lock=216",
      "https://loremflickr.com/640/480/book?lock=217",
      "https://loremflickr.com/640/480/book?lock=218"
    ],
    "oldPrice": 0
  },
  {
    "name": "Clean Code",
    "price": 32.5,
    "stock": 24,
    "category": "Books",
    "description": "A handbook of agile software craftsmanship.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrjJftMq6kuCO0s75sw7McU7JfxUPJ9GQl1hUp1jySlw&s=10",
    "images": [
      "https://loremflickr.com/640/480/books?lock=221",
      "https://loremflickr.com/640/480/books?lock=222",
      "https://loremflickr.com/640/480/books?lock=223"
    ],
    "oldPrice": 42.25
  },
  {
    "name": "Atomic Habits",
    "price": 15.99,
    "stock": 60,
    "category": "Books",
    "description": "Build good habits and break bad ones.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShcPV8sYkSNCZinHJN85aJ9UA77sh-EtFf0FMXLPTi5Q&s=10",
    "images": [
      "https://loremflickr.com/640/480/bookshelf?lock=226",
      "https://loremflickr.com/640/480/bookshelf?lock=227",
      "https://loremflickr.com/640/480/bookshelf?lock=228"
    ],
    "oldPrice": 19.99
  },
  {
    "name": "Face Moisturizer",
    "price": 12.75,
    "stock": 65,
    "category": "Beauty",
    "description": "Daily hydrating cream with SPF 15.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwldGrnE_PkjkPde7sSaibv6LaDgfxpOG4rk6E_OMTTw&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_bR_3CeD2t0-BtM9RM-cbmPHU-jtFHnrwb2FyH3nT4w&s=10"
    ],
    "oldPrice": 17.85
  },
  {
    "name": "Vitamin C Serum",
    "price": 16.9,
    "stock": 48,
    "category": "Beauty",
    "description": "Brightening serum for glowing skin.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaARO2Y5OafCmkkHSeONYMi7T_J6S4qu_toRpjedbh2A&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDp_EBfn3PlKMp88SgfITccJzXvabV9sUt2DIjo-WhJA&s=10"

    ],
    "oldPrice": 19.43
  },
  {
    "name": "Hair Dryer",
    "price": 36,
    "stock": 20,
    "category": "Beauty",
    "description": "1800W ionic hair dryer with diffuser.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHfUG5odoiOHMkCxsyeZdIV05rJAQmUFnnAz4l3FG_VQ&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWfL1TvvFm5SnCqZTN0DSCoAIW6j0jr5YUIeDaw-0cHg&s=10"
    ],
    "oldPrice": 0
  },
  {
    "name": "Building Blocks Set",
    "price": 26.5,
    "stock": 38,
    "category": "Toys",
    "description": "500-piece creative building set.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYZnroOTdtLn-vDVilZjRNjwMdxdUF-GWDua1OIZE90w&s=10",
    "images": [
      "https://loremflickr.com/640/480/legos?lock=246",
      "https://loremflickr.com/640/480/legos?lock=247",
      "https://loremflickr.com/640/480/legos?lock=248"
    ],
    "oldPrice": 34.45
  },
  {
    "name": "Remote Control Car",
    "price": 33,
    "stock": 18,
    "category": "Toys",
    "description": "Rechargeable 4WD off-road RC car.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHSuiqupuPGYnzE3o5zFBii2wDszWgFRKQ6W-wwX7U6A&s=10",
    "images": [
      "https://loremflickr.com/640/480/toycar?lock=251",
      "https://loremflickr.com/640/480/toycar?lock=252",
      "https://loremflickr.com/640/480/toycar?lock=253"
    ],
    "oldPrice": 41.25
  },
  {
    "name": "Puzzle 1000 Pieces",
    "price": 13.99,
    "stock": 42,
    "category": "Toys",
    "description": "Scenic landscape jigsaw puzzle.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwRm5-Bfij07wzVsS0IzSl8bbCOdPzItE255GhjPtNHQ&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzqPgnr62y-vzXYnNGAEJA9uPY0t141UcpeAbF9EbKnw&s=10"
     
    ],
    "oldPrice": 19.59
  },
  {
    "name": "Non-stick Frying Pan",
    "price": 24,
    "stock": 36,
    "category": "Kitchen",
    "description": "28cm pan with heat-resistant handle.",
  
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuC3AA1OPXba12JXzzbX0jMZNqaivW65Bc_FhrvQ8Z3Q&s=10",
    "images": [
      "https://loremflickr.com/640/480/fryingpan?lock=261",
      "https://loremflickr.com/640/480/fryingpan?lock=262",
      "https://loremflickr.com/640/480/fryingpan?lock=263"
    ],
    "oldPrice": 27.6
  },
  {
    "name": "Electric Kettle",
    "price": 28.5,
    "stock": 30,
    "category": "Kitchen",
    "description": "1.7L stainless steel kettle with auto shut-off.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-st7pRyc-814pfRIIL5mDOYTIYB3dx3kRGo5kJ23Lcg&s=10",
    "images": [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAYQuax50ycw8yZA2pEejOH01aTM7IeIbE1LmYWrx0Bw&s=10"
    ],
    "oldPrice": 0
  },
  {
    "name": "Chef Knife",
    "price": 21.9,
    "stock": 44,
    "category": "Kitchen",
    "description": "8-inch stainless steel chef knife.",
   
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7F5n1jY8xAzhI4NoLNlh_j2sQmjRnWZah2dUxOljZAg&s=10",
    "images": [
      "https://loremflickr.com/640/480/chefknife?lock=271",
      "https://loremflickr.com/640/480/chefknife?lock=272",
      "https://loremflickr.com/640/480/chefknife?lock=273"
    ],
    "oldPrice": 28.47
  },
  {
    "name": "Coffee Maker",
    "price": 54,
    "stock": 16,
    "category": "Kitchen",
    "description": "Programmable 12-cup drip coffee maker.",
    
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlmRiFduNzVULuXYwGZuMv8O6eATVenBQ55Hdf90cWzQ&s=10",
    "images": [
      "https://loremflickr.com/640/480/coffeemaker?lock=276",
      "https://loremflickr.com/640/480/coffeemaker?lock=277",
      "https://loremflickr.com/640/480/coffeemaker?lock=278"
    ],
    "oldPrice": 67.5
  }
];
  const have = new Set((await Product.find().select('name')).map(p => p.name));
  const fresh = all.filter(p => !have.has(p.name));
  if (fresh.length) await Product.insertMany(fresh);
  for (const p of all) if (p.image) await Product.updateOne({ name: p.name }, { $set: { image: p.image } });
  for (const p of all) {
    await Product.updateOne({ name: p.name, $or: [{ oldPrice: { $exists: false } }, { oldPrice: 0 }] }, { $set: { oldPrice: p.oldPrice } });
    if (p.images && p.images.length) await Product.updateOne({ name: p.name }, { $set: { images: p.images } });
  }
  console.log(`Products added: ${fresh.length}`);

  for (const [code, percent] of [['WELCOME10', 10], ['SAVE20', 20]])
    await Coupon.updateOne({ code }, { $setOnInsert: { code, percent, active: true } }, { upsert: true });

  // demo customers + sample reviews (only when there are no reviews yet)
  if (!(await Review.countDocuments())) {
    const names = ['Ayesha K.', 'Ali Raza', 'Sara Malik', 'Hamza Tariq'], demo = [];
    for (let i = 0; i < names.length; i++) {
      const mail = `demo${i + 1}@shop.com`;
      demo.push((await User.findOne({ email: mail })) || (await User.create({ name: names[i], email: mail, password: await bcrypt.hash('Demo@12345', 10) })));
    }
    const texts = { 5: ['Absolutely love it, great quality for the price!', 'Exceeded my expectations. Fast delivery too.', 'Perfect, exactly as described.'], 4: ['Very good product, would recommend.', 'Solid quality, small room for improvement.'], 3: ['Decent for the price, does the job.'] };
    const prods = await Product.find(), revs = [];
    prods.forEach((p, i) => {
      for (let k = 0; k < 1 + (i % 3); k++) {
        const rating = [5, 4, 5, 4, 3][(i + k * 2) % 5], t = texts[rating];
        revs.push({ product: p._id, user: demo[(i + k) % 4]._id, rating, comment: t[(i + k) % t.length], verified: true });
      }
    });
    await Review.insertMany(revs);
    for (const p of prods) {
      const r = revs.filter(x => String(x.product) === String(p._id));
      await Product.updateOne({ _id: p._id }, { ratingAvg: Math.round(r.reduce((s, x) => s + x.rating, 0) / r.length * 10) / 10, ratingCount: r.length });
    }
  }
  console.log(`Seed complete. Coupons: WELCOME10, SAVE20. Admin login: ${email} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });