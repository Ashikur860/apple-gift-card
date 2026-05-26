# � Apple Rewards — Premium Digital Rewards Platform

> An Apple-inspired luxury digital rewards platform with premium UI design.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Tech Stack](https://img.shields.io/badge/HTML%20%7C%20CSS%20%7C%20JS%20%7C%20Supabase-blue)

---

## ✨ Features

### For Users
- � Browse premium digital rewards (Apple Credit, Store Credit, Digital Vouchers, Entertainment Pass, Shopping Rewards)
- 📝 Submit reward claims with secure form (Name, Email, Country only)
- ⚡ Real-time processing with animated progress bar (10-15 seconds)
- 🎫 Automatic reward code generation (APL-XXXXXX format)
- 📊 Premium user dashboard with claim history and codes
- 🔐 Secure authentication with Supabase Auth
- 🔔 Toast notifications for all actions

### For Admins
- 📊 Dashboard overview with live statistics
- 👥 User management with role controls
- 📝 Claims management with status updates
- 🎁 Reward management (add, edit, delete rewards with custom colors)
- 🔔 Real-time activity tracking

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Page structure |
| **CSS3** | Premium styling with Apple-inspired design |
| **Vanilla JavaScript** | Client-side logic |
| **Supabase** | Authentication & PostgreSQL database |
| **Row Level Security** | Secure data access |

---

## 📁 Project Structure

```
gift-card-project/
├── index.html          # Apple-inspired landing page
├── login.html          # Clean auth page
├── register.html       # Registration form
├── dashboard.html      # Premium user dashboard
├── admin.html          # Admin panel with sidebar
├── style.css           # Apple-inspired stylesheet
├── app.js              # Core JavaScript with Supabase
├── config.js           # Supabase configuration
├── index.js            # Landing page functionality
├── schema.sql          # Database schema for rewards
└── README.md           # This file
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
3. Copy the entire contents of `schema.sql`
4. Click **Run**

This creates:
- `users` table (extends Supabase auth)
- `rewards` table (rewards catalog)
- `claims` table (user submitted claims)
- `coupons` table (generated reward codes)
- RLS policies for security
- Sample rewards (Apple, Store Credit, Entertainment, etc.)

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
git remote add origin https://github.com/yourusername/apple-rewards.git
git push -u origin main
```

2. In Vercel, import the GitHub repository
3. Click **Deploy**

### After Deployment

1. Copy your Vercel domain (e.g., `https://apple-rewards.vercel.app`)
2. Add it to Supabase **Redirect URLs**:
   - Go to Supabase → Authentication → URL Configuration
   - Add: `https://your-domain.vercel.app/**`

---

## 🔑 Default Accounts

### Admin Account
| Field | Value |
|---|---|
| Email | `admin@applerewards.com` (or your custom) |
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

#### `rewards`
- `id` - UUID
- `name` - Reward name
- `icon` - Emoji icon
- `amount` - Reward amount
- `description` - Reward description
- `color_start/color_end` - Card gradient colors
- `is_active` - Boolean

#### `claims`
- `id` - UUID
- `user_id` - Reference to users
- `reward_id` - Reference to rewards
- `full_name` - User full name
- `email` - User email
- `country` - User country
- `status` - pending/processing/completed/rejected
- `submitted_at` - Timestamp
- `admin_notes` - Admin comments

#### `coupons`
- `id` - UUID
- `claim_id` - Reference to claims
- `user_id` - Reference to users
- `code` - Generated reward code
- `amount` - Coupon value
- `generated_at` - Timestamp

---

## 🎨 Customization

### Change Rewards

Edit the INSERT statement in `schema.sql`:

```sql
INSERT INTO public.rewards (name, icon, amount, description, color_start, color_end) VALUES
  ('Your Reward', '🎁', 100.00, 'Description', '#0071e3', '#42a5f5')
```

### Change Colors

Edit CSS variables in `style.css`:

```css
:root {
  --apple-blue: #your-color;
  --gradient-blue: linear-gradient(135deg, #your-color 0%, #your-color2 100%);
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

### "Failed to load rewards"
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

**Built with ❤️ — Apple-inspired luxury design**
