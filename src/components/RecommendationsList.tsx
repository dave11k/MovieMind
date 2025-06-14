import React from 'react';
import { Movie } from '../types/Movie';
import { MovieList } from './MovieList';

interface RecommendationsListProps {
  recommendations: Movie[];
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  const isLoading = false;

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
      <p className="text-gray-400 text-sm mb-4">
        Based on your favorites, we think you&apos;ll enjoy these upcoming releases
      </p>
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((movie) => (
            <MovieList.Item key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};