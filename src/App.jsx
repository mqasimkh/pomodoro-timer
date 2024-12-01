import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RefreshCw } from 'lucide-react';

const PomodoroTimer = () => {
  const [time, setTime] = useState(25 * 60); // Default 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [startTime, setStartTime] = useState(null);

  // Preset durations
  const durations = [15, 25, 35, 45];

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
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, startTime, selectedDuration]);

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

  // Calculate progress percentage
  const progressPercentage =
    ((selectedDuration * 60 - time) / (selectedDuration * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <Timer className="text-white mr-2" size={32} />
          <h1 className="text-2xl font-bold text-white">Pomodoro Timer</h1>
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
          <div className="z-10 text-6xl font-bold text-white">
            {formatTime(time)}
          </div>
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
      <div className="absolute bottom-4 right-4 text-white/50 text-sm">
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
