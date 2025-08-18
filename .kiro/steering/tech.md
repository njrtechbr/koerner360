# Technology Stack & Build System

## Core Technologies

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript 5+ with strict configuration
- **Database**: PostgreSQL with Prisma ORM 6.14.0
- **Authentication**: NextAuth.js v5 (beta) with JWT strategy
- **Styling**: Tailwind CSS 3.4.17 with shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Runtime**: Node.js 18+

## Development Tools

- **Linting**: ESLint with Next.js and TypeScript rules
- **Formatting**: Prettier with consistent configuration
- **Testing**: Jest with React Testing Library
- **Package Manager**: npm with package-lock.json
- **Git Hooks**: Husky for pre-commit and post-commit hooks
- **Containerization**: Docker with docker-compose.yml

## Common Commands

### Development
```bash
npm run dev              # Start development server
npm run build           # Production build
npm run start           # Start production server
npm run type-check      # TypeScript type checking
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format with Prettier
npm run test            # Run Jest tests
npm run test:watch      # Run tests in watch mode
```

### Database Operations
```bash
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations
npm run db:reset        # Reset database
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio
```

### Versioning & Changelog
```bash
npm run version:patch   # Increment patch version
npm run version:minor   # Increment minor version
npm run version:major   # Increment major version
npm run changelog:create # Create changelog from commits
npm run release:patch   # Full patch release with tags
```

## Key Libraries & Patterns

- **UI Components**: Radix UI primitives with shadcn/ui styling
- **State Management**: React hooks and context (no external state library)
- **Data Fetching**: Native fetch with Next.js API routes
- **Password Hashing**: bcryptjs for secure authentication
- **Date Handling**: date-fns for date manipulation
- **Notifications**: Sonner for toast notifications
- **Theme**: next-themes for dark/light mode support

## Build Configuration

- **TypeScript**: Strict mode enabled with path mapping (@/* aliases)
- **Next.js**: App Router with server external packages configuration
- **Tailwind**: Custom design system with CSS variables
- **ESLint**: Comprehensive rules for TypeScript, React, and Next.js
- **Prettier**: Consistent formatting with single quotes and semicolons