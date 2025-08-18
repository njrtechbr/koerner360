---
inclusion: always
---

# Product Context & Development Guidelines

## Koerner 360 Overview

Koerner 360 is a 360-degree feedback and performance evaluation system with role-based access control, gamification, and comprehensive audit logging.

## User Roles & Permissions Hierarchy

When implementing features, always respect this permission hierarchy:

1. **Admin** (highest): Full system access, user management, configuration
2. **Supervisor**: Manages attendants, reviews evaluations, team oversight
3. **Attendant**: Receives evaluations, views personal metrics, gamification participation
4. **Consultant** (limited): External users with evaluation-specific access

## Core Domain Models

- **Users**: Multi-role system with hierarchical relationships
- **Evaluations**: 360° feedback with ratings, comments, anonymous options
- **Gamification**: Points, achievements, rankings, performance metrics
- **Audit Logs**: Track all system actions for compliance

## Development Conventions

### Authentication & Authorization
- Always check user roles before granting access to features
- Use NextAuth.js session management consistently
- Implement proper middleware for route protection
- Validate permissions on both client and server sides

### Data Access Patterns
- Use Prisma ORM for all database operations
- Implement proper error handling for database queries
- Follow the established audit logging pattern for data changes
- Respect user hierarchy when filtering data access

### UI/UX Guidelines
- Maintain consistent role-based navigation
- Use shadcn/ui components for consistency
- Implement proper loading states and error boundaries
- Follow accessibility standards for all user interactions

### API Design
- Structure API routes by domain (users, evaluations, gamification)
- Use proper HTTP status codes and error responses
- Implement request validation with Zod schemas
- Follow RESTful conventions where applicable

## Business Rules

- Supervisors can only manage their assigned attendants
- Evaluations must maintain anonymity when specified
- Gamification points should be calculated consistently
- All significant actions must be audit logged
- User role changes require admin privileges

## Migration Context

The system migrated from Supabase, so:
- Maintain compatibility with existing data structures
- Use migration scripts in `/scripts` for data transformations
- Preserve audit trail continuity during updates