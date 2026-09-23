# SafePathAI - Women's Safety Application

## Overview

SafePathAI is a comprehensive women's safety application built with React/TypeScript frontend and Node.js/Express backend. The application provides AI-powered safety monitoring, emergency contact management, and real-time threat detection capabilities. It's designed to be a mobile-first web application with a focus on autonomous safety features that don't require manual intervention.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS styling
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with custom color scheme for safety themes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware integration

## Key Components

### Frontend Components
- **Mobile UI**: Responsive design optimized for mobile devices with bottom navigation
- **Safety Status Dashboard**: Real-time monitoring of location, audio, and motion sensors
- **Emergency Contacts**: Management system for trusted contacts
- **AI Status Monitor**: Display of AI monitoring capabilities and status
- **Permission Management**: Browser permission requests for location and microphone access
- **SOS System**: Emergency alert system with confirmation modal

### Backend Services
- **Emergency Contacts API**: CRUD operations for managing emergency contacts
- **Activity Logging**: System for tracking user activities and safety events
- **App Settings**: Configuration management for safety features
- **Storage Layer**: Abstracted storage interface with in-memory implementation

### Safety Features
- **Location Tracking**: GPS-based real-time location monitoring
- **Audio Monitoring**: Microphone access for distress signal detection
- **Motion Detection**: Device motion sensors for panic detection
- **Emergency SOS**: One-touch emergency alert system

## Data Flow

1. **User Interaction**: User interacts with mobile-optimized React frontend
2. **Sensor Data**: Browser APIs collect location, audio, and motion data
3. **State Management**: TanStack Query manages API communication and caching
4. **API Communication**: RESTful APIs handle data persistence and retrieval
5. **Database Operations**: Drizzle ORM manages PostgreSQL database interactions
6. **Real-time Updates**: Frontend polls for updates and displays real-time status

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Forms**: React Hook Form with Zod validation

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution

### Browser APIs
- **Geolocation API**: For location tracking
- **MediaDevices API**: For microphone access
- **DeviceMotionEvent API**: For motion detection

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot reload
- **Database**: Neon Database serverless PostgreSQL
- **Environment**: NODE_ENV=development with tsx execution

### Production
- **Build Process**: Vite builds frontend assets, esbuild bundles backend
- **Static Assets**: Frontend built to dist/public directory
- **Server**: Node.js server serving both API and static files
- **Database**: Production PostgreSQL via DATABASE_URL environment variable

### Build Commands
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server startup
- `npm run db:push`: Database schema deployment

## Changelog

Changelog:
- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.