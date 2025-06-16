import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchBar = ({
  searchQuery,
  setSearchQuery
}: SearchBarProps) => {
  return (
    <div className="relative w-full max-w-xl mx-auto mt-8">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="h-6 w-6 text-gray-400" />
      </div>
      <input 
        type="text" 
        value={searchQuery} 
        onChange={e => setSearchQuery(e.target.value)} 
        className="block w-full pl-12 pr-24 py-4 border border-gray-600 rounded-lg bg-gray-800 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all" 
        placeholder="Search by title or keyword..." 
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <XIcon className="h-5 w-5 mr-1" />
          <span className="text-sm">Clear</span>
        </button>
      )}
    </div>
  );
};