# HealthWhisper AI

## Overview

HealthWhisper is an AI-powered health symptom analysis application that provides intelligent triage recommendations. The application allows users to describe their symptoms through a chat interface and receive AI-generated analysis including risk assessment, potential conditions, and recommended actions. Built with a modern full-stack architecture, it combines React frontend with Express backend and leverages OpenAI for medical analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful endpoints for symptom analysis and chat functionality
- **Error Handling**: Centralized error middleware with structured error responses
- **Request Logging**: Custom middleware for API request/response logging

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for scalable cloud hosting
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **In-Memory Storage**: Fallback memory storage implementation for development/testing
- **Synthetic Data**: Pre-loaded health records dataset for AI context and training

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store
- **Security**: CORS configuration and input validation with Zod schemas
- **Data Validation**: Comprehensive input sanitization for all API endpoints

### External Service Integrations
- **AI Service**: OpenAI GPT-4o for symptom analysis and medical recommendations
- **Medical Analysis**: Custom prompt engineering for accurate health triage
- **Context Enhancement**: Historical health records for improved AI recommendations

### Design Patterns and Architectural Decisions

**Monorepo Structure**: Shared schema and types between client and server in `/shared` directory ensures type consistency across the full stack.

**Component-Driven Development**: Extensive use of shadcn/ui components provides consistent UI patterns and accessibility compliance.

**Progressive Enhancement**: Chat interface with real-time updates and optimistic UI patterns for responsive user experience.

**Medical Safety**: Conservative risk assessment with clear disclaimers and emphasis on professional medical consultation.

**Scalable Data Layer**: Drizzle ORM with PostgreSQL provides ACID compliance and horizontal scaling capabilities for production use.

## External Dependencies

### Core Services
- **OpenAI API**: GPT-4o model for medical symptom analysis and triage recommendations
- **Neon Database**: Serverless PostgreSQL for persistent data storage and session management

### Development Tools
- **shadcn/ui**: Pre-built accessible React components with TailwindCSS
- **Drizzle Kit**: Database schema management and migration tool
- **TanStack Query**: Server state management with caching and synchronization

### UI and Styling
- **Radix UI**: Unstyled, accessible UI primitives for custom component development
- **TailwindCSS**: Utility-first CSS framework with design system integration
- **Lucide React**: Consistent icon library for visual elements

### Build and Development
- **Vite**: Modern build tool with HMR and optimized bundling
- **TypeScript**: Static type checking across the entire application stack
- **ESBuild**: Fast JavaScript bundler for production server builds