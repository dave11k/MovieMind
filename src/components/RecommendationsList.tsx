import React from 'react';
import { Movie } from '../types/Movie';
import { MovieList } from './MovieList';

interface RecommendationsListProps {
  recommendations: Movie[];
  favorites?: Movie[];
  isLoading?: boolean;
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations, isLoading = false }) => {

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      <p className="text-gray-400 text-sm mb-4">
        Based on your favorites, we think you&apos;ll enjoy these upcoming releases
      </p>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-[2/3] bg-gray-700"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <MovieList movies={recommendations} disableButtons={true} />
      )}
    </div>
  );
};