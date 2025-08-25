# BrewBook — Next.js + Supabase + shadcn/ui Boilerplate

A mobile‑first recipe app for coffee and specialty drinks (coffee, matcha, ube, teas) with AI helpers. Built on **Next.js (App Router)**, **Tailwind CSS**, **shadcn/ui**, **Supabase** (Auth + Postgres + Storage), optional **Cloudinary**, and packaged for **Docker** + **Kubernetes** (with a Helm chart).

## ✨ Features

- **Onboarding** with preference selection (Coffee, Matcha, Ube, Seasonal) + Sign in with Google/Apple (via Supabase) or continue as Guest
- **Home/Discover** feed with **Drink of the Day** (from AI) and sections: For You, Trending, Seasonal Specials
- **Recipe Detail**: image/video, ingredients, steps; actions: Save, **AI Remix**, Share
- **AI Recipe Generator**: given ingredients or an existing recipe, returns 3 ideas
- **Create/Upload recipe** (title, ingredients, steps, media upload) + optional AI assist (auto-format + name suggestions)
- **Saved Recipes** with search + filters (type, hot/iced)
- **Phase 2** (optional): Community explore, weekly challenges, likes/comments (scaffolded but feature-flagged)
- **Dark theme** with coffee‑inspired accents (black, brown, violet)
- **Production‑ready** structure, modular components, SSR-friendly Supabase client

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd brewbook

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp env.example .env.local

# Edit .env.local with your credentials
# - Supabase URL and keys
# - OpenAI API key
# - Optional Cloudinary credentials
```

### 3. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase/migrations/001_init.sql` in your Supabase SQL editor
3. Create a storage bucket called `recipe-media` (public)
4. Configure OAuth providers (Google/Apple) in Authentication > Providers

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🗂️ Project Structure

```
brewbook/
├─ app/                          # Next.js App Router
│  ├─ (marketing)/              # Marketing pages (if needed)
│  ├─ (main)/                   # Main app pages
│  │  ├─ layout.tsx             # Shell layout (nav, theme)
│  │  ├─ page.tsx               # Home/Discover
│  │  ├─ onboarding/page.tsx    # Onboarding & auth
│  │  ├─ recipes/               # Recipe management
│  │  ├─ saved/page.tsx         # Saved/bookmarks
│  │  └─ generator/page.tsx     # AI Recipe Generator
│  ├─ api/                      # API routes
│  │  ├─ ai/                    # AI endpoints
│  │  ├─ drink-of-day/          # Drink of the day
│  │  └─ recipes/               # Recipe CRUD
│  └─ globals.css               # Global styles
├─ components/                   # React components
│  ├─ ui/                       # shadcn/ui components
│  ├─ cards/                    # Recipe cards
│  ├─ forms/                    # Forms
│  ├─ nav/                      # Navigation
│  ├─ layout/                   # Layout components
│  └─ shared/                   # Shared components (EmptyState, LoadingSpinner, ErrorBoundary)
├─ lib/                         # Utilities and config
│  ├─ supabase/                 # Supabase clients
│  ├─ openai.ts                 # OpenAI API functions
│  ├─ auth.ts                   # Authentication
│  └─ validators.ts             # Zod schemas
├─ types/                       # TypeScript types
├─ styles/                      # Theme CSS
├─ supabase/                    # Database schema
├─ k8s/                        # Kubernetes manifests
├─ helm/                        # Helm chart
└─ Dockerfile                   # Docker configuration
```

## 🔐 Environment Variables

Required environment variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# OpenAI
OPENAI_API_KEY="sk-..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🧱 Key Components

### Authentication
- **Supabase Auth** with OAuth providers (Google/Apple)
- **Server-side session management** for SSR
- **Guest mode** for non-authenticated users

### AI Integration
- **OpenAI GPT-4o-mini** for recipe generation
- **Drink of the Day** with 6-hour caching
- **Recipe remixing** from existing recipes
- **Ingredient-based generation**

### Database Schema
- **Recipes table** with type, temperature, ingredients, steps
- **Saved recipes** for user bookmarks
- **Row Level Security** for data protection
- **PostgreSQL arrays** for ingredients and steps

### Error Handling & UX
- **Error boundaries** for graceful error handling
- **Loading states** with spinners
- **Empty states** with helpful messaging
- **Responsive design** for mobile-first experience

## 🐳 Docker & Kubernetes

### Local Development
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Kubernetes Deployment
```bash
# Apply manifests directly
kubectl apply -f k8s/

# Or use Helm chart
helm upgrade --install brewbook ./helm/brewbook \
  --set image.repository=your-registry/brewbook \
  --set image.tag=latest \
  --set ingress.host=brewbook.example.com
```

### Helm Chart
The Helm chart includes:
- Configurable replica count and resources
- Ingress configuration
- Secret management
- Values-based customization

## 🎨 Styling & Theme

### Tailwind CSS
- **Coffee-inspired color palette** (browns, violets)
- **Mobile-first responsive design**
- **Dark theme** by default
- **Custom CSS variables** for theming

### shadcn/ui Components
- **Button, Card, Input, Textarea**
- **Select, Badge, Sheet, Dialog**
- **Form components** with validation
- **Toast notifications**

## 🔧 Development

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
```

### Adding New Components
```bash
# Add shadcn/ui components
npx shadcn@latest add <component-name>

# Example
npx shadcn@latest add table
```

### Database Changes
1. Create new migration in `supabase/migrations/`
2. Update types in `types/index.ts`
3. Test with local Supabase instance

## 🚀 Production Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Self-Hosted
1. Build Docker image: `docker build -t brewbook .`
2. Push to registry
3. Deploy with Kubernetes manifests or Helm chart

### Environment Setup
- Ensure all environment variables are set
- Configure Supabase production project
- Set up proper domain and SSL
- Configure monitoring and logging

## 🔮 Future Enhancements

### Phase 2 Features
- **Community features**: likes, comments, sharing
- **Weekly challenges**: themed recipe contests
- **Advanced search**: filters, tags, ingredients
- **Social features**: follow users, recipe collections

### Technical Improvements
- **Image optimization**: Cloudinary integration
- **Caching**: Redis for better performance
- **Analytics**: User behavior tracking
- **Testing**: Jest, Playwright setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Supabase** for the backend-as-a-service
- **shadcn/ui** for the beautiful component library
- **OpenAI** for the AI capabilities
- **Tailwind CSS** for the utility-first styling

---

**BrewBook** - Where every cup tells a story ☕✨
