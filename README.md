# 🛍️ Shopify Product Reviews App

A **production-ready**, full-stack Shopify embedded application for managing product reviews, store feedback, and customer Q&A — built on the **MERN stack** with **React Router v7**, **Prisma ORM**, and **MongoDB**. Designed with clean architecture, modular services, and Shopify's native **Polaris UI** for a seamless merchant experience.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Shopify Polaris, Recharts |
| **Routing** | React Router v7 (formerly Remix) |
| **Backend** | Node.js, React Router Server |
| **Database** | MongoDB Atlas |
| **ORM** | Prisma |
| **Auth** | Shopify OAuth / App Bridge |
| **Billing** | Shopify Billing API (Recurring & One-Time) |
| **Storefront** | Shopify App Proxy, Theme Extension (Liquid) |
| **Email** | Nodemailer (SMTP) |
| **DevOps** | Docker, ESLint, Prettier |

---

## ✨ Key Features

### 🏪 Merchant Dashboard
- Real-time analytics with **interactive charts** (Recharts) — review growth trends, rating distribution, response rate metrics
- Advanced review management with **bulk actions** (approve, delete, export)
- Smart **search & filtering** by product, rating, date, and review type
- Individual review detail pages with **merchant reply** functionality

### ⭐ Review System
- Support for **3 review types**: Product Reviews, Store Reviews, and Customer Questions
- Photo upload support for rich customer reviews
- **Helpful / Unhelpful voting** system for community-driven review quality
- Automated **email notifications** to customers on merchant replies

### 💳 Billing & Subscription
- Full **Shopify Billing API** integration with plan management
- Support for recurring (monthly/annual) and one-time charges
- Trial period support with automated expiry tracking
- Billing callback handling and subscription status management

### 🎨 Storefront Integration
- **Shopify App Proxy** for secure, server-side review data delivery to the storefront
- **Theme Extension** with Liquid blocks — drop-in review widgets for any Shopify theme
- Floating review widget and inline product review blocks
- Custom CSS/JS assets for storefront rendering

### 🔒 Security & Compliance
- Shopify **OAuth 2.0** authentication with session management
- **GDPR-compliant** webhook handlers (customer data request, customer redaction, shop redaction)
- CORS utility for secure cross-origin API access
- Webhook handlers for app lifecycle events (install, uninstall, scope updates)

---

## 📁 Project Structure

```
shopify-review-app/
├── app/
│   ├── components/              # Reusable React UI components
│   │   ├── BulkActionsBar.jsx       # Bulk select & action toolbar
│   │   ├── ConfirmModal.jsx         # Reusable confirmation dialog
│   │   ├── DashboardModals.jsx      # Dashboard-specific modals
│   │   ├── RatingDistribution.jsx   # Star rating breakdown chart
│   │   ├── ReplyModal.jsx           # Merchant reply form modal
│   │   ├── ResponseRateCircle.jsx   # Circular progress indicator
│   │   ├── ReviewsGrowthChart.jsx   # Time-series review chart (Recharts)
│   │   ├── ReviewsSection.jsx       # Review list section wrapper
│   │   ├── ReviewsTable.jsx         # Paginated reviews data table
│   │   ├── SearchBar.jsx            # Search & filter controls
│   │   ├── StatCard.jsx             # Metric display card
│   │   ├── ToastNotification.jsx    # Toast alert component
│   │   ├── TopProducts.jsx          # Top reviewed products list
│   │   └── WarningBanner.jsx        # Warning/info banner
│   │
│   ├── routes/                  # React Router v7 file-based routes
│   │   ├── app._index.jsx          # Main merchant dashboard
│   │   ├── app.billing.jsx         # Billing & subscription page
│   │   ├── app.billing.callback.jsx # Billing callback handler
│   │   ├── app.review.$id.jsx      # Individual review detail page
│   │   ├── app.jsx                 # App layout (Polaris + App Bridge)
│   │   ├── app.api.reviews.jsx     # Authenticated review API
│   │   ├── api.public.reviews.jsx  # Public App Proxy API
│   │   ├── api.reviews.jsx         # REST review endpoints
│   │   ├── auth.$.jsx              # Shopify OAuth handler
│   │   ├── auth.login/             # Login route module
│   │   ├── _index/                 # Landing page
│   │   └── webhooks.*.jsx          # Shopify webhook handlers (6 files)
│   │
│   ├── services/                # Business logic layer (server-side)
│   │   ├── adminReview.server.js    # Admin review CRUD operations
│   │   ├── product.server.js        # Shopify product data fetching
│   │   ├── publicReview.server.js   # Public-facing review queries
│   │   ├── review.server.js         # Core review service
│   │   ├── reviewActions.server.js  # Review action handlers
│   │   ├── shop.server.js           # Shop data service
│   │   └── webhook.server.js        # Webhook processing logic
│   │
│   ├── utils/                   # Utility functions
│   │   └── cors.js                  # CORS headers helper
│   │
│   ├── billing.server.js       # Shopify Billing API integration
│   ├── db.server.js             # Prisma database client
│   ├── mailer.server.js         # Email notification service (Nodemailer)
│   ├── mongo-session-storage.server.js  # Custom MongoDB session storage
│   ├── shopify.server.js        # Shopify API configuration
│   ├── entry.client.jsx         # Client-side entry point
│   ├── entry.server.jsx         # Server-side entry point
│   └── root.jsx                 # Root layout component
│
├── extensions/
│   └── theme-extension/         # Shopify Theme Extension
│       ├── assets/
│       │   ├── reviews.css          # Storefront review widget styles
│       │   └── reviews.js           # Storefront review widget logic
│       ├── blocks/
│       │   ├── reviews.liquid       # Inline review block
│       │   └── floating-reviews.liquid  # Floating review widget
│       └── shopify.extension.toml   # Extension configuration
│
├── prisma/
│   ├── schema.prisma            # Database schema (Session, Review, BillingDetail)
│   ├── migrations/              # Database migration files
│   └── seed-review.js           # Seed script for test data
│
├── scripts/
│   └── reset_billing.js         # Billing reset utility
│
├── public/                      # Static assets
├── shopify.app.toml             # Shopify app configuration
├── shopify.web.toml             # Shopify web configuration
├── vite.config.js               # Vite bundler configuration
├── Dockerfile                   # Docker container setup
├── .env.example                 # Environment variables template
└── package.json                 # Dependencies & scripts
```

---

## 🛠 Prerequisites

- **Node.js** v18.20+ or v20.10+
- **pnpm** package manager
- **MongoDB Atlas** connection string
- **Shopify Partner** account with a development store

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/EhsanAfzal005/shopify-review-app.git
cd shopify-review-app
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

```env
DATABASE_URL="mongodb+srv://user:password@host/db?appName=AppName"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_PASS=your_app_password
```

### 4. Database Setup

```bash
pnpm prisma generate
pnpm prisma db push
```

### 5. Start Development Server

```bash
pnpm dev
```

The app will launch through the Shopify CLI and tunnel to your development store.

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| **Session** | Manages Shopify OAuth sessions, tokens, and user info |
| **Review** | Stores reviews with ratings, photos, replies, helpfulness votes, and type classification |
| **BillingDetail** | Tracks merchant subscription plans, billing intervals, trial periods, and charge status |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Shopify development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run production server |
| `pnpm prisma generate` | Generate Prisma client |
| `pnpm prisma db push` | Push schema changes to database |
| `pnpm lint` | Run ESLint |
| `pnpm deploy` | Deploy app via Shopify CLI |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 📝 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Ehsan Afzal**
