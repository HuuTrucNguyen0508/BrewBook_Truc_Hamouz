# Development Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Initial Setup
1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd brewbook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your actual credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Development Workflow

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes
3. Test locally
4. Commit with descriptive message
5. Push and create PR

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Use Tailwind CSS for styling
- Prefer shadcn/ui components over custom ones

### Database Changes
1. Create migration in `supabase/migrations/`
2. Update types in `types/index.ts`
3. Test with local development

## 🧪 Testing

### Manual Testing
- Test all user flows
- Verify mobile responsiveness
- Check error handling
- Test with and without data

### Automated Testing (Future)
- Unit tests with Jest
- E2E tests with Playwright
- Component tests with React Testing Library

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t brewbook .
docker run -p 3000:3000 brewbook
```

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
- Check import paths are correct
- Verify all components are properly exported
- Run `npm run build` to see detailed errors

**Supabase connection fails**
- Verify environment variables are set
- Check Supabase project is active
- Ensure database schema is created

**AI features not working**
- Verify OpenAI API key is set
- Check API rate limits
- Review console for error messages

**Styling issues**
- Verify Tailwind CSS is working
- Check component imports
- Ensure CSS variables are defined

### Getting Help
1. Check the console for error messages
2. Review the README for setup instructions
3. Check Supabase dashboard for database issues
4. Verify all environment variables are set

## 📱 Mobile Development

### Testing on Mobile
- Use browser dev tools mobile view
- Test on actual devices when possible
- Verify touch interactions work properly
- Check responsive breakpoints

### Mobile-First Design
- Start with mobile layout
- Use `max-w-md` container for app-like feel
- Bottom navigation for easy thumb access
- Touch-friendly button sizes

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env.local` to git
- Use different keys for dev/staging/prod
- Rotate API keys regularly

### Database Security
- Row Level Security is enabled
- User authentication required for writes
- Validate all inputs with Zod schemas

### API Security
- Rate limiting (to be implemented)
- Input validation on all endpoints
- Error messages don't expose internals

## 📊 Performance

### Optimization Tips
- Use Next.js Image component for images
- Implement proper caching strategies
- Lazy load non-critical components
- Optimize database queries

### Monitoring
- Check browser dev tools performance tab
- Monitor API response times
- Watch for memory leaks in development

---

Happy coding! ☕✨
