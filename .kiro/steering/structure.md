# Project Structure & Organization

## Root Directory Structure

```
koerner360/
├── src/                    # Main application source code
├── prisma/                 # Database schema and migrations
├── scripts/                # Utility and maintenance scripts
├── docs/                   # Project documentation
├── __tests__/              # Test files organized by type
├── components/             # Legacy components (being migrated to src/)
├── public/                 # Static assets
├── .kiro/                  # Kiro AI assistant configuration
├── .github/                # GitHub workflows and templates
└── .husky/                 # Git hooks configuration
```

## Source Code Organization (`src/`)

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API route handlers
│   ├── dashboard/         # Main dashboard pages
│   ├── login/            # Authentication pages
│   └── layout.tsx        # Root layout component
├── components/           # Reusable React components
│   ├── layout/          # Layout-specific components
│   ├── providers/       # Context providers (Session, Theme)
│   └── ui/             # shadcn/ui components
├── lib/                # Utility libraries and configurations
│   ├── auth.ts         # NextAuth configuration
│   ├── prisma.ts       # Prisma client setup
│   └── utils.ts        # General utilities
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## Database Structure (`prisma/`)

- **schema.prisma**: Complete database schema with all models
- **migrations/**: Database migration files
- **seed.ts**: Database seeding script

## Scripts Directory

Organized by functionality:
- **Database**: Migration, seeding, and verification scripts
- **Build**: Version management and build information
- **Changelog**: Automated changelog generation and management
- **Testing**: Database connection and API testing utilities

## Testing Structure (`__tests__/`)

```
__tests__/
├── api/                   # API route tests
├── components/            # Component unit tests
└── lib/                   # Utility function tests
```

## Path Aliases

The project uses TypeScript path mapping for clean imports:

- `@/*` → `./src/*` or `./*` (root level files)
- `@/components/*` → `./src/components/*`
- `@/lib/*` → `./src/lib/*`
- `@/app/*` → `./src/app/*`
- `@/types/*` → `./src/types/*`
- `@/hooks/*` → `./src/hooks/*`

## File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: kebab-case for directories, lowercase for files
- **API Routes**: kebab-case (e.g., `user-management/route.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase with `.d.ts` extension for declarations

## Component Organization

- **UI Components**: Located in `src/components/ui/` (shadcn/ui)
- **Layout Components**: Located in `src/components/layout/`
- **Feature Components**: Organized by domain in `src/components/`
- **Page Components**: Co-located with pages in `src/app/`

## Configuration Files

- **TypeScript**: `tsconfig.json` with strict settings
- **ESLint**: `.eslintrc.json` with comprehensive rules
- **Prettier**: `.prettierrc` for consistent formatting
- **Tailwind**: `tailwind.config.js` with custom design system
- **Next.js**: `next.config.ts` with optimizations

## Environment & Deployment

- **Environment Variables**: `.env.local` for development
- **Docker**: `docker-compose.yml` for containerized deployment
- **Build Info**: Automated build information generation