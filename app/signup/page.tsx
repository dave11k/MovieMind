'use client';

import { SignupForm } from '@/components/auth/SignupForm';
import { FilmIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Signup() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Simplified Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to MovieMind</span>
          </Link>
          <div className="flex items-center space-x-2">
            <FilmIcon className="h-8 w-8 text-purple-500" />
            <span className="text-xl font-bold">MovieMind</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white">Join MovieMind</h2>
            <p className="mt-2 text-sm text-gray-400">
              Create an account to sync your favorites across devices
            </p>
          </div>
          <SignupForm />
          
          {/* Continue as Guest */}
          <div className="text-center">
            <Link 
              href="/" 
              className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 