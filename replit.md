# HealthWhisper AI

## Overview

HealthWhisper is an AI-powered health symptom analysis application that provides intelligent triage recommendations. The application allows users to describe their symptoms through a chat interface and receive AI-generated analysis including risk assessment, potential conditions, and recommended actions. Built with a modern full-stack architecture, it combines React frontend with Express backend and leverages Google Gemini for medical analysis.

The application now includes advanced features for comprehensive health management including symptom tracking, health insights dashboard, telehealth integration, and detailed analytics.

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
- **AI Service**: Google Gemini 2.5 Pro for symptom analysis and medical recommendations
- **Medical Analysis**: Custom prompt engineering for accurate health triage
- **Context Enhancement**: Historical health records with 5000 synthetic health records for AI context
- **Advanced Features**: Symptom tracking, health insights, telehealth integration

### Design Patterns and Architectural Decisions

**Monorepo Structure**: Shared schema and types between client and server in `/shared` directory ensures type consistency across the full stack.

**Component-Driven Development**: Extensive use of shadcn/ui components provides consistent UI patterns and accessibility compliance.

**Progressive Enhancement**: Chat interface with real-time updates and optimistic UI patterns for responsive user experience.

**Medical Safety**: Conservative risk assessment with clear disclaimers and emphasis on professional medical consultation.

**Scalable Data Layer**: Drizzle ORM with PostgreSQL provides ACID compliance and horizontal scaling capabilities for production use.

## Recent Changes (January 2024)

**Later Stage Features Implementation**:
- **Advanced Dashboard**: Comprehensive health management dashboard with tabbed interface
- **Symptom Tracker**: Detailed symptom logging with severity tracking, pain levels, triggers, and pattern analysis
- **Health Insights**: AI-powered pattern recognition with personal insights, trend analysis, and regional health data
- **Telehealth Integration**: Provider search, appointment booking, video consultation scheduling, and health report management
- **Analytics & Reports**: Health trend visualization, exportable reports, and automated health summaries

**Technical Enhancements**:
- Switched from OpenAI to Google Gemini 2.5 Pro for AI analysis
- Integrated 5000 synthetic health records for enhanced AI context
- Added comprehensive data visualization components
- Implemented advanced form handling for complex health data entry
- Enhanced navigation with multi-tab dashboard interface

## External Dependencies

### Core Services
- **Google Gemini API**: Gemini 2.5 Pro model for medical symptom analysis and triage recommendations
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