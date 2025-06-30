// src/utils/getCumulativeSubmissions.js
export default function getCumulativeSubmissions(submissionCalendar) {
  const sorted = Object.entries(submissionCalendar || {})
    .map(([ts, count]) => ({
      date: new Date(Number(ts) * 1000),
      count: Number(count),
    }))
    .sort((a, b) => a.date - b.date);

  const map = new Map();
  for (const { date, count } of sorted) {
    const dateStr = date.toISOString().split('T')[0];
    map.set(dateStr, (map.get(dateStr) || 0) + count);
  }

  const cumulative = [];
  let total = 0;

  for (const [dateStr, count] of map) {
    total += count;
    const date = new Date(dateStr);
    const label = date.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }); // eg: "Oct '24"
    cumulative.push({ label, total });
  }

  return cumulative;
}
