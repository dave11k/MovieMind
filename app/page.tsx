'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '../src/components/Header';
import { SearchBar } from '../src/components/SearchBar';
import { MovieList } from '../src/components/MovieList';
import { FavoritesList } from '../src/components/FavoritesList';
import { RecommendationsList } from '../src/components/RecommendationsList';
import { Movie } from '../src/types/Movie';
import { mockRecommendations } from '../src/data/mockData';
import { tmdbAPI, genreMap } from '../src/lib/tmdb';
import debounce from 'lodash/debounce';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>(mockRecommendations);
  const [isSearching, setIsSearching] = useState(false);
  const [visibleResults, setVisibleResults] = useState(4);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('movieFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim() === '') {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        const response = await tmdbAPI.searchMovie(query);
        const movies: Movie[] = response.results.slice(0, 24).map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids,
          genres: movie.genre_ids.map((id: number) => genreMap[id] || 'Unknown')
        }));
        setSearchResults(movies);
        setVisibleResults(4); // Reset visible results when new search
      } catch (error) {
        console.error('Error searching movies:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Update search results when query changes
  useEffect(() => {
    setIsSearching(true);
    debouncedSearch(searchQuery);
    
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Add to favorites
  const addToFavorites = (movie: Movie) => {
    if (!favorites.some(fav => fav.id === movie.id)) {
      const newFavorites = [...favorites, movie];
      setFavorites(newFavorites);
      // Save to localStorage
      localStorage.setItem('movieFavorites', JSON.stringify(newFavorites));
    }
  };

  // Remove from favorites
  const removeFromFavorites = (movieId: number) => {
    const newFavorites = favorites.filter(movie => movie.id !== movieId);
    setFavorites(newFavorites);
    // Save to localStorage
    localStorage.setItem('movieFavorites', JSON.stringify(newFavorites));
  };

  // Show more results
  const showMoreResults = () => {
    setVisibleResults(prev => Math.min(prev + 4, searchResults.length));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2">Search Movies</h1>
        <p className="text-gray-400 text-center mb-8">Add favourites to get AI recommendations</p>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {isSearching ? (
          <section className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </section>
        ) : searchQuery.trim() !== '' && (
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
            {searchResults.length > 0 ? (
              <>
                <MovieList 
                  onAddToFavorites={addToFavorites} 
                  onRemoveFromFavorites={removeFromFavorites}
                  favorites={favorites}
                >
                  {searchResults.slice(0, visibleResults).map(movie => (
                    <MovieList.Item key={movie.id} movie={movie} />
                  ))}
                </MovieList>
                {visibleResults < searchResults.length && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={showMoreResults}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Show More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No movies found for "{searchQuery}"</p>
              </div>
            )}
          </section>
        )}
        <div className="mt-12 space-y-8">
          {favorites.length > 0 && <RecommendationsList recommendations={recommendations} favorites={favorites} />}
          <FavoritesList 
            favorites={favorites} 
            onRemoveFromFavorites={removeFromFavorites}
            onAddToFavorites={addToFavorites}
          />
        </div>
      </main>
    </div>
  );
} 