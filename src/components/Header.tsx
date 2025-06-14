import React from 'react';
import { FilmIcon, SparklesIcon, LogInIcon, LogOutIcon, Heart, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export const Header = () => {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="bg-gray-800 py-4 shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <FilmIcon className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold">MovieMind</h1>
          <div className="flex items-center bg-purple-900/50 rounded-full px-3 py-1 text-sm">
            <SparklesIcon className="h-4 w-4 text-purple-400 mr-1" />
            <span className="text-purple-300">AI Powered</span>
          </div>
        </Link>
        <nav className="flex items-center space-x-6">
          <ul className="flex space-x-6">
            <li>
              <button
                onClick={() => {
                  // If we're on the home page, scroll to favorites
                  if (window.location.pathname === '/') {
                    const favoritesSection = document.getElementById('favorites-section');
                    favoritesSection?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    // If we're on another page, navigate to home with favorites anchor
                    router.push('/#favorites-section');
                  }
                }}
                className="flex items-center space-x-1 hover:text-purple-400 transition-colors cursor-pointer"
              >
                <Heart className="h-4 w-4" />
                <span>My Favorites</span>
              </button>
            </li>
            <li>
              <Link 
                href="/about" 
                className="flex items-center space-x-1 hover:text-purple-400 transition-colors"
              >
                <Info className="h-4 w-4" />
                <span>About</span>
              </Link>
            </li>
          </ul>
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <LogOutIcon className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <LogInIcon className="h-5 w-5" />
              <span>Sign In</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};