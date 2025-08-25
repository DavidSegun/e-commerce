#  Multi-Tenant E-Commerce Platform

A comprehensive multi-tenant e-commerce platform where creators can set up their own storefronts, sell digital products, and get paid through Stripe Connect. Built with Next.js 15, Payload CMS, and modern web technologies.

## 🏗️ Multi-Tenant Architecture

### **How It Works**

This platform uses a **shared database with tenant isolation** approach, not separate databases per tenant:

```
📊 Single MongoDB Database
├── 👥 Users Collection (shared)
├── 🏪 Tenants Collection (shared)
├── 📚 Books Collection (tenant-filtered)
├── 🖼️ Media Collection (tenant-filtered)
├── 📝 Orders Collection (tenant-filtered)
└── ⭐ Reviews Collection (tenant-filtered)
```

### **Architecture Components**

**✅ Single Frontend + Single Backend + Single Database**

- One Next.js application serves all tenants
- One PayloadCMS backend handles all data
- One MongoDB database stores everything

**🔒 Tenant Isolation Through Data Fields**
Instead of separate databases, each tenant-specific record includes a `tenant` field:

```typescript
// Example book record
{
  id: "book123",
  name: "My Awesome Book",
  price: 29.99,
  tenant: "creator-store-id", // 👈 Links to specific tenant
  // ... other fields
}
```

**🎭 PayloadCMS Multi-Tenant Plugin**
The `@payloadcms/plugin-multi-tenant` plugin automatically:

- Adds `tenant` fields to specified collections
- Filters queries to show only current tenant's data
- Handles access control based on user-tenant relationships

```typescript
// In payload.config.ts
multiTenantPlugin<Config>({
  collections: {
    books: {}, // Tenant-specific
    media: {}, // Tenant-specific
  },
});
```

**🌐 Subdomain Routing**
Middleware handles subdomain routing seamlessly:

- `creator1.yourdomain.com` → Shows only Creator1's products
- `creator2.yourdomain.com` → Shows only Creator2's products
- Same codebase, different data context!

```typescript
// middleware.ts - Extracts tenant from subdomain
if (hostname.endsWith(`.${rootDomain}`)) {
  const tenantSlug = hostname.replace(`.${rootDomain}`, "");
  return NextResponse.rewrite(
    new URL(`/tenants/${tenantSlug}${url.pathname}`, req.url)
  );
}
```

### **Data Filtering Process**

When someone visits `john.yourdomain.com`:

1. **Middleware** extracts "john" from subdomain
2. **Database Query** finds tenant where `slug = "john"`
3. **PayloadCMS Plugin** automatically filters all queries:
   ```typescript
   // Transforms: "Find all books"
   // Into: "Find all books WHERE tenant = 'john-tenant-id'"
   ```

### **User-Tenant Relationships**

Users can be associated with multiple tenants:

```typescript
// User record structure
{
  id: "user123",
  email: "john@example.com",
  tenants: [
    { tenant: "john-store-id" }  // User owns this store
  ]
}
```

### **Benefits of This Approach**

- **💰 Cost Effective**: Single database to maintain
- **🔧 Simple Infrastructure**: No per-tenant database provisioning
- **📈 Easy Scaling**: Add tenants without new databases
- **🤝 Resource Sharing**: Categories/tags shared across tenants
- **📊 Platform Analytics**: Easy cross-tenant reporting

### **Security & Data Isolation**

- PayloadCMS plugin ensures complete tenant data separation
- Access control prevents unauthorized cross-tenant access
- Super admins can access all tenant data when needed
- Regular users only see their own tenant's data

This **"shared database, shared schema"** model is the most efficient approach for SaaS multi-tenancy!

## 🚀 Key Features

### 🏬 **Multi-Tenant Architecture**

- **Vendor Subdomains**: Each creator gets their own subdomain (e.g., `creator.yourdomain.com`)
- **Custom Storefronts**: Personalized merchant pages with custom branding
- **Isolated Product Catalogs**: Each tenant manages their own products independently

### 💳 **Payment & Commerce**

- **Stripe Connect Integration**: Seamless payment processing for multiple vendors
- **Automatic Platform Fees**: Configurable commission system
- **Secure Checkout**: PCI-compliant payment handling
- **Digital Product Delivery**: Automated file delivery after purchase

### 📚 **Content Management**

- **Payload CMS Backend**: Powerful headless CMS for content management
- **Category & Product Filtering**: Advanced search and filtering capabilities
- **Image Upload Support**: Integrated media management
- **Rich Content Editing**: WYSIWYG editor for product descriptions

### 👤 **User Experience**

- **Personal Libraries**: Users can access their purchased products
- **Product Reviews & Ratings**: Community-driven product feedback
- **Advanced Search**: Multi-faceted search functionality
- **Responsive Design**: Mobile-first responsive interface

### 🛡️ **Security & Access Control**

