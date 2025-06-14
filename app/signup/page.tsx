'use client';

import { SignupForm } from '@/components/auth/SignupForm';
import { FilmIcon } from 'lucide-react';

export default function Signup() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <FilmIcon className="h-12 w-12 text-purple-500" />
          <h2 className="mt-6 text-3xl font-bold text-white">Join MovieMind</h2>
          <p className="mt-2 text-sm text-gray-400">
            Create an account to sync your favorites across devices
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
} 