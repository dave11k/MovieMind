import React from 'react';
import { SparklesIcon, RefreshCwIcon } from 'lucide-react';
import { Movie } from '../types/Movie';
import { MovieList } from './MovieList';

interface RecommendationsListProps {
  recommendations: Movie[];
  favorites?: Movie[];
  isLoading?: boolean;
  onGenerateRecommendations?: () => void;
  isGenerating?: boolean;
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({ 
  recommendations, 
  isLoading = false, 
  onGenerateRecommendations,
  isGenerating = false 
}) => {

  return (
    <div data-testid="recommendations-section" className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
          <h2 className="text-2xl font-bold">Recommended for You</h2>
        </div>
        {onGenerateRecommendations && recommendations.length > 0 && (
          <button
            onClick={onGenerateRecommendations}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
          >
            <RefreshCwIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Refresh'}
          </button>
        )}
      </div>
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