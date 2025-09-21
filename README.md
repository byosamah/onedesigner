# OneDesigner

## AI-Powered Designer-Client Matching Platform

OneDesigner revolutionizes how clients discover and connect with pre-vetted designers through intelligent AI-powered matching. The platform analyzes project briefs and designer profiles to create perfect creative partnerships.

## 🚀 Features

### For Clients
- **Smart Matching**: AI analyzes your project brief to find the perfect designers
- **Progressive Matching**: Instant results that get better with time (3-phase matching)
- **Credit System**: Flexible pricing with packages to fit any budget
- **Working Requests**: Simplified one-click designer contact system
- **Quality Assurance**: All designers are pre-vetted and admin-approved

### For Designers
- **Application System**: Multi-step application with portfolio review
- **Dashboard**: Manage project requests and track opportunities
- **Profile Management**: Showcase your skills and experience
- **Approval Process**: Quality-focused admission ensures client satisfaction

### For Admins
- **Designer Management**: Approve applications and manage profiles
- **System Monitoring**: Health checks and performance metrics
- **Content Management**: Blog system for design tips and insights

## 🏗️ Architecture

### Centralized Services (8-Phase Architecture)
- **DataService**: Database operations with caching
- **ErrorManager**: Structured error handling and monitoring
- **RequestPipeline**: Middleware architecture with auth
- **ConfigManager**: Centralized configuration management
- **BusinessRules**: Business logic consolidation
- **LoggingService**: Structured logging with correlation IDs
- **OTPService**: Unified OTP management
- **EmailService**: Template-based email system

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API Routes with serverless architecture
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI**: DeepSeek for intelligent matching
- **Payments**: LemonSqueezy integration
- **Email**: Resend with professional templates
- **Deployment**: Vercel with edge optimization

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Environment variables (see `.env.example`)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/onedesigner.git
   cd onedesigner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase, DeepSeek, and other API keys
   ```

4. **Run database migrations**
   ```bash
   # Apply Supabase migrations in order (001-008)
   # Use 007_speed_optimization_tables_fixed.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Feature Flags
All centralized services are enabled by default in production:
```bash
USE_NEW_DATA_SERVICE=true
USE_ERROR_MANAGER=true
USE_REQUEST_PIPELINE=true
USE_CONFIG_MANAGER=true
USE_BUSINESS_RULES=true
USE_CENTRALIZED_LOGGING=true
USE_OTP_SERVICE=true
USE_EMAIL_SERVICE=true
```

## 📚 Documentation

- **Main Documentation**: `/CLAUDE.md` - Complete system overview
- **API Documentation**: `/src/app/api/CLAUDE.md` - API routes and patterns
- **Core Services**: `/src/lib/core/CLAUDE.md` - Centralized architecture
- **Components**: `/src/components/CLAUDE.md` - React component system
- **Database**: `/supabase/CLAUDE.md` - Schema and optimization
- **Configuration**: `/src/config/CLAUDE.md` - Settings management

## 🧪 Testing

```bash
# Run all test suites
./test/test-data-service.sh
./test/test-error-manager.sh
./test/test-pipeline.sh
# ... other test scripts

# Test specific flows
./test/test-ai-matching-flow.sh
./test/test-auth-security.sh
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Build and deploy
npm run build
vercel --prod

# If Vercel link is lost
vercel link --project onedesigner2 --yes
vercel --prod
```

### Environment Configuration
- **Production**: All phases active with real API keys
- **Staging**: Mirror production with test data
- **Development**: Local environment with hot reload

## 🔧 API Endpoints

### Core Routes
- `/api/match/find` - AI-powered designer matching
- `/api/client/briefs` - Project brief management
- `/api/designer/apply` - Designer applications
- `/api/admin/designers` - Designer approval workflow

### Authentication
- `/api/auth/client/*` - Client authentication
- `/api/auth/designer/*` - Designer authentication
- `/api/auth/admin/*` - Admin authentication

### System
- `/api/health` - System health and feature status
- `/api/config` - Configuration management
- `/api/cron/embeddings` - Background processing

## 💳 Credit System

### Packages
- **Starter**: $5 for 3 matches
- **Growth**: $15 for 10 matches
- **Scale**: $30 for 25 matches

### Payment Flow
1. Client selects package → LemonSqueezy checkout
2. Webhook processes payment → Credits added
3. Client unlocks designers → Credits deducted
4. Working requests initiated → Project collaboration

## 🔒 Security

- **Authentication**: Session-based with secure HTTP-only cookies
- **OTP Verification**: 6-digit codes with rate limiting
- **Rate Limiting**: API throttling per endpoint
- **Data Protection**: Sensitive data redaction and encryption
- **SQL Injection**: Prepared statements via Supabase client

## 📊 Performance

### Optimization Features
- **3-Phase Matching**: Progressive improvement from <50ms to 2s
- **Caching**: 5-minute TTL for database queries
- **Pre-computation**: Hourly embedding generation
- **Edge Deployment**: Vercel edge functions for low latency

### Monitoring
- **Health Checks**: All services report status
- **Correlation IDs**: Request tracking across services
- **Performance Metrics**: Response times and cache hit rates
- **Error Classification**: Structured error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the centralized architecture patterns
4. Add tests for new functionality
5. Update relevant CLAUDE.md documentation
6. Submit a pull request

## 📝 License

[License information]

## 📞 Support

- **Documentation**: Check component-specific CLAUDE.md files
- **Issues**: GitHub Issues for bug reports
- **Contact**: [Contact information]

---

**Built with ❤️ by the OneDesigner Team**

*Last Updated: September 21, 2025*