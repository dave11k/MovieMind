'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
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

  // Load favorites and AI recommendations
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

  // Generate AI recommendations
  const generateRecommendations = async () => {
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
        const recommendationsToSave = data.recommendations.map((rec: any) => ({
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
        localStorage.setItem('aiRecommendations', JSON.stringify(data.recommendations));
      }

      setAiRecommendations(data.recommendations);
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
          <section className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
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
        <div className="mt-12 space-y-8">
          {favorites.length > 0 && (
            <>
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={generateRecommendations}
                  disabled={isGeneratingRecommendations}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                >
                  {isGeneratingRecommendations ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Generating Recommendations...
                    </>
                  ) : (
                    'Generate AI Recommendations'
                  )}
                </button>
                {aiRecommendations.length > 0 && (
                  <button
                    onClick={clearRecommendations}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors flex items-center"
                  >
                    Clear Recommendations
                  </button>
                )}
              </div>
              {aiRecommendations.length > 0 ? (
                <RecommendationsList 
                  recommendations={aiRecommendations} 
                  favorites={favorites} 
                  isLoading={isGeneratingRecommendations} 
                />
              ) : (
                <RecommendationsList 
                  recommendations={recommendations} 
                  favorites={favorites} 
                  isLoading={isGeneratingRecommendations} 
                />
              )}
            </>
          )}
          <FavoritesList 
            favorites={favorites} 
            onRemoveFromFavorites={removeFromFavorites}
            onAddToFavorites={addToFavorites}
          />
        </div>
      </main>
    </div>
  );
} 