- **Role-Based Access Control (RBAC)**: Granular permission system
- **Authentication System**: Secure user registration and login
- **Admin Dashboard**: Platform administration interface
- **Merchant Dashboard**: Vendor management tools

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Styling**: TailwindCSS V4 + ShadcnUI Components
- **Backend**: Payload CMS
- **Database**: MongoDB (configurable)
- **Payments**: Stripe Connect
- **Type Safety**: TypeScript
- **State Management**: Zustand
- **API Layer**: tRPC
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
lexi/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/             # Main application routes
│   │   │   ├── (auth)/        # Authentication pages
│   │   │   ├── (home)/        # Public homepage & categories
│   │   │   ├── (library)/     # User library pages
│   │   │   └── (tenants)/     # Multi-tenant storefront pages
│   │   ├── (payload)/         # Payload CMS admin
│   │   └── api/               # API routes (tRPC, Stripe webhooks)
│   │
│   ├── collections/           # Payload CMS collections
│   │   ├── Books.ts           # Digital products schema
│   │   ├── Categories.ts      # Product categories
│   │   ├── Orders.ts          # Order management
│   │   ├── Reviews.ts         # Product reviews
│   │   ├── Tenants.ts         # Multi-tenant configuration
│   │   └── Users.ts           # User management
│   │
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication logic
│   │   ├── books/             # Product management
│   │   ├── checkout/          # Shopping cart & checkout
│   │   ├── home/              # Homepage components
│   │   ├── library/           # User library
│   │   ├── reviews/           # Review system
│   │   └── tenants/           # Multi-tenant logic
│   │
│   ├── components/ui/         # Reusable UI components
│   ├── lib/                   # Utility functions
│   └── trpc/                  # tRPC configuration
│
├── public/                    # Static assets
└── media/                     # Uploaded media files
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended for faster installs and builds) or npm/yarn/pnpm
- MongoDB database
- Stripe account (for payments)

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd lexi

# Install dependencies (Bun recommended)
bun install

# Alternative package managers
# npm install
# yarn install
# pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URI=mongodb://localhost:27017/lexi

# Payload CMS
PAYLOAD_SECRET=your-payload-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING=false

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Development
NODE_ENV=development
```

### 3. Environment Variables Explained

- **DATABASE_URI**: MongoDB connection string. Use a local MongoDB instance or MongoDB Atlas
- **PAYLOAD_SECRET**: A secure random string used by Payload CMS for JWT tokens
- **STRIPE_SECRET_KEY**: Your Stripe secret key (use test key for development)
- **STRIPE_WEBHOOK_SECRET**: Webhook endpoint secret from your Stripe dashboard
- **NEXT_PUBLIC_APP_URL**: The base URL of your application (includes protocol)
- **NEXT_PUBLIC_ROOT_DOMAIN**: Your root domain for subdomain routing (without protocol)
- **NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING**: Set to "true" in production for multi-tenant subdomains
- **BLOB_READ_WRITE_TOKEN**: Vercel Blob storage token for file uploads
- **NODE_ENV**: Set to "development" for local development, "production" for deployment

### 4. Database Setup

```bash
# Seed the database with initial data
bun run db:seed

# Or reset and seed the database completely
bun run db:reset
```

### 5. Development Server

```bash
# Start development server (Bun recommended)
bun dev

# Alternative package managers
# npm run dev
# yarn dev
# pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🎯 Core Functionality

### Multi-Tenant Storefronts

Each creator gets their own subdomain with:

- Custom product catalog
- Branded storefront design
- Independent inventory management
- Separate analytics and reporting

### Digital Product Management

- **Upload & Organize**: Easy product upload with rich descriptions
- **Categories & Tags**: Hierarchical organization system
- **Pricing Controls**: Flexible pricing options
- **Inventory Tracking**: Stock management for limited releases

### Stripe Connect Integration

- **Onboarding**: Streamlined merchant onboarding flow
- **Split Payments**: Automatic platform fee deduction
- **Payout Management**: Direct payouts to merchant accounts
- **Webhook Handling**: Real-time payment status updates

### Review System

- **Star Ratings**: 5-star rating system
- **Written Reviews**: Detailed customer feedback
- **Review Moderation**: Admin controls for content quality
- **Aggregate Scores**: Automatic rating calculations

## 🔧 Configuration

### Payload CMS Configuration

The CMS is configured in `src/payload.config.ts` with:

- Custom collections for products, users, orders
- File upload handling
- Access control policies
- Admin interface customization

### Multi-Tenant Setup

Subdomain routing is handled through:

- Next.js middleware for subdomain detection
- Dynamic tenant resolution
- Isolated data contexts per tenant

### Stripe Connect Setup

1. Create a Stripe Connect platform account
2. Configure webhook endpoints
3. Set up platform fee structure
4. Implement merchant onboarding flow

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Set up custom domain with wildcard subdomain support
4. Deploy with automatic CI/CD

### Manual Deployment

```bash
# Build the application
bun run build

# Start production server
bun start
```

### Domain Configuration

For multi-tenant subdomains:

1. Configure DNS with wildcard subdomain (`*.yourdomain.com`)
2. Set up SSL certificates for subdomains
3. Update environment variables for production URLs

## 📊 Admin Features

### Platform Administration

- User management and role assignment
- Platform-wide analytics and reporting
- Content moderation tools
- System configuration

### Merchant Dashboard

- Product management interface
- Order tracking and fulfillment
- Revenue analytics
- Customer communication tools

## 🔒 Security Features

- **Role-Based Access Control**: Granular permissions system
- **Secure File Handling**: Protected media uploads
- **Payment Security**: PCI-compliant payment processing
- **Data Validation**: Comprehensive input sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples in the modules

## 🎉 Acknowledgments

Built with modern web technologies:

- [Next.js](https://nextjs.org/) - React framework
- [Payload CMS](https://payloadcms.com/) - Headless CMS
- [Stripe](https://stripe.com/) - Payment processing
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [ShadcnUI](https://ui.shadcn.com/) - Component library
