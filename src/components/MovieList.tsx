import React, { createContext, useContext, useState } from 'react';
import Image from 'next/image';
import { Movie } from '../types/Movie';
import { PlusCircleIcon, XCircleIcon, ExternalLinkIcon, Star } from 'lucide-react';
import { tmdbAPI } from '../lib/tmdb';

interface MovieListContextType {
  onAddToFavorites?: (movie: Movie) => void;
  onRemoveFromFavorites?: (movieId: number) => void;
  favorites?: Movie[];
  disableButtons?: boolean;
}

const MovieListContext = createContext<MovieListContextType>({});

// Star Rating Component
const StarRating = ({ rating, compact = false }: { rating: number; compact?: boolean }) => {
  const stars = Math.round((rating / 10) * 5); // Convert 10-star to 5-star rating
  const filledStars = Math.max(0, Math.min(5, stars));
  
  if (compact) {
    return (
      <div className="flex items-center">
        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
        <span className="text-xs text-white font-medium">
          {rating > 0 ? rating.toFixed(1) : 'N/A'}
        </span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < filledStars
              ? 'text-yellow-400 fill-current'
              : 'text-gray-400'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-400">
        {rating > 0 ? rating.toFixed(1) : 'N/A'}
      </span>
    </div>
  );
};

interface MovieListProps {
  children?: React.ReactNode;
  movies?: Movie[];
  onAddToFavorites?: (movie: Movie) => void;
  onRemoveFromFavorites?: (movieId: number) => void;
  favorites?: Movie[];
  disableButtons?: boolean;
}

const MovieList = ({
  children,
  movies = [],
  onAddToFavorites,
  onRemoveFromFavorites,
  favorites = [],
  disableButtons = false
}: MovieListProps) => {
  const contextValue = {
    onAddToFavorites,
    onRemoveFromFavorites,
    favorites,
    disableButtons
  };

  return (
    <MovieListContext.Provider value={contextValue}>
      <div data-testid="movie-list-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {movies.length > 0 ? (
          movies.map(movie => (
            <MovieItem key={movie.id} movie={movie} />
          ))
        ) : (
          children
        )}
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
  const [imdbUnavailable, setImdbUnavailable] = useState(false);
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/no-poster.svg';

  const handleImdbClick = async () => {
    if (imdbUnavailable) {
      return; // Do nothing if we know IMDB is unavailable
    }

    if (movie.imdb_id) {
      // If we already have the IMDB ID, open directly
      window.open(`https://www.imdb.com/title/${movie.imdb_id}/`, '_blank');
      return;
    }

    // Otherwise, fetch the IMDB ID from TMDB
    try {
      const movieDetails = await tmdbAPI.getMovieDetails(movie.id);
      const imdbId = movieDetails.external_ids?.imdb_id;
      
      if (imdbId) {
        window.open(`https://www.imdb.com/title/${imdbId}/`, '_blank');
      } else {
        console.warn('No IMDB ID found for this movie');
        setImdbUnavailable(true); // Mark as unavailable
      }
    } catch (error) {
      console.error('Error fetching IMDB ID:', error);
      setImdbUnavailable(true); // Mark as unavailable on error
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 flex flex-col cursor-pointer group">
      <div className="relative">
        <div className="aspect-[2/3] w-full relative">
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="absolute top-2 right-2 bg-black/80 rounded-lg px-2 py-1 flex flex-col items-end gap-1">
          {movie.release_date && (
            <span className="text-xs font-bold text-white bg-purple-600 px-2 py-1 rounded">
              {new Date(movie.release_date).getFullYear()}
            </span>
          )}
          {movie.vote_average !== undefined && !isNaN(movie.vote_average) && movie.vote_average > 0 && (
            <StarRating rating={movie.vote_average} compact={true} />
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-2 truncate">{movie.title}</h3>
        {!disableButtons ? (
          <div className="flex justify-between items-center mt-auto">
            <span className="text-xs px-2 py-1 bg-gray-700 rounded-full">
              {movie.genres?.[0] || 'Unknown Genre'}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleImdbClick}
                disabled={imdbUnavailable}
                className={`flex items-center space-x-1 px-2 py-1 text-white text-xs rounded transition-colors ${
                  imdbUnavailable 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                <ExternalLinkIcon className="h-3 w-3" />
                <span>IMDB</span>
              </button>
              {isFavorite ? (
                <button
                  onClick={() => onRemoveFromFavorites?.(movie.id)}
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-colors flex items-center justify-center px-3 py-1.5 rounded-lg font-medium border border-red-500/30"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm leading-none" style={{ marginBottom: '2px' }}>Remove</span>
                </button>
              ) : (
                <button
                  onClick={() => onAddToFavorites?.(movie)}
                  className="bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 transition-colors flex items-center justify-center px-3 py-1.5 rounded-lg font-medium border border-green-500/30"
                >
                  <PlusCircleIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm leading-none" style={{ marginBottom: '2px' }}>Add</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-grow">
            {movie.explanation && (
              <div className="bg-purple-900/30 rounded-md p-2 border-l-2 border-purple-500">
                <p className="text-sm text-gray-300 italic">
                  {movie.explanation}
                </p>
              </div>
            )}
            <div className="flex justify-end mt-auto pt-2">
              <button
                onClick={handleImdbClick}
                disabled={imdbUnavailable}
                className={`flex items-center space-x-1 px-2 py-1 text-white text-xs rounded transition-colors ${
                  imdbUnavailable 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                <ExternalLinkIcon className="h-3 w-3" />
                <span>IMDB</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MovieList.Item = MovieItem;

export { MovieList };