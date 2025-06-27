// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Account', path: '/account' },
    { name: 'Analytics', path: '/analytics' },
  ];

  const isActive = (path) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F2F2F2] dark:bg-black shadow-md border-b border-gray-300 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-xl text-black dark:text-[#EAE4D5]">CodeCircle</h1>
          <ul className="flex gap-4">
            {navItems.map(({ name, path }) => (
              <li key={name}>
                <Link
                  to={path}
                  className={`px-3 py-1.5 rounded-md transition font-medium flex items-center gap-1
                    ${isActive(path)
                      ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-black shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'}`}
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button> */}
      </div>
    </nav>
  );
}

export default Navbar;
