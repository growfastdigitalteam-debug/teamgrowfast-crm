# 🏢 CRM TeamGrowFast Dashboard

> A modern, full-stack multi-tenant CRM system built with Next.js 16, Supabase, and TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

---

## ✨ Features

### 🔐 **Authentication**
- Email/Password authentication
- Google OAuth integration
- Secure session management
- Password reset functionality

### 📊 **Dashboard**
- Real-time statistics
- Recent leads overview
- Growth metrics
- Quick action cards

### 👥 **Leads Management**
- Full CRUD operations
- Advanced search & filtering
- Status tracking (7 stages)
- Priority levels
- Source tracking
- Export capabilities

### 🏘️ **Property Management**
- Property listings CRUD
- Multi-field property details
- Status tracking (6 stages)
- Price management
- Location tracking
- Configuration details (BHK, area, etc.)

### 🎨 **Modern UI/UX**
- Responsive design (mobile, tablet, desktop)
- Dark mode ready
- Smooth animations
- Toast notifications
- Loading states
- Empty states with CTAs

### 🔒 **Security**
- Row Level Security (RLS)
- Multi-tenant architecture
- Role-based access control
- Audit trails
- Soft deletes

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

```bash
# 1. Clone the repository (if using git)
git clone <your-repo-url>
cd crm-team-grow-fast-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your CRM!

**📖 For detailed setup instructions, see [QUICK_START.md](./QUICK_START.md)**

---

## 📁 Project Structure

```
crm-team-grow-fast-dashboard/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── login/               # Login page
│   │   ├── signup/              # Sign up page
│   │   └── callback/            # OAuth callback
│   ├── dashboard/               # Dashboard pages
│   │   ├── page.tsx            # Main dashboard
│   │   ├── leads-center/       # Leads management
│   │   └── property-manager/   # Property management
│   └── layout.tsx              # Root layout
├── components/                  # React components
│   ├── dashboard-nav.tsx       # Navigation sidebar
│   └── ui/                     # Shadcn UI components
├── lib/                        # Utilities & configs
│   ├── supabase/              # Supabase integration
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   ├── hooks.ts           # React hooks
│   │   ├── queries.ts         # Database queries
│   │   └── auth.ts            # Auth utilities
│   └── utils.ts               # Helper functions
├── public/                     # Static assets
├── supabase-schema.sql        # Database schema
└── package.json               # Dependencies
```

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://reactjs.org/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[Shadcn UI](https://ui.shadcn.com/)** - Component library
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications

### Backend
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions
  - Storage

### Developer Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Prettier** (via Tailwind) - Code formatting

---

## 📊 Database Schema

### Core Tables
- **tenants** - Multi-tenant organizations
- **users** - User profiles and authentication
- **leads** - Lead management and tracking
- **properties** - Property listings
- **activities** - Interaction history
- **deals** - Sales pipeline
- **crm_settings** - Customizable settings

**Full schema**: See [supabase-schema.sql](./supabase-schema.sql)

---

## 🎯 Key Features Breakdown

### Dashboard (`/dashboard`)
- 📈 Real-time statistics
- 📋 Recent leads table
- 🚀 Quick action cards
- 📊 Growth metrics

### Leads Center (`/dashboard/leads-center`)
- ➕ Add new leads
- ✏️ Edit existing leads
- 🗑️ Delete leads (soft delete)
- 🔍 Search by name, email, phone, company
- 🎛️ Filter by status and source
- 📊 Stats cards (Total, New, Qualified, Won)
- 🏷️ Color-coded status badges
- ⚡ Priority levels

### Property Manager (`/dashboard/property-manager`)
- ➕ Add properties
- ✏️ Edit properties
- 🗑️ Delete properties (soft delete)
- 🏠 Property types (8 options)
- 📍 Location tracking
- 💰 Price management
- 🛏️ Configuration (BHK, bathrooms, area)
- 🎨 Status badges (6 stages)

---

## 🔐 Authentication Flow

```
User → Login Page → Supabase Auth → Session Created → Dashboard
                                    ↓
                              User Profile Loaded
                                    ↓
                              Tenant ID Retrieved
                                    ↓
                              RLS Policies Applied
                                    ↓
                              Tenant-Scoped Data
```

---

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete feature documentation
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed Supabase setup guide
- **[PROPERTY_MANAGER_README.md](./PROPERTY_MANAGER_README.md)** - Property Manager documentation

---

## 🎨 Screenshots

### Login Page
Modern authentication with email/password and Google OAuth

### Dashboard
Real-time stats, recent leads, and quick actions

### Leads Center
Comprehensive lead management with search and filters

### Property Manager
Full property CRUD with detailed information

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup

1. Create a Supabase project
2. Run the SQL schema (`supabase-schema.sql`)
3. Enable Google OAuth (optional)
4. Configure RLS policies (included in schema)

---

## 🚦 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## 🎯 Roadmap

### ✅ Completed
- [x] Authentication system
- [x] Dashboard with stats
- [x] Leads management
- [x] Property management
- [x] Search & filters
- [x] Responsive design
- [x] Multi-tenant support

### 🔲 Planned Features
- [ ] Activity timeline
- [ ] Deals/Pipeline view
- [ ] Email notifications
- [ ] Real-time updates
- [ ] Advanced analytics
- [ ] Image uploads
- [ ] Document management
- [ ] Team collaboration
- [ ] Mobile app
- [ ] API endpoints

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful icon library

---

## 📞 Support

For support, email support@teamgrowfast.com or open an issue in the repository.

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ by the TeamGrowFast team**

---

## 📊 Project Stats

- **Lines of Code**: 10,000+
- **Components**: 50+
- **Pages**: 10+
- **Database Tables**: 7
- **Features**: 20+
- **Status**: Production Ready ✅

---

**Ready to grow your business? Let's go! 🚀**
