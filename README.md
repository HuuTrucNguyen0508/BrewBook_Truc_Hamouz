# 🍵 BrewBook — Next.js + Supabase + shadcn/ui Boilerplate

A mobile-first recipe app for coffee and specialty drinks (coffee, matcha, ube, teas) with user authentication and recipe management. Built on **Next.js (App Router)**, **Tailwind CSS**, **shadcn/ui**, **Supabase** (Auth + Postgres + Storage), and packaged for **Docker** + **Kubernetes** (with Helm charts).

## ✨ Features

- ☕ **Recipe Management** - Create, edit, and organize coffee/drink recipes
- 🔐 **User Authentication** - Sign up, login, and user-specific content
- 💾 **Save Recipes** - Users can save and manage their favorite recipes
- 🌙 **Theme Switching** - Light and dark mode with proper contrast
- 📱 **Mobile-First Design** - Responsive UI optimized for mobile devices
- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 🗄️ **Database** - Supabase PostgreSQL with Row Level Security
- 🐳 **Docker Ready** - Containerized for easy deployment
- ☸️ **Kubernetes Ready** - Full K8s manifests and Helm charts included
- 🔒 **Secure Secrets** - Environment variables and Kubernetes secrets management
- 🛡️ **Zero Hardcoded Secrets** - All credentials externalized and secured

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Kubernetes cluster (optional)
- Supabase account and project

### 1. Clone and Setup
```bash
git clone <your-repo>
cd brewbook
npm install
```

### 2. Environment Variables
Copy `env.template` to `.env.local` and fill in your Supabase credentials:
```bash
cp env.template .env.local
# Edit .env.local with your actual values
```

### 3. Database Setup
Run the SQL migration in your Supabase SQL Editor:
```sql
-- See supabase/migrations/001_init.sql
```

### 4. Choose Your Deployment

#### Option A: Docker Compose (Simplest)
```bash
docker-compose up -d
# Access at http://localhost:3000
```

#### Option B: Kubernetes (Production-ready)
```bash
# Build and push image
docker build -t your-username/brewbook:latest .
docker push your-username/brewbook:latest

# Deploy to K8s (secrets are automatically created from .env.local)
.\deploy-to-k8s.ps1 -DockerHubUsername your-username -ImageTag latest

# Or manually create secrets and deploy
cd k8s/secrets
.\create-secrets.ps1
kubectl apply -f brewbook-secrets.yaml
kubectl apply -f ../
kubectl port-forward service/brewbook 8080:80
# Access at http://localhost:8080
```

## 🔐 Secrets Management

**Security first!** Your sensitive data is protected:

- **`.env.local`** - Your secrets (gitignored)
- **`env.template`** - Template for environment variables
- **Automatic secret creation** - Kubernetes secrets from `.env.local`
- **No hardcoded values** - All sensitive data is externalized
- **Placeholder system** - All manifests use safe placeholders
- **Environment variables** - Docker Compose reads from `.env.local`

See [SECRETS_MANAGEMENT.md](./SECRETS_MANAGEMENT.md) for detailed instructions.

## 🐳 Docker Deployment

### Simple Docker Compose
```bash
# Start the app
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f brewbook

# Stop the app
docker-compose down
```

### Build and Run Manually
```bash
# Build the image
docker build -t brewbook .

# Run the container
docker run -p 3000:3000 brewbook
```

## ☸️ Kubernetes Deployment

### Quick Deploy
```bash
# Apply all manifests (secrets are auto-created)
kubectl apply -f k8s/

# Port forward for access
kubectl port-forward service/brewbook 8080:80
```

### Helm Deployment
```bash
# Install with Helm
helm upgrade --install brewbook ./helm/brewbook

# Customize values
helm upgrade --install brewbook ./helm/brewbook \
  --set image.repository=your-username/brewbook \
  --set image.tag=latest
```

### Service Types
- **ClusterIP** - Internal access (default)
- **LoadBalancer** - External access via cloud LB
- **NodePort** - Direct access on node ports

## 🏗️ Project Structure

```
brewbook/
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── cards/            # Recipe card components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── nav/              # Navigation components
│   ├── shared/           # Shared utility components
│   └── ui/               # shadcn/ui components
├── contexts/              # React Context providers
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase client setup
│   ├── services/         # Data service layer
│   └── validators/       # Zod schemas
├── styles/                # Global styles and theme
├── types/                 # TypeScript type definitions
├── supabase/              # Database migrations
├── public/                # Static assets
├── k8s/                   # Kubernetes manifests
│   └── secrets/          # 🔐 Secrets management
├── helm/                  # Helm charts
│   └── brewbook/secrets/ # 🔐 Helm secrets
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker build instructions
├── env.template          # Environment variables template
├── .env.local            # 🔒 Your secrets (gitignored)
├── SECRETS_MANAGEMENT.md # 🔐 Secrets management guide
└── README.md             # This file
```

## 🎨 UI Components

Built with **shadcn/ui** components:
- Button, Input, Textarea, Label
- Card, Badge, Select
- Theme toggle with light/dark mode
- Responsive navigation

## 🔐 Authentication

- **Supabase Auth** integration
- User registration and login
- Protected routes and user-specific content
- Session management with React Context

## 🗄️ Database Schema

### Tables
- **`recipes`** - Recipe data with tags, ingredients, steps
- **`saved_recipes`** - User's saved recipes (many-to-many)

### Row Level Security (RLS)
- Users can only see their own saved recipes
- Recipe creation requires authentication
- Public read access to all recipes

## 🌙 Theme System

- **Light/Dark mode** toggle
- **CSS variables** for consistent theming
- **Proper contrast** for accessibility
- **Persistent** theme preference

## 📱 Mobile-First Design

- **Responsive layout** for all screen sizes
- **Touch-friendly** interface
- **Bottom navigation** for mobile
- **Optimized** for mobile performance

## 🚀 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🐳 Docker Development

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f brewbook

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Access the app
# http://localhost:3000
```

## ☸️ Kubernetes Development

```bash
# Deploy to local cluster
kubectl apply -f k8s/

# Check status
kubectl get pods -l app=brewbook

# View logs
kubectl logs -l app=brewbook

# Access via port forward
kubectl port-forward service/brewbook 8080:80
```

## 📚 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Docker, Docker Compose, Kubernetes, Helm
- **State Management**: React Context API
- **Form Validation**: Zod
- **Icons**: Lucide React
- **Secrets**: Kubernetes Secrets, Environment Variables

## 🔒 Security Features

- **No hardcoded secrets** in any files
- **Environment-based configuration** for all deployments
- **Kubernetes secrets** for production deployments
- **Git-ignored sensitive files** (.env.local, secrets/)
- **Placeholder system** prevents accidental credential commits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Supabase](https://supabase.com/) for backend services
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Happy brewing! ☕✨**
