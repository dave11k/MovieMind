'use client';

import { Header } from '@/components/Header';
import { FilmIcon, SparklesIcon, BrainIcon, HeartIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to MovieMind</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Mobile layout - stacked */}
          <div className="flex flex-col items-center space-y-3 sm:hidden mb-6">
            <div className="flex items-center space-x-2">
              <FilmIcon className="h-8 w-8 text-purple-500" />
              <h1 className="text-2xl font-bold">About MovieMind</h1>
            </div>
            <div className="flex items-center bg-purple-900/50 rounded-full px-3 py-1">
              <SparklesIcon className="h-4 w-4 text-purple-400 mr-1" />
              <span className="text-purple-300 text-sm">AI Powered</span>
            </div>
          </div>
          
          {/* Desktop layout - horizontal */}
          <div className="hidden sm:flex justify-center items-center space-x-3 mb-6">
            <FilmIcon className="h-10 w-10 lg:h-12 lg:w-12 text-purple-500" />
            <h1 className="text-3xl lg:text-4xl font-bold">About MovieMind</h1>
            <div className="flex items-center bg-purple-900/50 rounded-full px-3 py-1">
              <SparklesIcon className="h-5 w-5 text-purple-400 mr-1" />
              <span className="text-purple-300 text-sm">AI Powered</span>
            </div>
          </div>
          
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Discover your next favorite movie with personalized AI recommendations based on your unique taste.
          </p>
        </div>

        {/* How It Works Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <HeartIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">1. Add Favorites</h3>
            <p className="text-gray-300">
              Search and save movies you love to build your personal taste profile.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <BrainIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">2. AI Analysis</h3>
            <p className="text-gray-300">
              Our AI analyzes your favorites to understand your preferences and movie taste patterns.
            </p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <SparklesIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">3. Get Recommendations</h3>
            <p className="text-gray-300">
              Receive personalized recommendations for upcoming movies you&apos;ll actually want to see.
            </p>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-gray-800/30 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Powered by Advanced AI</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-purple-400">OpenAI GPT Integration</h3>
              <p className="text-gray-300 mb-4">
                Our recommendation engine uses OpenAI&apos;s advanced language models to understand the nuances of your movie preferences, analyzing genres, themes, directors, and storytelling styles.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-purple-400">TMDB Database</h3>
              <p className="text-gray-300 mb-4">
                We leverage The Movie Database (TMDB) to access comprehensive movie information, including upcoming releases, cast details, and user ratings.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Why MovieMind?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-purple-400">Smart Recommendations</h4>
              <p className="text-sm text-gray-300">AI analyzes your taste to suggest movies you&apos;ll actually enjoy</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-purple-400">Upcoming Releases</h4>
              <p className="text-sm text-gray-300">Focus on new movies coming to theaters in the next 2 years</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-purple-400">No Account Required</h4>
              <p className="text-sm text-gray-300">Start discovering movies immediately, sign up only if you want sync</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-purple-400">Detailed Explanations</h4>
              <p className="text-sm text-gray-300">Understand why each movie was recommended for you</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Discover Your Next Favorite Movie?</h2>
          <p className="text-gray-300 mb-6">Start by adding some movies you love and let our AI do the rest.</p>
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            <FilmIcon className="h-5 w-5" />
            <span>Start Discovering</span>
          </Link>
        </div>
      </main>
    </div>
  );
}