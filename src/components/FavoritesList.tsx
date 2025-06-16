import React, { useState } from 'react';
import { HeartIcon, ChevronDownIcon, ChevronUpIcon, Trash2Icon } from 'lucide-react';
import { Movie } from '../types/Movie';
import { MovieList } from './MovieList';

interface FavoritesListProps {
  favorites: Movie[];
  onRemoveFromFavorites: (movieId: number) => void;
  onAddToFavorites: (movie: Movie) => void;
  onClearAllFavorites?: () => void;
}

export const FavoritesList = ({
  favorites,
  onRemoveFromFavorites,
  onAddToFavorites,
  onClearAllFavorites
}: FavoritesListProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section id="favorites-section" className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <HeartIcon className="h-6 w-6 text-pink-400 mr-2" />
          <h2 className="text-2xl font-bold text-pink-400">
            Your Favorites ({favorites.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {favorites.length > 0 && onClearAllFavorites && (
            <button
              onClick={onClearAllFavorites}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <Trash2Icon className="h-4 w-4" />
              Remove All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <>
          {favorites.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Search for movies and add them to your favorites</p>
            </div>
          ) : (
            <MovieList 
              movies={favorites}
              onRemoveFromFavorites={onRemoveFromFavorites} 
              onAddToFavorites={onAddToFavorites}
              favorites={favorites}
            />
          )}
        </>
      )}
    </section>
  );
};