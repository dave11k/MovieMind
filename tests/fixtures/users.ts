export const mockUser = {
  id: 'test-user-123',
  email: 'test@moviemind.com',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
}

export const mockSession = {
  access_token: 'mock_access_token_12345',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  refresh_token: 'mock_refresh_token_67890',
  user: mockUser,
}

export const mockAuthResponse = {
  data: {
    user: mockUser,
    session: mockSession,
  },
  error: null,
}

export const mockSignUpUser = {
  id: 'new-user-456',
  email: 'newuser@moviemind.com',
  email_confirmed_at: null,
  created_at: '2024-01-15T00:00:00.000Z',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
}

export const mockSupabaseFavorite = {
  id: 'fav-uuid-123',
  user_id: 'test-user-123',
  movie_id: 123,
  movie_title: 'Awesome Action Movie',
  movie_poster: '/awesome-action-movie.jpg',
  movie_year: 2024,
  movie_genres: ['Action', 'Adventure', 'Science Fiction'],
  vote_average: 8.2,
  created_at: '2024-01-01T00:00:00.000Z',
}

export const mockSupabaseRecommendation = {
  id: 'rec-uuid-456',
  user_id: 'test-user-123',
  movie_id: 999,
  movie_title: 'AI Recommended Movie',
  movie_poster: '/ai-recommended.jpg',
  movie_year: 2024,
  reason: 'This movie is recommended because it combines the emotional depth you enjoy in dramas with the futuristic elements from your favorite sci-fi films.',
  confidence_score: 0.95,
  created_at: '2024-01-02T00:00:00.000Z',
}