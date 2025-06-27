// src/components/Leaderboard.js
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';


function getRecentCount(submissionCalendar, days) {
  if (!submissionCalendar) return 0;
  const now = Math.floor(Date.now() / 1000);
  const since = now - days * 24 * 60 * 60;
  return Object.entries(submissionCalendar)
    .filter(([ts]) => Number(ts) >= since)
    .reduce((sum, [, count]) => sum + count, 0);
}

function Leaderboard({ users }) {
  const [sortType, setSortType] = useState("7d");
  const [expandedUser, setExpandedUser] = useState(null);

  const sortUsers = (a, b) => {
    if (sortType === "30d") {
      return getRecentCount(b.submissionCalendar, 30) - getRecentCount(a.submissionCalendar, 30);
    }
    return getRecentCount(b.submissionCalendar, 7) - getRecentCount(a.submissionCalendar, 7);
  };

  const sorted = [...users].sort(sortUsers);

  return (
    <div className="bg-[#EAE4D5] dark:bg-[#1a1a1a] p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-black dark:text-[#EAE4D5]">Leaderboard</h2>
        <select
          className="bg-white dark:bg-[#333] text-black dark:text-[#EAE4D5] px-3 py-1 border border-gray-300 dark:border-gray-600 rounded"
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-gray-400 dark:border-gray-600">
              <th className="px-4 py-2 text-sm font-semibold text-black dark:text-[#EAE4D5]">#</th>
              <th className="px-4 py-2 text-sm font-semibold text-black dark:text-[#EAE4D5]">Name</th>
              <th className="px-4 py-2 text-sm font-semibold text-black dark:text-[#EAE4D5]">Global Rank</th>
              <th className="px-4 py-2 text-sm font-semibold text-black dark:text-[#EAE4D5]">
                {sortType === "30d" ? "Last 30 Days" : "Last 7 Days"}
              </th>
            </tr>
          </thead>
          <tbody className="transition-opacity duration-300 ease-in-out">
            <AnimatePresence>
              {sorted.map((user, index) => {
                const recentSolved = getRecentCount(user.submissionCalendar, sortType === "30d" ? 30 : 7);
                const isExpanded = expandedUser === user.username;

                return (
                  <React.Fragment key={user.username}>
                    <motion.tr
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-[#f2f2f2] dark:hover:bg-[#2a2a2a] transition-shadow duration-300 hover:shadow-md cursor-pointer"
                      onClick={() => setExpandedUser(isExpanded ? null : user.username)}
                    >
                      <td className="px-4 py-2 text-sm text-black dark:text-[#EAE4D5]">{index + 1}</td>
                      <td className="px-4 py-2 text-sm text-blue-800 dark:text-blue-300">
                        {user.realName || user.username}
                      </td>
                      <td className="px-4 py-2 text-sm text-black dark:text-[#EAE4D5]">{user.ranking ?? 'N/A'}</td>
                      <td className="px-4 py-2 text-sm text-black dark:text-[#EAE4D5]">{recentSolved}</td>
                    </motion.tr>

                    {isExpanded && (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td colSpan="4" className="px-4 py-4 bg-gradient-to-br from-[#F2F2F2] to-[#B6B09F] dark:from-[#333] dark:to-[#000] text-black dark:text-[#EAE4D5] rounded-b">
                          <p className="mb-1"><strong>Total Solved:</strong> {user.totalSolved ?? 0}</p>
                          <p className="mb-1 text-green-700 dark:text-green-400"><strong>Easy:</strong> {user.easySolved ?? 0}</p>
                          <p className="mb-1 text-yellow-700 dark:text-yellow-300"><strong>Medium:</strong> {user.mediumSolved ?? 0}</p>
                          <p className="text-red-700 dark:text-red-400"><strong>Hard:</strong> {user.hardSolved ?? 0}</p>
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Leaderboard;