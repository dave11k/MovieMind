import { http, HttpResponse } from 'msw'

// TMDB API Base URL
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// Mock movie data
const mockMovies = [
  {
    id: 123,
    title: 'Test Movie 1',
    overview: 'A great test movie with action and adventure',
    poster_path: '/test-poster-1.jpg',
    backdrop_path: '/test-backdrop-1.jpg',
    release_date: '2024-06-15',
    vote_average: 8.2,
    genre_ids: [28, 12, 878],
    adult: false,
    original_language: 'en',
    original_title: 'Test Movie 1',
    popularity: 1234.567,
    video: false,
    vote_count: 1500,
  },
  {
    id: 456,
    title: 'Test Movie 2',
    overview: 'Another fantastic test movie',
    poster_path: '/test-poster-2.jpg',
    backdrop_path: '/test-backdrop-2.jpg',
    release_date: '2024-08-20',
    vote_average: 7.8,
    genre_ids: [35, 10749],
    adult: false,
    original_language: 'en',
    original_title: 'Test Movie 2',
    popularity: 987.654,
    video: false,
    vote_count: 850,
  },
]

const mockMovieDetails = {
  123: {
    id: 123,
    title: 'Test Movie 1',
    overview: 'A great test movie with action and adventure',
    poster_path: '/test-poster-1.jpg',
    backdrop_path: '/test-backdrop-1.jpg',
    release_date: '2024-06-15',
    vote_average: 8.2,
    runtime: 120,
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 878, name: 'Science Fiction' },
    ],
    external_ids: {
      imdb_id: 'tt1234567',
      facebook_id: null,
      instagram_id: null,
      twitter_id: null,
    },
  },
  456: {
    id: 456,
    title: 'Test Movie 2',
    overview: 'Another fantastic test movie',
    poster_path: '/test-poster-2.jpg',
    backdrop_path: '/test-backdrop-2.jpg',
    release_date: '2024-08-20',
    vote_average: 7.8,
    runtime: 95,
    genres: [
      { id: 35, name: 'Comedy' },
      { id: 10749, name: 'Romance' },
    ],
    external_ids: {
      imdb_id: 'tt7654321',
      facebook_id: null,
      instagram_id: null,
      twitter_id: null,
    },
  },
}

export const handlers = [
  // TMDB Movie Search
  http.get(`${TMDB_BASE_URL}/search/movie`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('query')
    const page = url.searchParams.get('page') || '1'

    if (!query) {
      return HttpResponse.json({
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0,
      })
    }

    // Filter movies based on query
    const filteredMovies = mockMovies.filter(movie =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    )

    return HttpResponse.json({
      page: parseInt(page),
      results: filteredMovies,
      total_pages: 1,
      total_results: filteredMovies.length,
    })
  }),

  // TMDB Movie Details
  http.get(`${TMDB_BASE_URL}/movie/:id`, ({ params }) => {
    const movieId = params.id as string
    const movie = mockMovieDetails[movieId as unknown as keyof typeof mockMovieDetails]

    if (!movie) {
      return HttpResponse.json(
        { status_message: 'The resource you requested could not be found.' },
        { status: 404 }
      )
    }

    return HttpResponse.json(movie)
  }),

  // TMDB Discover Movies (Upcoming)
  http.get(`${TMDB_BASE_URL}/discover/movie`, () => {
    // Return upcoming movies
    return HttpResponse.json({
      page: 1,
      results: mockMovies,
      total_pages: 1,
      total_results: mockMovies.length,
    })
  }),

  // TMDB Genre List
  http.get(`${TMDB_BASE_URL}/genre/movie/list`, () => {
    return HttpResponse.json({
      genres: [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 16, name: 'Animation' },
        { id: 35, name: 'Comedy' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentary' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Family' },
        { id: 14, name: 'Fantasy' },
        { id: 36, name: 'History' },
        { id: 27, name: 'Horror' },
        { id: 10402, name: 'Music' },
        { id: 9648, name: 'Mystery' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Science Fiction' },
        { id: 10770, name: 'TV Movie' },
        { id: 53, name: 'Thriller' },
        { id: 10752, name: 'War' },
        { id: 37, name: 'Western' },
      ],
    })
  }),

  // OpenAI Chat Completions
  http.post('https://api.openai.com/v1/chat/completions', () => {
    const mockRecommendations = {
      recommendations: [
        {
          movieId: 123,
          title: 'Test Movie 1',
          explanation: 'This movie is recommended because it shares similar action and adventure themes with your favorites.',
        },
        {
          movieId: 456,
          title: 'Test Movie 2',
          explanation: 'Based on your preference for character-driven stories, this film offers great emotional depth.',
        },
      ],
    }

    return HttpResponse.json({
      id: 'chatcmpl-test123',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-3.5-turbo',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify(mockRecommendations),
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    })
  }),

  // Supabase Auth - Sign In
  http.post('https://test.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock_access_token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock_refresh_token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01T00:00:00.000Z',
        created_at: '2024-01-01T00:00:00.000Z',
      },
    })
  }),

  // Supabase Auth - Sign Up
  http.post('https://test.supabase.co/auth/v1/signup', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        email_confirmed_at: null,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    })
  }),

  // Supabase Auth - Get Session
  http.get('https://test.supabase.co/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      email_confirmed_at: '2024-01-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
    })
  }),

  // Supabase Database - Favorites
  http.get('https://test.supabase.co/rest/v1/favorites', () => {
    return HttpResponse.json([
      {
        id: 'fav-1',
        user_id: 'test-user-id',
        movie_id: 123,
        movie_title: 'Test Movie 1',
        movie_poster: '/test-poster-1.jpg',
        movie_year: 2024,
        movie_genres: ['Action', 'Adventure'],
        vote_average: 8.2,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ])
  }),

  // Supabase Database - Insert Favorite
  http.post('https://test.supabase.co/rest/v1/favorites', () => {
    return HttpResponse.json([
      {
        id: 'fav-new',
        user_id: 'test-user-id',
        movie_id: 456,
        movie_title: 'Test Movie 2',
        movie_poster: '/test-poster-2.jpg',
        movie_year: 2024,
        movie_genres: ['Comedy', 'Romance'],
        vote_average: 7.8,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ])
  }),

  // Supabase Database - Recommendations
  http.get('https://test.supabase.co/rest/v1/recommendations', () => {
    return HttpResponse.json([
      {
        id: 'rec-1',
        user_id: 'test-user-id',
        movie_id: 123,
        movie_title: 'Test Movie 1',
        movie_poster: '/test-poster-1.jpg',
        movie_year: 2024,
        reason: 'This movie is recommended because it shares similar action themes.',
        confidence_score: 0.9,
        created_at: '2024-01-01T00:00:00.000Z',
      },
    ])
  }),

  // Supabase Database - Insert Recommendations
  http.post('https://test.supabase.co/rest/v1/recommendations', () => {
    return HttpResponse.json([])
  }),

  // Fallback for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }),
]