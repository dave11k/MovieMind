# MovieMind

A modern, AI-powered movie recommendation platform built with Next.js 15, combining The Movie Database API with OpenAI to deliver personalized movie suggestions based on user preferences.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-412991?style=flat-square&logo=openai)

## 🎯 Project Overview

MovieMind is an intelligent movie recommendation platform that analyzes users' favorite films against upcoming releases to provide personalized movie suggestions. Built as a full-stack application showcasing modern web development practices, it integrates multiple APIs and leverages AI to create a sophisticated recommendation engine.

### Key Features

- **AI-Powered Recommendations**: Personalized movie suggestions using OpenAI's GPT models
- **TMDB Integration**: Real-time movie data from The Movie Database
- **User Authentication**: Secure authentication with Supabase
- **Favorites Management**: Build and sync your movie preferences across devices
- **Smart Search**: Debounced search functionality with instant results
- **Responsive Design**: Modern UI with skeleton loading states and smooth animations

## 🏗 Architecture & Technical Decisions

### Frontend Architecture

- **Framework**: Next.js 15 with App Router for optimal performance and SEO
- **Language**: TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS with shadcn/ui component system for consistent design
- **State Management**: React Context pattern with strategic client components
- **Form Handling**: Custom form components with validation

### Backend & Database

- **Database**: Supabase (PostgreSQL) for user data and favorites storage
- **Authentication**: Supabase Auth with automatic profile creation
- **API Integration**: TMDB API for movie data, OpenAI API for recommendations
- **Data Persistence**: Dual support for localStorage (anonymous) and database (authenticated)

### Key Technical Decisions & Rationale

#### 1. Dual Structure Architecture

**Decision**: Hybrid app/ and src/ directory structure
**Rationale**:
- App Router for modern Next.js routing and API routes
- Maintains shared components and utilities in src/ for better organization
- Easier migration path from legacy structure while adopting new patterns

#### 2. AI Recommendation Strategy

**Decision**: OpenAI integration with TMDB upcoming movies filter
**Rationale**:
- Focuses recommendations on actually upcoming films (next 2 years)
- Leverages AI for sophisticated preference analysis
- Provides detailed explanations for each recommendation
- Balances discovery with user taste profiles

#### 3. Authentication Flow Design

**Decision**: Flexible authentication with anonymous support
**Rationale**:
- Allows immediate user engagement without signup barrier
- Seamless transition from anonymous to authenticated state
- Data persistence across both modes

## 🔧 Development Challenges & Solutions

### Challenge 1: AI-Powered Recommendation Algorithm

**Problem**: Creating meaningful recommendations that balance user preferences with upcoming movie availability
**Solution**:
- Implemented a sophisticated prompt engineering approach
- Combined user favorites analysis with TMDB upcoming releases
- Added reasoning explanations for each recommendation
- Limited scope to next 2 years for relevance

### Challenge 2: Performance Optimization

**Problem**: Multiple API calls affecting user experience
**Solution**:
- Implemented debounced search to reduce API calls
- Added comprehensive skeleton loading states
- Used React Suspense for progressive loading
- Cached TMDB responses strategically

### Challenge 3: Seamless Authentication Experience

**Problem**: Supporting both anonymous and authenticated users without friction
**Solution**:
- localStorage persistence for anonymous users
- Automatic data migration on authentication
- Context-based state management for auth flow

```typescript
// AI Recommendation Flow
const getRecommendations = async (favorites: Movie[]) => {
  const upcomingMovies = await tmdbService.getUpcomingMovies();
  const recommendations = await openai.generateRecommendations({
    favorites,
    upcomingMovies,
    limit: 8
  });
  return recommendations;
};
```

## 🧪 Testing Strategy

### Unit Testing

- **Framework**: Jest + React Testing Library
- **Coverage**: Components, services, and utility functions
- **Focus**: User interactions and API integrations

### Integration Testing

- **Framework**: Custom integration tests
- **Coverage**: Recommendation service, TMDB integration
- **Focus**: End-to-end data flow validation

### Quality Assurance

- **ESLint**: Custom configuration for Next.js and TypeScript
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode for maximum type safety

## 📊 Features Implemented

### Core Functionality

- ✅ **Movie Search**: Real-time search with TMDB integration
- ✅ **Favorites Management**: Add/remove movies with persistence
- ✅ **AI Recommendations**: Personalized suggestions with explanations
- ✅ **User Authentication**: Secure login/signup with Supabase
- ✅ **Responsive Design**: Mobile-first approach with modern UI
- ✅ **Loading States**: Skeleton components for smooth UX
- ✅ **Data Synchronization**: Seamless sync between local and cloud storage
- ✅ **Movie Details**: Rich movie information display
- ✅ **Error Handling**: Comprehensive error states and fallbacks

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- TMDB API account
- Supabase account
- OpenAI API account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/moviemind.git
   cd moviemind
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.local.example .env.local
   # Add your API keys and credentials
   ```

4. **Environment Variables**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run unit tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run check        # Run all quality checks (format, lint, typecheck)
```

## 🔧 Configuration

### Database Schema

The application uses Supabase with the following main tables:

- **favorites**: User's favorite movies with TMDB metadata
- **recommendations**: AI-generated recommendations with reasoning
- **profiles**: User profile information extending Supabase auth

### API Services

- **TMDB Service**: Singleton class handling movie data (`src/lib/tmdb.ts`)
- **Supabase Client**: Database operations and authentication (`src/lib/supabase.ts`)
- **OpenAI Integration**: Recommendation generation (`app/api/recommendations/route.ts`)

## 🛠 Built With

### Core Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type-safe JavaScript
- **Supabase** - Database and authentication
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library

### External APIs

- **The Movie Database (TMDB)** - Movie data and metadata
- **OpenAI** - AI-powered recommendation generation
- **Supabase Auth** - User authentication and management

### Development Tools

- **Jest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

### UI/UX Libraries

- **Radix UI** - Headless component primitives
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management
- **clsx** - Conditional class name utility

## 🎨 Design System

MovieMind follows a consistent design system built on:

- **Color Palette**: Carefully chosen colors with dark mode support
- **Typography**: Clear hierarchy with readable fonts
- **Components**: Reusable UI components following shadcn/ui patterns
- **Spacing**: Consistent spacing system using Tailwind utilities
- **Animations**: Subtle animations for enhanced user experience

## 🚀 Deployment

The application is optimized for deployment on platforms like Vercel, Netlify, or any Node.js hosting service:

1. Build the application: `npm run build`
2. Set environment variables in your hosting platform
3. Deploy the generated `.next` folder

## 📈 Future Enhancements

- **Advanced Filtering**: Genre, year, rating filters for recommendations
- **Social Features**: Share favorites and recommendations with friends
- **Watchlist**: Track movies to watch later
- **Rating System**: Rate watched movies to improve recommendations
- **Export Options**: Export favorites and recommendations to various formats