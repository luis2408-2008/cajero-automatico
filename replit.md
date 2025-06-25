# Banking Application

## Overview

This is a modern banking application built with React/TypeScript on the frontend and Express.js on the backend. The application provides secure banking operations including account management, transactions (deposits, withdrawals, transfers), mobile recharges, streaming service subscriptions, and a gamification component with a fortune wheel. The app uses session-based authentication with PIN-based login and implements security features like account lockout after failed attempts.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Express sessions with secure PIN-based login
- **Password Security**: bcrypt for PIN hashing
- **Development**: tsx for TypeScript execution

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless driver
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: connect-pg-simple for PostgreSQL session store

## Key Components

### Authentication System
- PIN-based authentication (4-digit numeric)
- Session management with secure cookies
- Account lockout after multiple failed attempts
- Protected routes with middleware authentication
- User registration with PIN confirmation

### Banking Operations
- **Account Management**: Balance tracking, user profiles
- **Deposits**: Add funds to account balance
- **Withdrawals**: Remove funds with balance validation
- **Transfers**: P2P transfers between user accounts
- **Transaction History**: Complete audit trail of all operations

### Service Integration
- **Mobile Recharges**: Top-up services for major operators (Movistar, Claro, Tigo)
- **Streaming Services**: Subscription management for Netflix, Spotify, Disney+, Prime Video
- **Fortune Wheel**: Gamification feature for user engagement

### Security Features
- PIN hashing with bcrypt
- Rate limiting on login attempts
- Account lockout mechanism
- Session-based authentication
- Input validation with Zod schemas
- Protected API endpoints

## Data Flow

1. **Authentication Flow**:
   - User enters credentials → PIN validation → Session creation → Protected access
   - Failed attempts tracked → Account lockout after threshold

2. **Transaction Flow**:
   - User initiates transaction → Form validation → Balance check → Database update → Response

3. **Service Purchase Flow**:
   - Service selection → Balance validation → Transaction creation → Service activation

4. **Real-time Updates**:
   - TanStack Query handles cache invalidation and refetching
   - Optimistic updates for better UX

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- TanStack Query for data fetching
- Wouter for routing
- TypeScript for type safety

### UI and Styling
- Radix UI component primitives
- Tailwind CSS for styling
- Lucide React for icons
- shadcn/ui component library

### Backend Dependencies
- Express.js with TypeScript
- Drizzle ORM with PostgreSQL
- bcrypt for password hashing
- express-session for authentication
- Zod for schema validation

### Database and Storage
- PostgreSQL as primary database
- Neon Database for serverless hosting
- connect-pg-simple for session storage

## Deployment Strategy

### Development Environment
- Vite dev server with HMR
- tsx for TypeScript execution
- PostgreSQL development database
- Session-based development workflow

### Production Build
- Vite build for optimized frontend bundle
- esbuild for backend compilation
- Static file serving through Express
- Environment-based configuration

### Replit Configuration
- Node.js 20 runtime environment
- PostgreSQL 16 database module
- Autoscale deployment target
- Port 5000 for application access

### Build Process
1. Frontend: Vite builds React app to `dist/public`
2. Backend: esbuild compiles TypeScript server to `dist`
3. Production: Single Express server serves both API and static files

## Database Schema

### Users Table
- User credentials and profile information
- Balance tracking with decimal precision
- Security features (login attempts, account locking)
- Timestamps for audit trails

### Transactions Table
- Complete transaction history
- Support for multiple transaction types
- Recipient tracking for transfers
- Metadata storage for additional context
- Foreign key relationships with users

## Changelog

- June 25, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.