// src/utils/getWeekdaySubmissionHistogram.js
export default function getWeekdaySubmissionHistogram(submissionCalendar) {
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts = Array(7).fill(0);

  for (const [ts, count] of Object.entries(submissionCalendar || {})) {
    const date = new Date(Number(ts) * 1000);
    const weekday = date.getDay(); // 0 (Sun) to 6 (Sat)
    counts[weekday] += Number(count);
  }

  return weekdays.map((label, index) => ({ day: label, count: counts[index] }));
}

