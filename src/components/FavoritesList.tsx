import React from 'react';
import { HeartIcon } from 'lucide-react';
import { Movie } from '../types/Movie';
import { MovieList } from './MovieList';

interface FavoritesListProps {
  favorites: Movie[];
  onRemoveFromFavorites: (movieId: number) => void;
  onAddToFavorites: (movie: Movie) => void;
}

export const FavoritesList = ({
  favorites,
  onRemoveFromFavorites,
  onAddToFavorites
}: FavoritesListProps) => {
  return (
    <section className="bg-gray-800/50 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <HeartIcon className="h-6 w-6 text-red-500 mr-2" />
        <h2 className="text-xl font-bold">Your Favorites</h2>
      </div>
      {favorites.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>Search for movies and add them to your favorites</p>
        </div>
      ) : (
        <MovieList 
          onRemoveFromFavorites={onRemoveFromFavorites} 
          onAddToFavorites={onAddToFavorites}
          favorites={favorites}
        >
          {favorites.map(movie => (
            <MovieList.Item key={movie.id} movie={movie} />
          ))}
        </MovieList>
      )}
    </section>
  );
};