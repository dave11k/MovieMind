import React from 'react';
import { FilmIcon, SparklesIcon, LogInIcon, LogOutIcon, Heart, Info, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export const Header = () => {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-sm py-4 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4">
        {/* Main header row */}
        <div className="flex items-center justify-between">
          {/* Logo section - responsive sizing */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <FilmIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            <h1 className="text-lg sm:text-2xl font-bold">MovieMind</h1>
            <div className="flex items-center bg-purple-900/50 rounded-full px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
              <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 mr-1" />
              <span className="text-purple-300">AI Powered</span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <ul className="flex space-x-6">
              <li>
                <button
                  onClick={() => {
                    if (window.location.pathname === '/') {
                      const favoritesSection = document.getElementById('favorites-section');
                      favoritesSection?.scrollIntoView({ behavior: 'smooth' });
                    } else {
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
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-800 text-white rounded-lg transition-colors"
              >
                <LogOutIcon className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-800 text-white rounded-lg transition-colors"
              >
                <LogInIcon className="h-5 w-5" />
                <span>Sign In</span>
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile navigation dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-700">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (window.location.pathname === '/') {
                    const favoritesSection = document.getElementById('favorites-section');
                    favoritesSection?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    router.push('/#favorites-section');
                  }
                }}
                className="flex items-center space-x-2 hover:text-purple-400 transition-colors text-left"
              >
                <Heart className="h-5 w-5" />
                <span>My Favorites</span>
              </button>
              
              <Link 
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-2 hover:text-purple-400 transition-colors"
              >
                <Info className="h-5 w-5" />
                <span>About</span>
              </Link>

              <div className="pt-2 border-t border-gray-700">
                {user ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-800 text-white rounded-lg transition-colors w-full"
                  >
                    <LogOutIcon className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/login');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-800 text-white rounded-lg transition-colors w-full"
                  >
                    <LogInIcon className="h-5 w-5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};