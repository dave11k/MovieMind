import React from 'react';
import { FilmIcon, SparklesIcon, LogInIcon, LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
        <div className="flex items-center space-x-2">
          <FilmIcon className="h-8 w-8 text-purple-500" />
          <h1 className="text-2xl font-bold">MovieMind</h1>
          <div className="flex items-center bg-purple-900/50 rounded-full px-3 py-1 text-sm">
            <SparklesIcon className="h-4 w-4 text-purple-400 mr-1" />
            <span className="text-purple-300">AI Powered</span>
          </div>
        </div>
        <nav className="flex items-center space-x-6">
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