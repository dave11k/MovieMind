import { Movie } from '../types/Movie';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBResponse<T> {
  results: T[];
  total_pages: number;
  total_results: number;
  page: number;
}

export async function searchMovies(query: string, page = 1): Promise<{ movies: Movie[]; totalPages: number }> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch movies from TMDB');
  }

  const data: TMDBResponse<Movie> = await response.json();

  return {
    movies: data.results,
    totalPages: data.total_pages,
  };
}

export async function getMovieDetails(id: number): Promise<Movie> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch movie details from TMDB');
  }

  const movie: Movie = await response.json();
  return movie;
}

class TMDBService {
    private accessToken: string;
    private baseURL: string;

    constructor() {
      this.accessToken = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
      this.baseURL = 'https://api.themoviedb.org/3';
    }
  
    async makeRequest(endpoint: string, params: Record<string, any> = {}) {
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
  
      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`TMDB API Error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('TMDB API request failed:', error);
        throw error;
      }
    }
  
    async searchMovie(query: string, page = 1) {
      return this.makeRequest('/search/movie', { query, page });
    }
  
    async getMovieDetails(movieId: number, appendToResponse = 'credits,videos,similar,external_ids') {
      return this.makeRequest(`/movie/${movieId}`, { 
        append_to_response: appendToResponse 
      });
    }
  
    async discoverMovies(filters: Record<string, any> = {}) {
      return this.makeRequest('/discover/movie', filters);
    }
  
    async getUpcomingMovies() {
      const allMovies = [];
      let page = 1;
      let hasMorePages = true;
      
      while (hasMorePages && page <= 8) { // Fetch up to 8 pages (160 movies)
        const response = await this.makeRequest('/movie/upcoming', {
          sort_by: 'release_date.asc',
          page
        });
        
        allMovies.push(...response.results);
        
        hasMorePages = page < response.total_pages;
        page++;
      }
      
      return {
        results: allMovies,
        total_pages: Math.ceil(allMovies.length / 20),
        total_results: allMovies.length,
        page: 1
      };
    }
  
    async getPopularMovies(page = 1) {
      return this.makeRequest('/movie/popular', { page });
    }
  
    async getTrendingMovies(timeWindow = 'week') {
      return this.makeRequest(`/trending/movie/${timeWindow}`);
    }

    async getGenres() {
      const response = await this.makeRequest('/genre/movie/list');
      return response.genres.reduce((map: { [key: number]: string }, genre: { id: number; name: string }) => {
        map[genre.id] = genre.name;
        return map;
      }, {});
    }
}

export const tmdbAPI = new TMDBService();

// Initialize genreMap
let genreMap: { [key: number]: string } = {};
const initGenreMap = async () => {
  genreMap = await tmdbAPI.getGenres();
};
initGenreMap();

export { genreMap }; 