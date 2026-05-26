# 🎁 GiftCard Rewards Platform

> A modern, dark-themed gift card reward web application with Supabase backend.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Tech Stack](https://img.shields.io/badge/HTML%20%7C%20CSS%20%7C%20JS%20%7C%20Supabase-blue)

---

## ✨ Features

### For Users
- 🎁 Browse available gift cards (Amazon, PayPal, Steam, Binance, Google Play, Apple)
- 📝 Submit gift card claims with card information
- ⏱️ Real-time processing simulation (15-20 seconds)
- 🎫 Automatic coupon code generation
- 📊 User dashboard with claim history
- 🔐 Secure authentication with Supabase Auth

### For Admins
- 📊 Dashboard overview with statistics
- 👥 User management (view all users, toggle admin roles)
- 📝 Claims management (view all claims, update statuses)
- 🎁 Gift card management (add, edit, delete gift cards)
- 🔔 Real-time activity tracking

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Page structure |
| **CSS3** | Styling with glassmorphism effects |
| **Vanilla JavaScript** | Client-side logic |
| **Supabase** | Authentication & PostgreSQL database |
| **Row Level Security** | Secure data access |

---

## 📁 Project Structure

```
gift-card-project/
├── index.html          # Landing page
├── login.html          # User login
├── register.html       # User registration
├── dashboard.html     # User dashboard
├── admin.html         # Admin panel
├── styles.css         # Main stylesheet
├── app.js             # Core JavaScript utilities
├── config.js          # Supabase configuration
├── index.js           # Landing page functionality
├── supabase-schema.sql # Database schema
└── README.md          # This file
```

---

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click **"New Project"**
3. Choose your organization and project name
4. Select region closest to your users
5. Wait for database to be ready (2-3 minutes)

### 2. Get API Keys

1. In Supabase Dashboard, go to **Project Settings** → **API**
2. Copy:
   - `URL` (Project URL)
   - `anon/public` key (Anonymous key)

### 3. Configure Project

Open `config.js` and replace the placeholder values:

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://your-project-id.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  
  // Optional: Change admin credentials
  ADMIN_EMAIL: 'admin@giftcard.com',
  ADMIN_PASSWORD: 'your-secure-password'
};
```

### 4. Setup Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a **New Query**
3. Copy the entire contents of `supabase-schema.sql`
4. Click **Run**

This creates:
- `users` table (extends Supabase auth)
- `giftcards` table (gift card catalog)
- `claims` table (user submitted claims)
- `coupons` table (generated coupon codes)
- RLS policies for security
- Sample gift cards (Amazon, PayPal, Steam, etc.)

### 5. Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add:
   - `http://localhost:3000` (for local testing)
   - Your production URL (e.g., `https://your-site.vercel.app`)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/**`
   - `https://your-site.vercel.app/**`

### 6. Run Locally

Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:3000
```

Then open: **http://localhost:3000**

---

## 🌐 Deployment (Vercel)

### Method 1: Drag & Drop (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your GitHub repository OR
5. Use **"Upload"** and drag your project folder
6. Deploy instantly

### Method 2: GitHub Integration

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/gift-card-rewards.git
git push -u origin main
```

2. In Vercel, import the GitHub repository
3. Click **Deploy**

### After Deployment

1. Copy your Vercel domain (e.g., `https://gift-card-rewards.vercel.app`)
2. Add it to Supabase **Redirect URLs**:
   - Go to Supabase → Authentication → URL Configuration
   - Add: `https://your-domain.vercel.app/**`

---

## 🔑 Default Accounts

### Admin Account
| Field | Value |
|---|---|
| Email | `admin@giftcard.com` (or your custom) |
| Password | `admin123` (or your custom) |
| Access | Click **"Sign in as Admin"** on login page |

### Demo User
Create a regular account via **Register** page.

---

## 📊 Database Schema

### Tables

#### `users`
- `id` - UUID (linked to auth.users)
- `full_name` - User's full name
- `email` - User's email
- `role` - 'user' or 'admin'
- `created_at` - Timestamp

#### `giftcards`
- `id` - UUID
- `name` - Gift card name
- `brand` - Brand identifier
- `amount` - Reward amount
- `logo_url` - Logo image URL
- `color_start/color_end` - Card gradient colors
- `is_active` - Boolean

#### `claims`
- `id` - UUID
- `user_id` - Reference to users
- `giftcard_id` - Reference to giftcards
- `card_holder_name` - Submitted card name
- `card_number` - Submitted card number
- `expiry_date` - Card expiry
- `cvv` - Card CVV
- `status` - pending/processing/completed/rejected
- `submitted_at` - Timestamp
- `admin_notes` - Admin comments

#### `coupons`
- `id` - UUID
- `claim_id` - Reference to claims
- `user_id` - Reference to users
- `code` - Generated coupon code
- `amount` - Coupon value
- `generated_at` - Timestamp

---

## 🎨 Customization

### Change Gift Cards

Edit the INSERT statement in `supabase-schema.sql`:

```sql
INSERT INTO public.giftcards (name, brand, amount, description, color_start, color_end, logo_url) VALUES
  ('Your Card Name', 'Brand', 50.00, 'Description', '#FF0000', '#00FF00', 'https://logo-url.png')
```

### Change Colors

Edit CSS variables in `styles.css`:

```css
:root {
  --primary-gradient: linear-gradient(135deg, #your-color 0%, #your-color 100%);
  --bg-dark: #your-bg-color;
}
```

### Change Processing Time

Edit `index.js`:

```javascript
setTimeout(async () => {
  // ... processing logic
}, 15000); // Change 15000 to your desired milliseconds
```

---

## 🔒 Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ User can only view their own claims
- ✅ Admin separate authentication
- ✅ Input validation on all forms
- ✅ Session-based authentication
- ✅ No sensitive data exposed in client

---

## 📱 Responsive Design

Works perfectly on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

---

## 🐛 Troubleshooting

### "Unable to sign in"
- Check Supabase URL and Anon Key in `config.js`
- Verify user exists in Supabase Authentication → Users

### "Failed to load gift cards"
- Run SQL schema in Supabase SQL Editor
- Check RLS policies are created

### "Cannot access admin panel"
- Use the "Sign in as Admin" button, not regular login
- Check admin email/password match `config.js`

### "Processing never completes"
- Check browser console for errors
- Verify Supabase connection

---

## 📄 License

MIT License — Free for personal and commercial use.

---

## 🆘 Support

For issues or questions:
1. Check Supabase logs in Dashboard → Logs
2. Open browser DevTools (F12) → Console for errors
3. Verify all SQL was run successfully

---

**Built with ❤️ using HTML, CSS, JavaScript, and Supabase**
