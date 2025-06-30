export default function getActivityByHourBuckets(submissionCalendar) {
  const buckets = {
    Morning: 0,     // 5 AM – 12 PM
    Afternoon: 0,   // 12 PM – 5 PM
    Night: 0,       // 5 PM – 2 AM
    LateNight: 0    // 2 AM – 5 AM
  };

  if (!submissionCalendar) return buckets;

  for (const [ts, count] of Object.entries(submissionCalendar)) {
    const date = new Date(Number(ts) * 1000);
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      buckets.Morning += Number(count);
    } else if (hour >= 12 && hour < 17) {
      buckets.Afternoon += Number(count);
    } else if ((hour >= 17 && hour <= 23) || (hour >= 0 && hour < 2)) {
      buckets.Night += Number(count);
    } else {
      buckets.LateNight += Number(count);
    }
  }

  return buckets;
}
