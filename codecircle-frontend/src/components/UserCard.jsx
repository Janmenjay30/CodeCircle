// src/components/UserCard.js
import React from "react";

function getRecentCount(submissionCalendar, days) {
  if (!submissionCalendar) return 0;
  const now = Math.floor(Date.now() / 1000);
  const since = now - days * 24 * 60 * 60;
  return Object.entries(submissionCalendar)
    .filter(([ts]) => Number(ts) >= since)
    .reduce((sum, [, count]) => sum + count, 0);
}

function UserCard({ user, rank }) {
  const last7d = getRecentCount(user.submissionCalendar, 7);
  const last30d = getRecentCount(user.submissionCalendar, 30);

  const avatarSrc = user.avatar || `https://placehold.co/100x100/1E88E5/FFFFFF?text=${user.username?.charAt(0).toUpperCase() || "U"}`;

  return (
    <div className="relative bg-lightGray dark:bg-darkCard p-6 rounded-xl shadow-md flex flex-col sm:flex-row items-center sm:justify-between border border-charcoal/20 dark:border-white/10 hover:shadow-xl transition-all">
      <div className="absolute -top-3 -left-3 bg-accentBlue text-white text-xl font-bold rounded-full h-10 w-10 flex items-center justify-center border-2 border-white dark:border-darkBackground">
        #{rank}
      </div>

      <div className="flex items-center space-x-4">
        <img
          src={avatarSrc}
          alt={user.username}
          className="w-16 h-16 rounded-full border-2 border-accentBlue object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/100x100/1E88E5/FFFFFF?text=U";
          }}
        />
        <div>
          <h2 className="text-xl font-bold text-charcoal dark:text-white">{user.realName || user.username}</h2>
          {user.ranking && <p className="text-sm text-gray-600 dark:text-gray-400">Global Rank: {user.ranking}</p>}
        </div>
      </div>

      <div className="text-center sm:text-right mt-4 sm:mt-0">
        <p className="text-charcoal dark:text-white">Total Solved: <span className="font-semibold">{user.totalSolved ?? 0}</span></p>
        <p className="text-sm text-green-600 dark:text-green-400">🟢 Easy: <span className="font-semibold">{user.easySolved ?? 0}</span></p>
        <p className="text-sm text-yellow-700 dark:text-yellow-400">🟡 Medium: <span className="font-semibold">{user.mediumSolved ?? 0}</span></p>
        <p className="text-sm text-red-600 dark:text-red-400">🔴 Hard: <span className="font-semibold">{user.hardSolved ?? 0}</span></p>
        <p className="font-bold text-accentBlue mt-2">📈 Last 7 days: {last7d}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">🗓️ Last 30 days: {last30d}</p>
      </div>
    </div>
  );
}

export default React.memo(UserCard);
