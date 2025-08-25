# 🚀 BrewBook Development Guide

This guide covers development setup, local development, and deployment for the BrewBook application.

## 🛠️ Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker & Docker Compose** - [Download here](https://www.docker.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd brewbook
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration from `supabase/migrations/001_init.sql`
4. Verify tables are created in Table Editor

### 4. Start Development
```bash
# Option 1: Local development
npm run dev

# Option 2: Docker development (recommended)
docker-compose up -d
```

## 🐳 Docker Development (Recommended)

### Start the App
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f brewbook
```

### Access Your App
- **Main App**: http://localhost:3000
- **Health Check**: http://localhost:3000

### Development Workflow
```bash
# Make code changes
# The container will auto-reload

# Rebuild if needed
docker-compose down
docker-compose up -d --build

# Stop services
docker-compose down
```

## 🏗️ Project Structure

```
brewbook/
├── app/                    # Next.js App Router
│   ├── (main)/           # Main app pages
│   │   ├── layout.tsx    # Main layout
│   │   ├── page.tsx      # Home page
│   │   ├── auth/         # Authentication pages
│   │   ├── recipes/      # Recipe management
│   │   └── saved/        # Saved recipes
│   ├── api/              # API routes
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── cards/            # Recipe cards
│   ├── forms/            # Forms
│   ├── layout/           # Layout components
│   ├── nav/              # Navigation
│   └── shared/           # Shared utilities
├── contexts/              # React Context providers
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   ├── services/         # Data services
│   └── validators/       # Zod schemas
├── types/                 # TypeScript types
├── styles/                # Theme and styling
├── supabase/              # Database migrations
└── public/                # Static assets
```

## 🔐 Authentication Setup

### Supabase Configuration
1. **Enable Auth** in your Supabase project
2. **Configure providers** (Email/Password, Google, etc.)
3. **Set up RLS policies** for data security
4. **Configure redirect URLs** for auth flows

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🗄️ Database Development

### Local Development
```bash
# Run migrations
# Copy SQL from supabase/migrations/001_init.sql
# Paste into Supabase SQL Editor

# Seed data (optional)
# Use the sample data from the migration file
```

### Schema Changes
1. **Create new migration** in Supabase SQL Editor
2. **Update types** in `types/index.ts`
3. **Test locally** before committing
4. **Document changes** in migration files

## 🎨 UI Development

### Adding Components
```bash
# Add shadcn/ui components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

### Theme Development
- **Colors**: Defined in `tailwind.config.ts`
- **CSS Variables**: In `styles/theme.css`
- **Dark Mode**: Toggle in `ThemeToggle` component

### Styling Guidelines
- **Mobile-first** approach
- **Consistent spacing** using Tailwind classes
- **Accessibility** with proper contrast ratios
- **Responsive design** for all screen sizes

## 🔧 Development Scripts

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🧪 Testing

### Manual Testing
1. **Authentication flow** - Sign up, login, logout
2. **Recipe CRUD** - Create, read, update, delete
3. **Save functionality** - Save/unsave recipes
4. **Theme switching** - Light/dark mode
5. **Responsive design** - Test on mobile/desktop

### Browser Testing
- **Chrome/Edge** - Primary development
- **Firefox** - Cross-browser compatibility
- **Safari** - Mobile testing
- **Mobile browsers** - Touch interaction

## 🐛 Debugging

### Common Issues
1. **Database connection** - Check Supabase credentials
2. **Authentication** - Verify RLS policies
3. **Build errors** - Check TypeScript types
4. **Styling issues** - Verify Tailwind classes

### Debug Tools
- **Browser DevTools** - Console, Network, Elements
- **React DevTools** - Component inspection
- **Docker logs** - Container debugging
- **Supabase Dashboard** - Database inspection

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Test production build
npm start
```

### Docker Production
```bash
# Build production image
docker build -t brewbook:latest .

# Run production container
docker run -p 3000:3000 brewbook:latest
```

### Environment Variables
Ensure all production environment variables are set:
- Supabase production credentials
- App URL configuration
- Any API keys or secrets

## 📱 Mobile Development

### Responsive Design
- **Mobile-first** approach
- **Touch-friendly** interactions
- **Performance** optimization
- **Progressive enhancement**

### Testing on Devices
- **Physical devices** for touch testing
- **Browser dev tools** for responsive testing
- **Performance monitoring** on mobile networks

## 🔒 Security Considerations

### Data Protection
- **Row Level Security** in Supabase
- **Input validation** with Zod schemas
- **Authentication** required for sensitive operations
- **HTTPS** in production

### Best Practices
- **Never expose** API keys in client code
- **Validate** all user inputs
- **Use prepared statements** for database queries
- **Implement rate limiting** for API endpoints

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/your-repo/issues)

---

**Happy coding! ☕✨**
