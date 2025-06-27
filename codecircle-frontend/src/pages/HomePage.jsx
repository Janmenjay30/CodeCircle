import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const leetcodeApiURL = import.meta.env.VITE_LEETCODE_API_URL || "http://localhost:3000";
const backendURL = import.meta.env.VITE_BACKEND_URL ;

function HomePage({ darkMode }) {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${backendURL}/api/users`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("❌ Failed to load users:", err);
        setMessage('Failed to load users.');
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const fetchAndSaveUser = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage('Please enter a LeetCode username.');
      setMessageType('error');
      return;
    }
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const inputUsername = username.trim().toLowerCase();
      const userExists = users.some(u => typeof u.username === 'string' && u.username.toLowerCase() === inputUsername);

      if (userExists) {
        setMessage(`User '${username.trim()}' already exists.`);
        setMessageType('error');
        setUsername('');
        return;
      }

      const leetcodeApiRes = await fetch(`${leetcodeApiURL}/userProfile/${username.trim()}`);
      if (!leetcodeApiRes.ok) throw new Error("Failed to fetch user data.");

      let data = await leetcodeApiRes.json();
      if (!data.username) data.username = username.trim();

      const saveRes = await fetch(`${backendURL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!saveRes.ok) throw new Error("Failed to save user.");

      const savedUser = await saveRes.json();
      setUsers((prev) => [...prev, savedUser]);
      setUsername("");
      setMessage(`User '${savedUser.username}' added!`);
      setMessageType('success');

    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const sortedTopUsers = [...users].sort(
    (a, b) => {
      const now = Math.floor(Date.now() / 1000);
      const since = now - 7 * 24 * 60 * 60;
      const getCount = (calendar) => Object.entries(calendar || {}).filter(([ts]) => Number(ts) >= since).reduce((sum, [, c]) => sum + c, 0);
      return getCount(b.submissionCalendar) - getCount(a.submissionCalendar);
    }
  ).slice(0, 3);

  return (
    <div className="pt-20 min-h-screen bg-[#F2F2F2] dark:bg-[#000] text-black dark:text-[#EAE4D5]">
      <header className="text-center px-4">
        <h1 className="text-5xl font-extrabold">CodeCircle</h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-400">Track. Compete. Improve your coding skills together.</p>
      </header>

      {message && (
        <div className={`mt-6 text-center px-4 py-3 rounded shadow font-medium max-w-md mx-auto ${messageType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{message}</div>
      )}

      <main className="mt-10 px-6 max-w-md mx-auto">
        <form onSubmit={fetchAndSaveUser} className="space-y-4">
          <input
            type="text"
            placeholder="Enter LeetCode username"
            className="w-full px-4 py-3 rounded-md bg-white dark:bg-[#1e1e1e] border border-gray-400 dark:border-gray-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">
            {isLoading ? 'Adding...' : 'Add to Leaderboard'}
          </button>
        </form>
      </main>

      <section className="mt-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Top Coders This Week</h2>
        <ul className="space-y-3">
          {sortedTopUsers.map((user, i) => (
            <li key={user.username} className="flex justify-between items-center p-4 bg-white dark:bg-[#1e1e1e] rounded-md shadow">
              <div className="text-lg font-semibold">
                {user.realName || user.username} {i === 0 && <span className="ml-2 text-sm bg-green-600 text-white px-2 py-0.5 rounded">🔥 Top Solver</span>}
              </div>
              <div className="text-sm text-right">
                <div>Rank: #{user.ranking || 'N/A'}</div>
                <div>7-day solved: {Object.entries(user.submissionCalendar || {}).filter(([ts]) => Number(ts) >= (Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60)).reduce((sum, [, c]) => sum + c, 0)}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="text-center mt-4">
          <Link to="/leaderboard" className="text-blue-600 hover:underline text-sm">👉 View Full Leaderboard</Link>
        </div>
      </section>

      <section className="mt-16 max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-3">📅 Upcoming Contests</h2>
        <ul className="text-gray-700 dark:text-gray-300 space-y-2">
          <li>🟢 LeetCode Weekly Contest 405 – Sunday, 10:30 AM IST</li>
          <li>🟣 LeetCode Biweekly Contest 122 – Saturday, 8:00 PM IST</li>
          <li>🔵 Codeforces Round #937 – Wednesday, 6:00 PM IST</li>
        </ul>
      </section>

      <footer className="mt-20 text-center text-sm text-gray-500 dark:text-gray-400 pb-8">
        <p>&copy; {new Date().getFullYear()} CodeCircle. Built with ❤️ for coders.</p>
      </footer>
    </div>
  );
}

export default HomePage;
