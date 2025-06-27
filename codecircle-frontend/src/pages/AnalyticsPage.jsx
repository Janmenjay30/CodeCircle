// src/pages/AnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../pages/heatmap-theme.css';

const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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

  const COLORS = ['#1E88E5', '#43A047', '#FB8C00'];
  const difficultyColors = ['#66bb6a', '#ffa726', '#ef5350'];

  // Bar Chart Data
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

          {/* Heatmap Calendar */}
          <div className="grid md:grid-cols-2 gap-10 mt-10">
            {userData.map((user, idx) => (
              <div key={user.username} className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">📅 {user.username}'s Submission Calendar</h3>
                <CalendarHeatmap
                  startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                  endDate={new Date()}
                  values={Object.entries(user.submissionCalendar || {}).map(([ts, count]) => ({
                    date: new Date(Number(ts) * 1000),
                    count: Number(count),
                  }))}
                  classForValue={(value) => {
                    if (!value || value.count === 0) return 'heatmap-empty';
                    if (value.count < 2) return 'heatmap-1';
                    if (value.count < 5) return 'heatmap-2';
                    if (value.count < 10) return 'heatmap-3';
                    return 'heatmap-4';
                  }}
                  tooltipDataAttrs={(value) => ({
                    'data-tip': value && value.date
                      ? `${value.date.toDateString()}: ${value.count} submissions`
                      : 'No submissions',
                  })}
                  showWeekdayLabels
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
    