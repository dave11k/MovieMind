import React from 'react';
import { SparklesIcon } from 'lucide-react';
import { Movie } from '../types/Movie';
import { MovieList } from './MovieList';

interface RecommendationsListProps {
  recommendations: Movie[];
  favorites: Movie[];
}

export const RecommendationsList = ({
  recommendations,
  favorites
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
      <MovieList favorites={favorites} disableButtons={true}>
        {recommendations.map(movie => (
          <MovieList.Item key={movie.id} movie={movie} />
        ))}
      </MovieList>
    </section>
  );
};