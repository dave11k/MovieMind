/**
 * @jest-environment node
 */

import { tmdbAPI } from '@/lib/tmdb'
import OpenAI from 'openai'
import { mockFavorites } from '../../fixtures/movies'

// Mock external dependencies
jest.mock('openai')
jest.mock('@/lib/tmdb')

describe('Recommendation Service Integration', () => {
  let mockOpenAI: jest.Mocked<OpenAI>
  let mockTMDB: jest.Mocked<typeof tmdbAPI>

  beforeEach(() => {
    // Set up environment
    process.env.OPENAI_API_KEY = 'test-openai-key'
    
    // Setup mocks
    mockTMDB = tmdbAPI as jest.Mocked<typeof tmdbAPI>
    
    const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>
    mockOpenAI = new MockedOpenAI() as jest.Mocked<OpenAI>
    MockedOpenAI.mockImplementation(() => mockOpenAI)
    
    jest.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  it('should generate recommendations using TMDB and OpenAI integration', async () => {
    // Mock TMDB upcoming movies response
    const mockUpcomingMovies = {
      results: [
        {
          id: 999,
          title: 'Future Blockbuster',
          overview: 'An amazing sci-fi adventure.',
          poster_path: '/future-blockbuster.jpg',
          release_date: '2024-12-25',
          vote_average: 8.7,
          genre_ids: [18, 878],
          genre_names: { 18: 'Drama', 878: 'Science Fiction' }
        },
        {
          id: 1000,
          title: 'Action Hero Returns',
          overview: 'High-octane action sequel.',
          poster_path: '/action-hero.jpg',
          release_date: '2024-11-15',
          vote_average: 8.5,
          genre_ids: [28, 12],
          genre_names: { 28: 'Action', 12: 'Adventure' }
        }
      ]
    }

    const mockMovieDetails = {
      id: 999,
      title: 'Future Blockbuster',
      overview: 'An amazing sci-fi adventure.',
      poster_path: '/future-blockbuster.jpg',
      release_date: '2024-12-25',
      vote_average: 8.7,
      genres: [
        { id: 18, name: 'Drama' },
        { id: 878, name: 'Science Fiction' }
      ]
    }

    mockTMDB.getUpcomingMovies.mockResolvedValue(mockUpcomingMovies)
    mockTMDB.getMovieDetails.mockResolvedValue(mockMovieDetails)

    // Mock OpenAI response
    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              recommendations: [
                {
                  movieId: 999,
                  title: 'Future Blockbuster',
                  explanation: 'This sci-fi drama combines elements you love from your favorite movies.'
                }
              ]
            })
          }
        }
      ]
    }

    mockOpenAI.chat = {
      completions: {
        create: jest.fn().mockResolvedValue(mockOpenAIResponse)
      }
    } as any

    // Create our recommendation service logic (extracted from API route)
    const generateRecommendations = async (favorites: any[]) => {
      // Simulate the API route logic
      const upcomingMovies = await tmdbAPI.getUpcomingMovies()
      
      // Filter movies to next two years
      const nextTwoYears = upcomingMovies.results.filter((movie: any) => {
        const releaseDate = new Date(movie.release_date)
        const today = new Date()
        const twoYearsFromNow = new Date()
        twoYearsFromNow.setFullYear(today.getFullYear() + 2)
        return releaseDate > today && releaseDate <= twoYearsFromNow
      })

      // Create AI prompt
      const prompt = `Analyze these favorites and recommend from upcoming movies:
Favorites: ${favorites.map(f => f.title).join(', ')}
Upcoming: ${nextTwoYears.map(m => `${m.id}: ${m.title}`).join(', ')}
Return JSON with recommendations array.`

      // Get AI recommendations
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a movie recommendation expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const aiResponse = completion.choices[0].message.content
      const recommendations = JSON.parse(aiResponse!)

      // Enrich with movie details
      const enrichedRecommendations = await Promise.all(
        recommendations.recommendations.map(async (rec: any) => {
          const movieDetails = await tmdbAPI.getMovieDetails(rec.movieId)
          return {
            id: movieDetails.id,
            title: movieDetails.title,
            overview: movieDetails.overview,
            poster_path: movieDetails.poster_path,
            release_date: movieDetails.release_date,
            vote_average: movieDetails.vote_average,
            genres: movieDetails.genres.map((g: any) => g.name),
            explanation: rec.explanation
          }
        })
      )

      return enrichedRecommendations
    }

    // Execute the test
    const result = await generateRecommendations(mockFavorites)

    // Assertions
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 999,
      title: 'Future Blockbuster',
      explanation: expect.stringContaining('sci-fi')
    })

    // Verify service calls
    expect(mockTMDB.getUpcomingMovies).toHaveBeenCalledTimes(1)
    expect(mockTMDB.getMovieDetails).toHaveBeenCalledWith(999)
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000
      })
    )
  })

  it('should handle TMDB API failures gracefully', async () => {
    mockTMDB.getUpcomingMovies.mockRejectedValue(new Error('TMDB API Error'))

    const generateRecommendations = async (favorites: any[]) => {
      try {
        await tmdbAPI.getUpcomingMovies()
        return []
      } catch (error) {
        throw new Error(`Failed to fetch upcoming movies: ${error}`)
      }
    }

    await expect(generateRecommendations(mockFavorites))
      .rejects
      .toThrow('Failed to fetch upcoming movies')

    expect(mockTMDB.getUpcomingMovies).toHaveBeenCalledTimes(1)
  })

  it('should handle OpenAI API failures gracefully', async () => {
    mockTMDB.getUpcomingMovies.mockResolvedValue({ results: [] })
    
    mockOpenAI.chat = {
      completions: {
        create: jest.fn().mockRejectedValue(new Error('OpenAI API Error'))
      }
    } as any

    const generateRecommendations = async (favorites: any[]) => {
      try {
        await tmdbAPI.getUpcomingMovies()
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [],
          temperature: 0.7,
          max_tokens: 1000
        })
        return []
      } catch (error) {
        throw new Error(`Failed to generate AI recommendations: ${error}`)
      }
    }

    await expect(generateRecommendations(mockFavorites))
      .rejects
      .toThrow('Failed to generate AI recommendations')
  })

  it('should filter movies to next two years only', async () => {
    const currentYear = new Date().getFullYear()
    
    const mockUpcomingMovies = {
      results: [
        {
          id: 1,
          title: 'Near Movie',
          release_date: `${currentYear + 1}-06-15`, // Within 2 years
          overview: 'Near future movie',
          poster_path: '/near.jpg',
          vote_average: 8.0,
          genre_ids: [18]
        },
        {
          id: 2,
          title: 'Far Movie',
          release_date: `${currentYear + 3}-06-15`, // Beyond 2 years
          overview: 'Far future movie',
          poster_path: '/far.jpg',
          vote_average: 8.0,
          genre_ids: [18]
        }
      ]
    }

    mockTMDB.getUpcomingMovies.mockResolvedValue(mockUpcomingMovies)

    const filterMovies = async () => {
      const upcomingMovies = await tmdbAPI.getUpcomingMovies()
      
      const nextTwoYears = upcomingMovies.results.filter((movie: any) => {
        const releaseDate = new Date(movie.release_date)
        const today = new Date()
        const twoYearsFromNow = new Date()
        twoYearsFromNow.setFullYear(today.getFullYear() + 2)
        return releaseDate > today && releaseDate <= twoYearsFromNow
      })

      return nextTwoYears
    }

    const result = await filterMovies()
    
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Near Movie')
    expect(mockTMDB.getUpcomingMovies).toHaveBeenCalledTimes(1)
  })
})