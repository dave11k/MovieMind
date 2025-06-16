## Getting Started

1. Run `npm install`
2. Run `npm run dev`


## About

MovieMind is a Next.js web application that provides AI-powered movie
recommendations by analyzing users' favorite films against upcoming releases. The
app integrates with The Movie Database (TMDB) API for movie data and uses OpenAI's
GPT-3.5-turbo to generate personalized recommendations based on user preferences.
Users can search for movies, build a favorites list, and receive intelligent
suggestions for upcoming films (within the next two years) with detailed
explanations for each recommendation. The application supports both anonymous users
(with localStorage persistence) and authenticated users through Supabase
authentication, automatically syncing favorites and recommendations to the cloud.
Built with modern technologies including React, TypeScript, Tailwind CSS, and
shadcn/ui components, it features a responsive design with skeleton loading states,
debounced search functionality, and a sophisticated recommendation algorithm that
considers genre preferences, movie themes, and user taste patterns to deliver
diverse, personalized movie suggestions.