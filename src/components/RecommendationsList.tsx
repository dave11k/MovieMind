import React from 'react';
import { SparklesIcon } from 'lucide-react';
import { Movie } from '../types/Movie';
import { MovieList } from './MovieList';

interface RecommendationsListProps {
  recommendations: Movie[];
  favorites: Movie[];
  isLoading?: boolean;
}

export const RecommendationsList = ({
  recommendations,
  favorites,
  isLoading = false
}: RecommendationsListProps) => {
  return (
    <section className="bg-gray-800/50 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
        <h2 className="text-xl font-bold">AI Recommendations</h2>
      </div>
      <p className="text-gray-400 text-sm mb-4">
        Based on your favorites, we think you'll enjoy these upcoming releases
      </p>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div 
              key={`skeleton-${index}`}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-pulse"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationDuration: '1.5s'
              }}
            >
              <div className="aspect-[2/3] w-full bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-700 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded-md w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded-md w-full"></div>
                  <div className="h-3 bg-gray-700 rounded-md w-full"></div>
                  <div className="h-3 bg-gray-700 rounded-md w-2/3"></div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-gray-700 rounded-full w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((movie, index) => (
          <div 
            key={`${movie.id}-${index}`} 
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
            style={{ 
              animation: `slideInUp 0.4s ease-out ${index * 100}ms both`
            }}
          >
            <div className="relative">
              <div className="aspect-[2/3] w-full">
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/no-poster.svg'}
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
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-lg mb-1 truncate">{movie.title}</h3>
              <div className="flex items-center text-sm text-gray-400 mb-2">
                <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}</span>
              </div>
              {'explanation' in movie && (
                <p className="text-gray-300 text-sm flex-grow mb-4">
                  {movie.explanation}
                </p>
              )}
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xs px-2 py-1 bg-gray-700 rounded-full">
                  {movie.genres?.[0] || 'Unknown Genre'}
                </span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </section>
  );
};