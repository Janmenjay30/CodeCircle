// src/pages/AnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../pages/heatmap-theme.css';
import dayjs from 'dayjs';

import getWeekdaySubmissionHistogram from '../utills/getWeekDaySubmissionHistogram';
import getCumulativeChartData from '../utills/getCumulativeChartData';

const backendURL = import.meta.env.VITE_BACKEND_URL ;

const AnalyticsPage = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userData, setUserData] = useState([]);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
 

  useEffect(() => {
    fetchUserData();
  }, [selectedUsers]);

  const fetchUserData = async () => {
    if (selectedUsers.length === 0) return;
    try {
      const usernames = selectedUsers.map(u => u.value).join(',');
      const res = await fetch(`${backendURL}/api/users?usernames=${encodeURIComponent(usernames)}`);
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  const loadOptions = async (inputValue) => {
    try {
      const res = await fetch(`${backendURL}/api/users`);
      const data = await res.json();
      return data
        .filter(u => u.username.toLowerCase().includes(inputValue.toLowerCase()))
        .map(u => ({ label: u.username, value: u.username }));
    } catch (err) {
      console.error("Failed to load usernames", err);
      return [];
    }
  };

  const difficultyColors = ['#66bb6a', '#ffa726', '#ef5350'];

  const barChartData = userData.map(user => ({
    username: user.username,
    "7d": Object.entries(user.submissionCalendar || {}).reduce((acc, [ts, count]) => {
      const now = Date.now() / 1000;
      if (Number(ts) >= now - 7 * 24 * 60 * 60) acc += Number(count);
      return acc;
    }, 0),
    "30d": Object.entries(user.submissionCalendar || {}).reduce((acc, [ts, count]) => {
      const now = Date.now() / 1000;
      if (Number(ts) >= now - 30 * 24 * 60 * 60) acc += Number(count);
      return acc;
    }, 0),
  }));

  const calculateStreaks = (submissionCalendar) => {
    const submissionDays = new Set(
      Object.keys(submissionCalendar || {}).map(ts =>
        new Date(Number(ts) * 1000).toISOString().split("T")[0]
      )
    );

    const today = new Date();
    let currentStreak = 0, longestStreak = 0, tempStreak = 0;
    let totalInactiveDays = 0, inactiveDays = null;
    let foundLastSubmission = false;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (submissionDays.has(dateStr)) {
        if (!foundLastSubmission) {
          inactiveDays = i;
          foundLastSubmission = true;
        }
        tempStreak += 1;
        if (i === 0) currentStreak = tempStreak;
      } else {
        totalInactiveDays += 1;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      inactiveDays: inactiveDays ?? 365,
      totalInactiveDays
    };
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] dark:bg-black text-black dark:text-white py-20 px-4 sm:px-8">
      <h1 className="text-4xl font-bold text-center mb-8">📊 Compare Analytics</h1>

      <div className="max-w-xl mx-auto mb-6">
        <AsyncSelect
          isMulti
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onChange={(options) => {
            if (options.length <= 3) setSelectedUsers(options);
          }}
          placeholder="Search and select up to 3 users"
          className="text-black dark:text-white"
          classNamePrefix="select"
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: darkMode ? '#1a1a1a' : '#fff',
              borderColor: darkMode ? '#444' : '#ccc',
              color: darkMode ? '#fff' : '#000',
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: darkMode ? '#1a1a1a' : '#fff',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused
                ? darkMode ? '#333' : '#f0f0f0'
                : 'transparent',
              color: darkMode ? '#fff' : '#000',
            }),
          }}
        />
      </div>

      {userData.length > 0 && (
        <div className="space-y-12">
          {/* Bar Chart */}
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="username" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="7d" fill="#1E88E5" />
                <Bar dataKey="30d" fill="#E91E63" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="flex flex-wrap justify-center gap-12">
            {userData.map((user, idx) => {
              const pieData = [
                { name: 'Easy', value: user.easySolved || 0 },
                { name: 'Medium', value: user.mediumSolved || 0 },
                { name: 'Hard', value: user.hardSolved || 0 },
              ];
              return (
                <div key={user.username} className="w-72 text-center">
                  <h3 className="mb-4 font-semibold text-lg">{user.username}'s Difficulty Distribution</h3>
                  <PieChart width={250} height={250}>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={difficultyColors[i % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>
              );
            })}
          </div>


          {/* Submission Calendar */}
            <div className="grid md:grid-cols-2 gap-10 mt-10">
                  {userData.map((user) => {
                    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

                    return (
                      <div
                        key={user.username}
                        className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md p-6"
                      >
                        <h3 className="text-lg font-semibold mb-4">
                          📅 {user.username}'s Submission Calendar
                        </h3>
                        <CalendarHeatmap
                          startDate={startDate}
                          endDate={new Date()}
                          values={Object.entries(user.submissionCalendar || {}).map(
                            ([ts, count]) => ({
                              date: new Date(Number(ts) * 1000),
                              count: Number(count),
                            })
                          )}
                          classForValue={(value) => {
                            if (!value || value.count === 0) return 'heatmap-empty';
                            if (value.count < 2) return 'heatmap-1';
                            if (value.count < 5) return 'heatmap-2';
                            if (value.count < 10) return 'heatmap-3';
                            return 'heatmap-4';
                          }}
                          tooltipDataAttrs={(value) => ({
                            'data-tip':
                              value && value.date
                                ? `${value.date.toDateString()}: ${value.count} submissions`
                                : 'No submissions',
                          })}
                          showWeekdayLabels
                        />
                      </div>
                    );
                  })}
                </div>





          {/* Streak Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {userData.map((user) => {
              const { currentStreak, longestStreak, inactiveDays, totalInactiveDays } = calculateStreaks(user.submissionCalendar);
              return (
                <div key={user.username} className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">🔥 {user.username}'s Streaks</h3>
                  <ul className="space-y-2 text-base text-black dark:text-white">
                    <li><strong>Current Streak:</strong> {currentStreak} day{currentStreak !== 1 && 's'}</li>
                    <li><strong>Longest Streak:</strong> {longestStreak} day{longestStreak !== 1 && 's'}</li>
                    <li><strong>Inactive For:</strong> {inactiveDays === 0 ? 'Active today 🎉' : `${inactiveDays} day${inactiveDays !== 1 ? 's' : ''}`}</li>
                    <li><strong>Total Inactive Days (last 365 days):</strong> {totalInactiveDays}</li>
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Weekday Submission Chart */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-6">📆 Submissions by Weekday</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.map((user) => {
                const data = getWeekdaySubmissionHistogram(user.submissionCalendar);
                return (
                  <div key={user.username} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-4 text-center">{user.username}</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#1E88E5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cumulative Submissions */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-6">📈 Cumulative Submissions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={getCumulativeChartData(userData)}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format("MMM YY")} />
                <YAxis />
                <Tooltip />
                <Legend />
                {userData.map((user, index) => (
                  <Line
                    key={user.username}
                    type="monotone"
                    dataKey={user.username}
                    stroke={["#1E88E5", "#E91E63", "#43A047"][index % 3]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
