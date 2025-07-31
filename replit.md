# Archive Management System for Moroccan Court of Appeal

## Overview

This is a comprehensive archive management system designed specifically for a Moroccan Court of Appeal. The application provides a modern, scalable solution for managing court document archives with support for Arabic language (RTL layout) and court-specific workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Language Support**: Arabic (RTL) with Noto Sans Arabic font
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Validation**: Zod schemas shared between client and server
- **Session Management**: Basic authentication with localStorage (production would use JWT)
- **Development**: Hot reloading with Vite middleware integration

### Monorepo Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and Zod schemas
- `migrations/` - Database migration files

## Key Components

### Authentication System
- Role-based access control (admin, archivist, viewer)
- Simple username/password authentication
- Session management with localStorage
- Route protection based on user roles

### Document Management
- Hierarchical organization: Blocks → Rows → Sections → Documents
- Document categories (legal, financial, administrative, civil, criminal, commercial, family)
- Document status tracking (active, archived, pending)
- File attachment support with metadata
- Search and filtering capabilities

### User Interface
- Modern Arabic-first design with RTL support
- Responsive layout with mobile support
- Dashboard with statistics and recent activity
- Document upload modal with form validation
- Comprehensive document listing and editing

### Database Schema
- **Users**: Authentication and role management
- **Blocks**: Top-level organization (A, B, C...)
- **Rows**: Second-level organization (A.1, A.2, A.3)  
- **Sections**: Third-level organization (A.1.1, A.1.2...)
- **Documents**: Document metadata and references
- **Papers**: File attachments for documents

## Data Flow

### Authentication Flow
1. User submits login credentials
2. Server validates against user database
3. User object stored in localStorage
4. Protected routes check authentication status
5. Role-based permissions control feature access

### Document Management Flow
1. Documents organized in hierarchical structure
2. Upload process creates document record with metadata
3. File attachments stored as separate paper records
4. Search/filter operations query across document fields
5. Real-time updates through React Query cache invalidation

### API Communication
- RESTful API with consistent error handling
- Request/response logging middleware
- Shared TypeScript types ensure type safety
- Zod validation on both client and server

## External Dependencies

### Core Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL adapter
- Neon Database for serverless PostgreSQL
- Zod for schema validation
- Tailwind CSS for styling

### UI Components
- Radix UI primitives for accessible components
- shadcn/ui component library
- Lucide React for icons
- date-fns for date formatting with Arabic locale

### Development Tools
- Vite for build tooling and dev server
- TypeScript for type safety
- ESBuild for production builds
- Replit-specific plugins for development environment

## Deployment Strategy

### Development
- Monorepo structure with shared dependencies
- Vite dev server with Express API integration
- Hot module replacement for frontend
- Database migrations managed through Drizzle Kit

### Production Build
- Frontend built to `dist/public` directory
- Backend bundled with ESBuild to `dist/index.js`
- Static file serving from Express in production
- Environment-based configuration for database connection

### Database Management
- PostgreSQL with Drizzle ORM
- Migration system for schema updates
- Connection pooling through Neon serverless adapter
- Environment variable configuration for database URL

The system is designed to be scalable and maintainable, with clear separation of concerns between frontend and backend while sharing common types and validation schemas. The Arabic-first design and court-specific workflows make it well-suited for Moroccan judicial institutions.