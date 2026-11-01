# ShopSphere - Full-Stack E-Commerce Application
Devixo Solutions - Task 04. **Stack:** HTML/CSS/JavaScript (frontend) · Node.js + Express (backend) · MongoDB + Mongoose (database).

## Features (mapped to the task requirements)
| Requirement | Implementation |
|---|---|
| Registration / Login / Logout | `routes/auth.js`, JWT stored in an httpOnly cookie |
| Password validation | 8+ chars, upper + lower + number (client and server) |
| Protected pages / routes | Server-side `pageGuard` for cart, orders, wishlist, profile, invoice and admin pages + `auth` / `admin` API middleware |
| Secure password handling | bcrypt hashing, passwords never returned by the API |
| CRUD | Products (create, read, update, delete), orders, users, coupons, reviews |
| Dashboard | Revenue, orders, products, users, recent orders, low stock, orders by status |
| Search / filters / tables | Product search, category, price range, sort; admin tables |
| Pagination | Shop, admin products, orders, users |
| Input validation | Server-side validation on every endpoint |
| Error handling | Central error handler, friendly messages, toast notifications |
| Security | helmet, rate-limited auth and contact routes, regex-escaped search, XSS-safe rendering, server-side price calculation, upload type/size limits |
| Responsive UI | Mobile-friendly layout, dark mode support |
| Reviews and ratings | Star ratings, written reviews, verified-purchase badge, rating breakdown |
| Wishlist, coupons | Heart button, wishlist page, coupon codes (WELCOME10, SAVE20), admin coupon manager |
| Profile, invoices | Edit name, change password, printable invoice per order |
| Admin extras | Sales chart, top products, CSV export of orders |
| Bonus | Email notifications, image upload, role-based access, admin dashboard, mock payment flow, stock handling and restock on cancel |

## 1. Run locally
1. Install **Node.js 18+** (https://nodejs.org) and VS Code.
2. Create a free MongoDB Atlas database (see step 2 below) or use a local MongoDB.
3. In the project folder open a terminal and run:
   ```
   npm install
   copy .env.example .env      (Mac/Linux: cp .env.example .env)
   ```
4. Open `.env` and set `MONGO_URI` and a long random `JWT_SECRET` (at least 32 characters).
5. Add sample data and the admin account: `npm run seed`
6. Start: `npm start` then open http://localhost:3000

**Admin login:** `admin@shop.com` / `Admin@123` (change it in `.env` before seeding).
**Demo payment:** any card number works (for example 1234 5678 9012 3456), any MM/YY expiry, any 3-digit CVC. Nothing is stored or charged.
**Demo customers** (created by the seed with sample reviews): demo1@shop.com to demo4@shop.com, password `Demo@12345`.

## 2. MongoDB Atlas setup
1. Sign up at mongodb.com/atlas and create a free (M0) cluster.
2. Database Access: add a user with a password.
3. Network Access: add your IP address (or `0.0.0.0/0` if you plan to host it on a cloud service).
4. Connect, then Drivers: copy the connection string, replace `<password>`, and add `/shopsphere` before the `?`.

## 3. Deployment (optional)
The project currently runs locally and has **not been deployed online yet**. It is ready to be hosted on any Node.js service, for example Render (free):
1. Push the project to GitHub (`.env` is already in `.gitignore`).
2. On render.com choose New, then Web Service, and connect your repo.
3. Build command: `npm install` · Start command: `npm start`
4. Environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`
5. After the first deploy, run the seed once from your computer with the same `MONGO_URI` in `.env` (`npm run seed`).

Note: free hosting disks are temporary, so uploaded product images are lost on redeploy. Use image uploads locally, or add Cloudinary for permanent storage.

## 4. Optional: real emails
Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `.env` (for example a Gmail app password or Brevo). With no SMTP settings, emails are printed in the console.

## Project structure
```
server.js  models.js  middleware.js  seed.js
routes/    auth.js  products.js  orders.js  reviews.js  user.js  admin.js  misc.js
utils/     mail.js  coupon.js
public/    index, product, cart, invoice, login, register, orders, wishlist,
           profile, admin, about, contact, 404 (.html) + style.css + app.js
uploads/   product images
```