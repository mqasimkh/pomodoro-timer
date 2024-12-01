import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RefreshCw, Sun, Moon } from 'lucide-react';

const PomodoroTimer = () => {
  const [time, setTime] = useState(25 * 60); // Default 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [startTime, setStartTime] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Preset durations (added 5 minutes)
  const durations = [5, 15, 25];

  // Load theme and timer state from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedTimer = JSON.parse(localStorage.getItem('timerState'));

    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    if (savedTimer) {
      const { savedTime, savedIsRunning, savedStartTime, savedDuration } = savedTimer;
      setTime(savedTime);
      setSelectedDuration(savedDuration);
      setIsRunning(savedIsRunning);
      setStartTime(savedStartTime);
    }
  }, []);

  // Save timer state to localStorage whenever relevant state changes
  useEffect(() => {
    const timerState = {
      savedTime: time,
      savedIsRunning: isRunning,
      savedStartTime: startTime,
      savedDuration: selectedDuration,
    };
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [time, isRunning, startTime, selectedDuration]);

  // Timer logic
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsedTime = Math.floor((now - startTime) / 1000);
      const newTime = Math.max(selectedDuration * 60 - elapsedTime, 0);

      setTime(newTime);
      document.title = `${formatTime(newTime)} - Pomodoro Timer`;

      if (newTime === 0) {
        clearInterval(intervalId);
        setIsRunning(false);
        document.title = 'Pomodoro Timer';
        sendNotification("Pomodoro complete! Time for a break.");
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, startTime, selectedDuration]);

  // Notification logic
  const sendNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: message,
        icon: 'https://via.placeholder.com/48', // Replace with your app icon URL
      });
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Pomodoro Timer', {
            body: message,
            icon: 'https://via.placeholder.com/48',
          });
        } else {
          console.warn('Notification permission denied.');
        }
      });
    }
  };

  // Request notification permissions on app load
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch((err) =>
        console.error('Notification permission request failed:', err)
      );
    }
  }, []);

  // Format time to MM:SS
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start/Pause timer
  const toggleTimer = () => {
    if (!isRunning) {
      setStartTime(Date.now() - (selectedDuration * 60 - time) * 1000);
    }
    setIsRunning((prev) => !prev);
  };

  // Reset timer
  const resetTimer = () => {
    setTime(selectedDuration * 60);
    setIsRunning(false);
    document.title = 'Pomodoro Timer';
  };

  // Select duration
  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
    setTime(duration * 60);
    setIsRunning(false);
  };

  // Theme toggle
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  // Calculate progress percentage
  const progressPercentage =
    ((selectedDuration * 60 - time) / (selectedDuration * 60)) * 100;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-black'
      }`}
    >
      <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Timer className={`mr-2 ${isDarkMode ? 'text-white' : 'text-black'}`} size={32} />
            <h1 className="text-2xl font-bold">Pomodoro Timer</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full transition-all hover:bg-white/30"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Duration Selector */}
        <div className="flex justify-center space-x-4 mb-6">
          {durations.map((duration) => (
            <button
              key={duration}
              onClick={() => handleDurationSelect(duration)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                selectedDuration === duration
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {duration} min
            </button>
          ))}
        </div>

        {/* Timer Container */}
        <div className="relative w-full aspect-square flex items-center justify-center">
          {/* Progress Ring */}
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - progressPercentage * 2.83}
              transform="rotate(-90 50 50)"
            />
          </svg>

          {/* Time Display */}
          <div className="z-10 text-6xl font-bold">{formatTime(time)}</div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-6 mt-6">
          <button
            onClick={toggleTimer}
            className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-all"
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={resetTimer}
            className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-all"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 text-sm text-white">
        Built by{' '}
        <a
          href="https://github.com/mqasimkh"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/75 transition-colors"
        >
          Muhammad Qasim
        </a>
      </div>
    </div>
  );
};

export default PomodoroTimer;
