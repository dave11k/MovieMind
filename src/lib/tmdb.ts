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
  
    async searchMovie(query: string, page: number = 1) {
      return this.makeRequest('/search/movie', { query, page });
    }
  
    async getMovieDetails(movieId: number, appendToResponse: string = 'credits,videos,similar') {
      return this.makeRequest(`/movie/${movieId}`, { 
        append_to_response: appendToResponse 
      });
    }
  
    async discoverMovies(filters: Record<string, any> = {}) {
      return this.makeRequest('/discover/movie', filters);
    }
  
    async getUpcomingMovies() {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      
      // Fetch movies for current year and next year
      const [currentYearMovies, nextYearMovies] = await Promise.all([
        this.discoverMovies({
          primary_release_year: currentYear,
          sort_by: 'release_date.asc',
          'release_date.gte': new Date().toISOString().split('T')[0] // Only future dates
        }),
        this.discoverMovies({
          primary_release_year: nextYear,
          sort_by: 'release_date.asc'
        })
      ]);

      // Combine and sort results
      return {
        results: [...currentYearMovies.results, ...nextYearMovies.results]
          .sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime())
      };
    }
  
    async getPopularMovies(page: number = 1) {
      return this.makeRequest('/movie/popular', { page });
    }
  
    async getTrendingMovies(timeWindow: string = 'week') {
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