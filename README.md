# Node.js Application with esbuild

This project uses esbuild for fast and efficient bundling of Node.js applications.

## Build System

This project uses esbuild for bundling and optimization:

- **Fast builds**: esbuild is significantly faster than traditional TypeScript compilation
- **Bundle optimization**: Reduces the size of the final bundle
- **Production-ready**: Optimized for deployment

## Scripts

- `npm run build` - Build the project (standard build)
- `npm run build:prod` - Build the project with production packaging (removes dev dependencies)
- `npm run dev` - Run the project in development mode with hot reloading
- `npm start` - Run the built application

## Local Deployment

The project includes a zero-downtime deployment script for local testing:

```bash
# Deploy to development environment
./local-deploy.sh

# Deploy to production environment
./local-deploy.sh production
```

### Deployment Features

- Zero downtime deployments using PM2 cluster mode
- Automatic rollback on deployment failure
- Database migrations with Prisma
- Health checks to verify successful deployment
- Release management (keeping only recent releases)

## CI/CD Pipeline

The project includes a GitHub Actions workflow for CI/CD:

1. **Test**: Runs tests in a PostgreSQL environment
2. **Build**: Builds the application using esbuild
3. **Deploy**: Deploys to the appropriate environment based on the branch

## PM2 Configuration

PM2 is used for process management with:

- Cluster mode for zero downtime reloads
- Automatic restarts on failure
- Memory limits to prevent resource issues
- Proper logging configuration

## Environment Configuration

Different environments (development, production) use separate configuration files:

- `ecosystem.development.config.js` - Development environment config
- `ecosystem.production.config.js` - Production environment config

## Database Management

Database operations are handled through Prisma:

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:deploy` - Deploy migrations in production
- `npm run prisma:studio` - Open Prisma Studio for database management
