import React, { createContext, useContext } from 'react';
import { Movie } from '../types/Movie';
import { PlusCircleIcon, XCircleIcon } from 'lucide-react';

interface MovieListContextType {
  onAddToFavorites?: (movie: Movie) => void;
  onRemoveFromFavorites?: (movieId: number) => void;
  favorites?: Movie[];
  disableButtons?: boolean;
}

const MovieListContext = createContext<MovieListContextType>({});

interface MovieListProps {
  children: React.ReactNode;
  onAddToFavorites?: (movie: Movie) => void;
  onRemoveFromFavorites?: (movieId: number) => void;
  favorites?: Movie[];
  disableButtons?: boolean;
}

const MovieList = ({
  children,
  onAddToFavorites,
  onRemoveFromFavorites,
  favorites = [],
  disableButtons = false
}: MovieListProps) => {
  return (
    <MovieListContext.Provider value={{ onAddToFavorites, onRemoveFromFavorites, favorites, disableButtons }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {children}
      </div>
    </MovieListContext.Provider>
  );
};

interface MovieItemProps {
  movie: Movie;
  isFavorite?: boolean;
}

const MovieItem = ({ movie }: MovieItemProps) => {
  const { onAddToFavorites, onRemoveFromFavorites, favorites = [], disableButtons = false } = useContext(MovieListContext);
  const isFavorite = favorites.some(fav => fav.id === movie.id);
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/no-poster.svg';

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <div className="aspect-[2/3] w-full">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
        {movie.vote_average && !isNaN(movie.vote_average) && movie.vote_average > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex items-center">
            <span className="text-xs font-medium">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col h-[130px]">
        <h3 className="font-bold text-lg mb-2 truncate">{movie.title}</h3>
        <div className="flex items-center text-sm text-gray-400 mb-2">
          <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
        </div>
        {!disableButtons && (
          <div className="flex justify-between items-center mt-auto">
            <span className="text-xs px-2 py-1 bg-gray-700 rounded-full">
              {movie.genres?.[0] || 'Unknown Genre'}
            </span>
            {isFavorite ? (
              <button
                onClick={() => onRemoveFromFavorites?.(movie.id)}
                className="bg-red-400/10 text-red-400 hover:bg-red-400/20 hover:text-red-300 transition-colors flex items-center px-3 py-1.5 rounded-lg"
              >
                <XCircleIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">Remove</span>
              </button>
            ) : (
              <button
                onClick={() => onAddToFavorites?.(movie)}
                className="bg-purple-400/10 text-purple-400 hover:bg-purple-400/20 hover:text-purple-300 transition-colors flex items-center px-3 py-1.5 rounded-lg"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">Add</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

MovieList.Item = MovieItem;

export { MovieList };