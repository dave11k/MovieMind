import React from 'react';
import { FilmIcon, SparklesIcon } from 'lucide-react';
export const Header = () => {
  return <header className="bg-gray-800 py-4 shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FilmIcon className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold">MovieMind</h1>
          <div className="flex items-center bg-purple-900/50 rounded-full px-3 py-1 text-sm">
            <SparklesIcon className="h-4 w-4 text-purple-400 mr-1" />
            <span className="text-purple-300">AI Powered</span>
          </div>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li className="hover:text-purple-400 transition-colors cursor-pointer">
              Home
            </li>
            <li className="hover:text-purple-400 transition-colors cursor-pointer">
              Discover
            </li>
            <li className="hover:text-purple-400 transition-colors cursor-pointer">
              Profile
            </li>
          </ul>
        </nav>
      </div>
    </header>;
};