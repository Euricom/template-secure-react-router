# Architecture Overview

## Project Structure

The project follows a modern React application architecture with a focus on security and scalability. Here's an overview of the main directories and their purposes:

### Core Directories

- `/app` - Main application code

  - `/components` - Reusable UI components
  - `/features` - Feature-specific components and logic
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions and shared code
  - `entry.client.tsx` - Client-side entry point
  - `entry.server.tsx` - Server-side entry point
  - `root.tsx` - Root application component
  - `routes.ts` - Application routing configuration

- `/prisma` - Database schema and migrations

  - `schema.prisma` - Database schema definition
  - `/migrations` - Database migration files

- `/public` - Static assets

### Key Architectural Components

1. **Authentication & Authorization**

   - Implements secure authentication using sessions, see [Authentication](./authentication.md)
   - Role-based access control, see [Authorization](./authorization.md)
   - Organization-based permissions, see [Organizations](./organizations.md)
   - Session management with security features, see [Authentication](./authentication.md)

2. **Routing System**

   - Secure route implementation, see [Secure Routes](./secureroutes.md)
   - Protected routes with authentication checks, see [Secure Routes](./secureroutes.md)

3. **Security Features**

   - Security headers implementation, see [Security Headers](./security-headers.md)
   - CSRF protection
   - Session security, see [Authentication](./authentication.md)
   - Rate limiting
   - Input validation

4. **Database Layer**
   - PostgreSQL database
   - Prisma ORM
   - Migration management
   - Data models for users, organizations, and sessions
