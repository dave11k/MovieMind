'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { SparklesIcon, SearchIcon } from 'lucide-react';
import { Header } from '../src/components/Header';
import { SearchBar } from '../src/components/SearchBar';
import { MovieList } from '../src/components/MovieList';
import { FavoritesList } from '../src/components/FavoritesList';
import { RecommendationsList } from '../src/components/RecommendationsList';
import { Movie } from '../src/types/Movie';
import { tmdbAPI, genreMap, getMovieDetails } from '../src/lib/tmdb';
import { supabase } from '../src/lib/supabase';
import debounce from 'lodash/debounce';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [recommendations] = useState<Movie[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [visibleResults, setVisibleResults] = useState(4);
  const [user, setUser] = useState<any>(null);

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      // If user signs in, sync localStorage data with Supabase
      if (session?.user) {
        // Sync favorites
        const localFavorites = localStorage.getItem('movieFavorites');
        if (localFavorites) {
          const parsedFavorites = JSON.parse(localFavorites);
          // Upload each favorite to Supabase
          for (const movie of parsedFavorites) {
            await supabase
              .from('favorites')
              .upsert({
                user_id: session.user.id,
                movie_id: movie.id,
                movie_title: movie.title,
                movie_poster: movie.poster_path,
                movie_year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
                movie_genres: movie.genres
              }, {
                onConflict: 'user_id,movie_id'
              });
          }
          // Clear localStorage after successful sync
          localStorage.removeItem('movieFavorites');
        }

        // Sync recommendations
        const localRecommendations = localStorage.getItem('aiRecommendations');
        if (localRecommendations) {
          const parsedRecommendations = JSON.parse(localRecommendations);
          // Upload recommendations to Supabase
          const recommendationsToSave = parsedRecommendations.map((rec: any) => ({
            user_id: session.user.id,
            movie_id: rec.id,
            movie_title: rec.title,
            movie_poster: rec.poster_path,
            movie_year: rec.release_date ? parseInt(rec.release_date.split('-')[0]) : null,
            reason: rec.reason || 'Based on your favorites',
            confidence_score: rec.confidence_score || 0.8
          }));

          const { error } = await supabase
            .from('recommendations')
            .insert(recommendationsToSave);

          if (error) {
            console.error('Error syncing recommendations:', error);
          } else {
            // Clear localStorage after successful sync
            localStorage.removeItem('aiRecommendations');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load favorites and AI recommendations (only on initial load)
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Load from Supabase for signed-in users
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (favoritesError) {
          console.error('Error loading favorites:', favoritesError);
          return;
        }

        const formattedFavorites = favoritesData.map(fav => ({
          id: fav.movie_id,
          title: fav.movie_title,
          poster_path: fav.movie_poster,
          backdrop_path: null,
          release_date: fav.movie_year?.toString(),
          overview: '',
          vote_average: fav.vote_average || 0,
          genre_ids: [],
          genres: fav.movie_genres || []
        }));

        setFavorites(formattedFavorites);

        // Load AI recommendations (only most recent 8)
        const { data: recommendationsData, error: recommendationsError } = await supabase
          .from('recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(8);

        if (recommendationsError) {
          console.error('Error loading recommendations:', recommendationsError);
          return;
        }

        const formattedRecommendations = recommendationsData.map(rec => ({
          id: rec.movie_id,
          title: rec.movie_title,
          poster_path: rec.movie_poster,
          backdrop_path: null,
          release_date: rec.movie_year?.toString() || '',
          overview: '',
          vote_average: 0,
          genre_ids: [],
          genres: [],
          explanation: rec.reason
        }));

        console.log('Loading saved recommendations from DB:', formattedRecommendations.length);
        setAiRecommendations(formattedRecommendations);
      } else {
        // Load from localStorage for anonymous users
        const savedFavorites = localStorage.getItem('movieFavorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        
        const savedRecommendations = localStorage.getItem('aiRecommendations');
        if (savedRecommendations) {
          setAiRecommendations(JSON.parse(savedRecommendations));
        }
      }
    };

    loadUserData();
  }, [user]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.trim() === '') {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        const response = await tmdbAPI.searchMovie(query);
        const movies: Movie[] = response.results.slice(0, 24).map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids,
          genres: movie.genre_ids.map((id: number) => genreMap[id] || 'Unknown')
        }));
        setSearchResults(movies);
        setVisibleResults(4); // Reset visible results when new search
      } catch (error) {
        console.error('Error searching movies:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Update search results when query changes
  useEffect(() => {
    setIsSearching(true);
    debouncedSearch(searchQuery);
    
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Add to favorites
  const addToFavorites = async (movie: Movie) => {
    if (!favorites.some(fav => fav.id === movie.id)) {
      if (user) {
        // Save to Supabase for signed-in users
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            movie_id: movie.id,
            movie_title: movie.title,
            movie_poster: movie.poster_path,
            movie_year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
            movie_genres: movie.genres,
            vote_average: movie.vote_average
          });

        if (error) {
          console.error('Error adding favorite:', error);
          return;
        }
      } else {
        // Save to localStorage for anonymous users
        const newFavorites = [...favorites, movie];
        localStorage.setItem('movieFavorites', JSON.stringify(newFavorites));
      }
      setFavorites(prev => [...prev, movie]);
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (movieId: number) => {
    if (user) {
      // Remove from Supabase for signed-in users
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      if (error) {
        console.error('Error removing favorite:', error);
        return;
      }
    } else {
      // Remove from localStorage for anonymous users
      const newFavorites = favorites.filter(movie => movie.id !== movieId);
      localStorage.setItem('movieFavorites', JSON.stringify(newFavorites));
    }
    setFavorites(prev => prev.filter(movie => movie.id !== movieId));
  };

  // Generate AI recommendations with retry logic
  const generateRecommendations = async (retryCount = 0) => {
    if (favorites.length === 0) {
      alert('Please add some movies to your favorites first!');
      return;
    }

    setIsGeneratingRecommendations(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favorites: favorites,
          userId: user?.id
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
      }


      // Deduplicate recommendations by movie ID
      const uniqueRecommendations = data.recommendations.reduce((acc: Movie[], current: Movie) => {
        const exists = acc.find(movie => movie.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Check if we have fewer than 4 recommendations and retry if needed
      if (uniqueRecommendations.length < 4 && retryCount < 2) {
        console.log(`Only ${uniqueRecommendations.length} recommendations generated, retrying... (attempt ${retryCount + 1})`);
        setIsGeneratingRecommendations(false);
        return generateRecommendations(retryCount + 1);
      }

      if (user) {
        // Clear existing recommendations first
        const { error: deleteError } = await supabase
          .from('recommendations')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error clearing old recommendations:', deleteError);
        }

        // Save new recommendations to Supabase for signed-in users
        const recommendationsToSave = uniqueRecommendations.map((rec: any) => ({
          user_id: user.id,
          movie_id: rec.id,
          movie_title: rec.title,
          movie_poster: rec.poster_path,
          movie_year: rec.release_date ? parseInt(rec.release_date.split('-')[0]) : null,
          reason: rec.explanation,
          confidence_score: rec.confidence_score || 0.8
        }));

        const { error } = await supabase
          .from('recommendations')
          .insert(recommendationsToSave);

        if (error) {
          console.error('Error saving recommendations:', error);
        }
      } else {
        // Save recommendations to localStorage for anonymous users
        localStorage.setItem('aiRecommendations', JSON.stringify(uniqueRecommendations));
      }

      console.log('Setting new AI recommendations:', uniqueRecommendations.length);
      setAiRecommendations(uniqueRecommendations);
      
      // Scroll to recommendations section after setting recommendations
      setTimeout(() => {
        const recommendationsSection = document.querySelector('[data-testid="recommendations-section"]');
        if (recommendationsSection) {
          recommendationsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      alert(`Failed to generate recommendations: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  // Clear recommendations
  const clearRecommendations = async () => {
    if (user) {
      // Clear from Supabase for signed-in users
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing recommendations:', error);
        return;
      }
    } else {
      // Clear from localStorage for anonymous users
      localStorage.removeItem('aiRecommendations');
    }

    setAiRecommendations([]);
  };

  // Clear all favorites
  const clearAllFavorites = async () => {
    if (window.confirm('Are you sure you want to remove all favorites?')) {
      if (user) {
        // Clear from Supabase for signed-in users
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error clearing favorites:', error);
          return;
        }
      } else {
        // Clear from localStorage for anonymous users
        localStorage.removeItem('movieFavorites');
      }

      setFavorites([]);
      setAiRecommendations([]); // Also clear recommendations when clearing favorites
    }
  };

  // Show more results
  const showMoreResults = () => {
    setVisibleResults(prev => Math.min(prev + 4, searchResults.length));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2">Search Movies</h1>
        <p className="text-gray-400 text-center mb-8">Add favourites to get AI recommendations</p>

        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {isSearching ? (
          <section className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </section>
        ) : searchQuery.trim() !== '' && (
          <section className="mt-8 bg-slate-800 rounded-xl p-6">
            <div className="flex items-center mb-6">
              <SearchIcon className="h-6 w-6 text-purple-400 mr-2" />
              <h2 className="text-2xl font-bold text-purple-400">Search Results</h2>
            </div>
            {searchResults.length > 0 ? (
              <>
                <MovieList 
                  onAddToFavorites={addToFavorites} 
                  onRemoveFromFavorites={removeFromFavorites}
                  favorites={favorites}
                >
                  {searchResults.slice(0, visibleResults).map((movie, index) => (
                    <div
                      key={movie.id}
                      style={{ 
                        animation: `slideInUp 0.4s ease-out ${index * 50}ms both`
                      }}
                    >
                      <MovieList.Item movie={movie} />
                    </div>
                  ))}
                </MovieList>
                {visibleResults < searchResults.length && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={showMoreResults}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Show More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No movies found for "{searchQuery}"</p>
              </div>
            )}
          </section>
        )}
        
        {/* Section Divider */}
        {(searchQuery.trim() !== '' && searchResults.length > 0) && (favorites.length > 0) && (
          <hr className="my-12 border-gray-700" />
        )}
        
        <div className="space-y-12 pb-24 mt-12">
          {favorites.length > 0 && (aiRecommendations.length > 0 || isGeneratingRecommendations) && (
            <RecommendationsList 
              recommendations={aiRecommendations} 
              favorites={favorites} 
              isLoading={isGeneratingRecommendations}
              onGenerateRecommendations={generateRecommendations}
              isGenerating={isGeneratingRecommendations}
            />
          )}
          
          {/* Section Divider between Recommendations and Favorites */}
          {favorites.length > 0 && (aiRecommendations.length > 0 || isGeneratingRecommendations) && (
            <hr className="border-gray-700" />
          )}
          
          <FavoritesList 
            favorites={favorites} 
            onRemoveFromFavorites={removeFromFavorites}
            onAddToFavorites={addToFavorites}
            onClearAllFavorites={clearAllFavorites}
          />
        </div>
      </main>
      
      {/* Sticky Bottom Bar for AI Recommendations */}
      {favorites.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-gray-700 p-4 z-50">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-purple-400 font-medium">
                Seen The Dark Knight? Let AI find your next watch.
              </p>
              <p className="text-sm text-gray-400">
                {favorites.length} favorite{favorites.length !== 1 ? 's' : ''} ready for analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              {aiRecommendations.length > 0 && (
                <button
                  onClick={clearRecommendations}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                >
                  Clear Recommendations
                </button>
              )}
              <button
                onClick={() => generateRecommendations()}
                disabled={isGeneratingRecommendations}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center font-medium text-sm sm:text-base"
              >
                {isGeneratingRecommendations ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Generating AI Magic...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Generate AI Recommendations
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 