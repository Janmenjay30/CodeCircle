// src/utils/getCumulativeChartData.js

export default function getCumulativeChartData(users) {
  const dateCountsMap = {}; // { username: { [date]: count } }

  // Step 1: Build date → count map for each user
  users.forEach(user => {
    const submissionCalendar = user.submissionCalendar || {};
    const sorted = Object.entries(submissionCalendar)
      .map(([ts, count]) => ({
        dateStr: new Date(Number(ts) * 1000).toISOString().split('T')[0],
        count: Number(count),
      }))
      .sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr));

    dateCountsMap[user.username] = {};

    sorted.forEach(({ dateStr, count }) => {
      dateCountsMap[user.username][dateStr] =
        (dateCountsMap[user.username][dateStr] || 0) + count;
    });
  });

  // Step 2: Get all unique dates across users
  const allDates = new Set();
  Object.values(dateCountsMap).forEach(userMap => {
    Object.keys(userMap).forEach(date => allDates.add(date));
  });

  const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

  // Step 3: Build cumulative totals for each user
  const cumulativeTotals = {};
  const finalData = [];

  sortedDates.forEach(date => {
    const entry = { date };

    users.forEach(user => {
      const name = user.username;
      if (!(name in cumulativeTotals)) cumulativeTotals[name] = 0;
      const todayCount = dateCountsMap[name]?.[date] || 0;
      cumulativeTotals[name] += todayCount;
      entry[name] = cumulativeTotals[name];
    });

    finalData.push(entry);
  });

  return finalData; // [{ date: "2024-07-01", user1: 10, user2: 8 }, ...]
}
