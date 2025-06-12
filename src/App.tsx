import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { MovieList } from './components/MovieList';
import { FavoritesList } from './components/FavoritesList';
import { RecommendationsList } from './components/RecommendationsList';
import { Movie } from './types/Movie';
import { mockMovies, mockRecommendations } from './data/mockData';
export function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>(mockRecommendations);
  // Simulate search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filteredMovies = mockMovies.filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()));
    setSearchResults(filteredMovies);
  }, [searchQuery]);
  // Add to favorites
  const addToFavorites = (movie: Movie) => {
    if (!favorites.some(fav => fav.id === movie.id)) {
      setFavorites([...favorites, movie]);
    }
  };
  // Remove from favorites
  const removeFromFavorites = (movieId: number) => {
    setFavorites(favorites.filter(movie => movie.id !== movieId));
  };
  return <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {searchResults.length > 0 && <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
            <MovieList movies={searchResults} onAddToFavorites={addToFavorites} />
          </section>}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FavoritesList favorites={favorites} onRemoveFromFavorites={removeFromFavorites} />
          <RecommendationsList recommendations={recommendations} />
        </div>
      </main>
    </div>;
}