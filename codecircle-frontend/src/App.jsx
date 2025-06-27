// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Link } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from '../src/pages/HomePage'
import LeaderboardPage from './components/LeaderboardPage';
import AccountPage from './components/AccountPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    // Remove the className={darkMode ? 'dark' : ''} from here
    <Router>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} currentPath={window.location.pathname} />
      <Routes>
        <Route path="/" element={<HomePage darkMode={darkMode} />} />
        <Route path="/leaderboard" element={<LeaderboardPage darkMode={darkMode} />} />
        <Route path="/account" element={<AccountPage darkMode={darkMode} />} />
        <Route path="/analytics" element={<AnalyticsPage darkMode={darkMode} />} />
      </Routes>
    </Router>
  );
}

export default App;