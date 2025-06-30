import { useState, useEffect } from 'react';
import Leaderboard from './Leaderboard';
import React from 'react';

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${backendURL}/api/users`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data);
      // console.log("Data is", data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // fetch immediately on mount

    const interval = setInterval(() => {
      console.log("Refreshing users from backend...");
      fetchUsers(); // fetch every hour
    }, 60 * 60 * 1000); // 1 hour = 3600000 ms

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <div className="min-h-screen pt-20 px-6 bg-[#F2F2F2] dark:bg-[#000] text-black dark:text-[#EAE4D5]">
      <h1 className="text-3xl font-bold mb-6 text-center">Leaderboard</h1>
      {isLoading ? (
        <div className="animate-pulse h-40 bg-gray-300 dark:bg-gray-700 rounded-lg" />
      ) : (
        <Leaderboard users={users} />
      )}
    </div>
  );
}

export default LeaderboardPage;
