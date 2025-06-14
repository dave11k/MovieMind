# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

MovieMind is a Next.js application that provides AI-powered movie recommendations using OpenAI and TMDB API.

### Key Architecture Components

**Dual Structure**: The project has both `app/` (Next.js App Router) and `src/` (legacy structure) directories. The App Router is used for pages and API routes, while shared components and utilities remain in `src/`.

**Authentication Flow**: Uses Supabase for authentication with React Context pattern:
- `src/contexts/AuthContext.tsx` - Main auth state management
- `src/components/ClientAuthProvider.tsx` - Client-side auth wrapper
- Auth guards: `withAuth.tsx` and `withGuest.tsx` for protected routes

**External Service Integration**:
- **TMDB API**: `src/lib/tmdb.ts` - Singleton service class for The Movie Database API
- **Supabase**: `src/lib/supabase.ts` - Database client for user data and favorites
- **OpenAI**: Used in `/app/api/recommendations/route.ts` for AI-powered recommendations

**Database Schema** (Supabase):
- `favorites` table: User's favorite movies with TMDB metadata
- `recommendations` table: AI-generated recommendations with reasoning

### Key Files and Patterns

**API Routes**: Located in `app/api/` using Next.js 13+ App Router
- `app/api/recommendations/route.ts` - Main recommendation engine combining TMDB upcoming movies with user favorites via OpenAI

**Components Structure**:
- `src/components/auth/` - Authentication-related components
- `src/components/ui/` - Reusable UI components (shadcn/ui pattern)
- Main components: MovieList, RecommendationsList, FavoritesList, SearchBar

**Type Safety**: 
- `src/types/database.ts` - Supabase-generated database types
- `src/types/Movie.ts` - Core movie data structures

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_TMDB_API_KEY` - TMDB API access token
- `OPENAI_API_KEY` - OpenAI API key for recommendations

### Styling and UI

Uses Tailwind CSS with shadcn/ui components. Component styling follows the shadcn/ui patterns with `class-variance-authority` for component variants.

### Recommendation Algorithm

The core recommendation flow:
1. User provides favorite movies
2. System fetches upcoming movies from TMDB (next 2 years)
3. OpenAI analyzes favorites against upcoming releases
4. Returns 8 personalized recommendations with explanations
5. Results are enriched with full TMDB movie details