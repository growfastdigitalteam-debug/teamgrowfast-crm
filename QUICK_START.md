# 🚀 Quick Start Guide - CRM TeamGrowFast

Get your CRM up and running in **5 minutes**!

---

## ⚡ Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works!)
- Git (optional)

---

## 📋 Step-by-Step Setup

### **Step 1: Install Dependencies** (1 minute)

```bash
cd crm-team-grow-fast-dashboard
npm install
```

---

### **Step 2: Create Supabase Project** (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `crm-teamgrowfast`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait for project to be ready (~2 minutes)

---

### **Step 3: Get Your API Keys** (30 seconds)

1. In your Supabase project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

### **Step 4: Configure Environment** (30 seconds)

1. Create a file named `.env.local` in the project root
2. Add your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important**: Replace the values with YOUR actual keys!

---

### **Step 5: Set Up Database** (1 minute)

1. In Supabase, go to **SQL Editor**
2. Click **"New query"**
3. Open the file `supabase-schema.sql` from your project
4. Copy ALL the content
5. Paste it into the SQL Editor
6. Click **"Run"** (bottom right)
7. Wait for success message ✅

---

### **Step 6: Create Your First User** (Optional)

**Option A: Use the App (Recommended)**
1. Start the dev server (see Step 7)
2. Go to `/auth/signup`
3. Create your account

**Option B: Use Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter email and password
4. Click **"Create user"**

---

### **Step 7: Start the App** (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎉 You're Done!

You should now see the **login page**. 

### Demo Credentials (if you want to test quickly):
```
Email: demo@teamgrowfast.com
Password: demo123456
```

**Note**: You'll need to create this user in Supabase first!

---

## 🗺️ Navigation Guide

After logging in, you'll see:

### **Main Dashboard** (`/dashboard`)
- Overview stats
- Recent leads
- Quick actions

### **Leads Center** (`/dashboard/leads-center`)
- View all leads
- Search and filter
- Add/Edit/Delete leads

### **Property Manager** (`/dashboard/property-manager`)
- View all properties
- Add/Edit/Delete properties
- Property stats

---

## 🔧 Common Issues & Fixes

### ❌ "Failed to load properties/leads"

**Cause**: User doesn't have a `tenant_id`

**Fix**:
1. Go to Supabase → **Table Editor** → **users**
2. Find your user
3. Click **Edit**
4. Add a `tenant_id`:
   - Go to **Table Editor** → **tenants**
   - Click **Insert row**
   - Add: `name: "My Company"`, `slug: "my-company"`
   - Copy the generated `id`
   - Go back to **users** table
   - Set `tenant_id` to the copied id
   - Set `role` to `admin`

---

### ❌ "Authentication required"

**Cause**: Not logged in or session expired

**Fix**:
1. Go to `/auth/login`
2. Sign in again

---

### ❌ Environment variables not working

**Cause**: `.env.local` not loaded

**Fix**:
1. Restart the dev server
2. Make sure file is named exactly `.env.local` (not `.env.local.txt`)
3. Make sure it's in the project root (same folder as `package.json`)

---

### ❌ "Cannot find module '@/components/ui/...'"

**Cause**: Shadcn components not installed

**Fix**:
```bash
# Install all required Shadcn components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add textarea
npx shadcn@latest add badge
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar
npx shadcn@latest add separator
```

Or install all at once:
```bash
npx shadcn@latest add button card dialog input label select table textarea badge dropdown-menu avatar separator
```

---

## 📚 Next Steps

1. **Customize Your CRM**
   - Add your company logo
   - Update color scheme in `tailwind.config.ts`
   - Add custom fields to forms

2. **Add More Data**
   - Create properties
   - Add leads
   - Assign leads to properties

3. **Explore Features**
   - Try search and filters
   - Edit and delete items
   - Check out the dashboard stats

4. **Read Documentation**
   - `IMPLEMENTATION_SUMMARY.md` - Full feature list
   - `SUPABASE_SETUP.md` - Detailed Supabase guide
   - `PROPERTY_MANAGER_README.md` - Property Manager docs

---

## 🆘 Need Help?

1. Check the **IMPLEMENTATION_SUMMARY.md** for detailed docs
2. Review **SUPABASE_SETUP.md** for Supabase-specific help
3. Check browser console for error messages
4. Check Supabase logs in the dashboard

---

## 🎯 Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## ✅ Checklist

Before you start, make sure:

- [ ] Node.js 18+ installed
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] `.env.local` file created with correct keys
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] User created in Supabase
- [ ] User has `tenant_id` set
- [ ] Browser opened to `http://localhost:3000`

---

## 🎊 Success!

If you can see the login page and log in successfully, **congratulations!** 🎉

Your CRM is now ready to use!

---

**Happy CRM-ing! 🚀**

---

**Need more help?** Check out:
- `IMPLEMENTATION_SUMMARY.md` - Complete feature documentation
- `SUPABASE_SETUP.md` - Detailed Supabase setup
- `PROPERTY_MANAGER_README.md` - Property Manager guide
