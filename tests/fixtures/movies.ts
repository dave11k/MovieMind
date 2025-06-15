import { Movie } from '@/types/Movie'

export const mockMovie1: Movie = {
  id: 123,
  title: 'Awesome Action Movie',
  overview: 'An incredible action-packed adventure with stunning visuals and great storytelling.',
  poster_path: '/awesome-action-movie.jpg',
  backdrop_path: '/awesome-action-backdrop.jpg',
  release_date: '2024-07-15',
  vote_average: 8.2,
  genre_ids: [28, 12, 878],
  genres: ['Action', 'Adventure', 'Science Fiction'],
  imdb_id: 'tt1234567',
}

export const mockMovie2: Movie = {
  id: 456,
  title: 'Romantic Comedy Delight',
  overview: 'A heartwarming romantic comedy that will make you laugh and cry.',
  poster_path: '/romantic-comedy.jpg',
  backdrop_path: '/romantic-comedy-backdrop.jpg',
  release_date: '2024-09-20',
  vote_average: 7.8,
  genre_ids: [35, 10749],
  genres: ['Comedy', 'Romance'],
  imdb_id: 'tt7654321',
}

export const mockMovie3: Movie = {
  id: 789,
  title: 'Thrilling Mystery',
  overview: 'A mind-bending mystery that keeps you guessing until the very end.',
  poster_path: '/thrilling-mystery.jpg',
  backdrop_path: '/thrilling-mystery-backdrop.jpg',
  release_date: '2024-11-05',
  vote_average: 9.1,
  genre_ids: [9648, 53],
  genres: ['Mystery', 'Thriller'],
  imdb_id: 'tt9876543',
}

export const mockMovieWithRecommendation: Movie = {
  id: 999,
  title: 'AI Recommended Movie',
  overview: 'A movie recommended by our AI system based on your preferences.',
  poster_path: '/ai-recommended.jpg',
  backdrop_path: '/ai-recommended-backdrop.jpg',
  release_date: '2024-12-25',
  vote_average: 8.7,
  genre_ids: [18, 878],
  genres: ['Drama', 'Science Fiction'],
  explanation: 'This movie is recommended because it combines the emotional depth you enjoy in dramas with the futuristic elements from your favorite sci-fi films.',
  imdb_id: 'tt5555555',
}

export const mockMovieWithoutPoster: Movie = {
  id: 111,
  title: 'Movie Without Poster',
  overview: 'A movie that doesn\'t have a poster image.',
  poster_path: null,
  backdrop_path: null,
  release_date: '2024-01-01',
  vote_average: 6.5,
  genre_ids: [18],
  genres: ['Drama'],
}

export const mockMovieWithZeroRating: Movie = {
  id: 222,
  title: 'Unrated Movie',
  overview: 'A movie that hasn\'t received any ratings yet.',
  poster_path: '/unrated-movie.jpg',
  backdrop_path: '/unrated-backdrop.jpg',
  release_date: '2025-01-01',
  vote_average: 0,
  genre_ids: [99],
  genres: ['Documentary'],
}

export const mockMovieList: Movie[] = [
  mockMovie1,
  mockMovie2,
  mockMovie3,
]

export const mockSearchResults: Movie[] = [
  mockMovie1,
  mockMovie2,
]

export const mockRecommendations: Movie[] = [
  mockMovieWithRecommendation,
  {
    ...mockMovie1,
    explanation: 'Recommended because you enjoy high-octane action sequences and adventure storylines.',
  },
]

export const mockFavorites: Movie[] = [
  mockMovie2,
  mockMovie3,
]

// TMDB API response format
export const mockTMDBSearchResponse = {
  page: 1,
  results: mockSearchResults,
  total_pages: 1,
  total_results: 2,
}

export const mockTMDBMovieDetails = {
  id: 123,
  title: 'Awesome Action Movie',
  overview: 'An incredible action-packed adventure with stunning visuals and great storytelling.',
  poster_path: '/awesome-action-movie.jpg',
  backdrop_path: '/awesome-action-backdrop.jpg',
  release_date: '2024-07-15',
  vote_average: 8.2,
  runtime: 142,
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
}

// OpenAI API response format
export const mockOpenAIResponse = {
  id: 'chatcmpl-test123',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-3.5-turbo',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant' as const,
        content: JSON.stringify({
          recommendations: [
            {
              movieId: 999,
              title: 'AI Recommended Movie',
              explanation: 'This movie is recommended because it combines the emotional depth you enjoy in dramas with the futuristic elements from your favorite sci-fi films.',
            },
            {
              movieId: 123,
              title: 'Awesome Action Movie',
              explanation: 'Recommended because you enjoy high-octane action sequences and adventure storylines.',
            },
          ],
        }),
      },
      finish_reason: 'stop' as const,
    },
  ],
  usage: {
    prompt_tokens: 150,
    completion_tokens: 75,
    total_tokens: 225,
  },
}