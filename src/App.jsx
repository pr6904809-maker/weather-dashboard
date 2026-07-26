import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('Delhi');
  const [searchQuery, setSearchQuery] = useState('Delhi');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  useEffect(() => {
    if (!searchQuery) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchWeather = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${searchQuery}&units=metric&appid=${API_KEY}`,
          { signal }
        );

        if (!response.ok) {
          throw new Error('City not found or API error!');
        }

        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setWeatherData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    const intervalId = setInterval(() => {
      fetchWeather();
    }, 60000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim() !== '') {
      setSearchQuery(city);
    }
  };

  return (
    <div className="app-container">
      <h1>🌦️ Weather Dashboard</h1>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Get Weather</button>
      </form>

      {loading && <p className="status-msg">Loading weather data...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && weatherData && (
        <div className="weather-card">
          <h2>{weatherData.name}, {weatherData.sys?.country}</h2>
          <div className="temp">{Math.round(weatherData.main?.temp)}°C</div>
          <p className="condition">{weatherData.weather[0]?.description}</p>
          
          <div className="details-grid">
            <div className="detail-item">
              <span>Humidity</span>
              <strong>{weatherData.main?.humidity}%</strong>
            </div>
            <div className="detail-item">
              <span>Wind Speed</span>
              <strong>{weatherData.wind?.speed} m/s</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;