import { useEffect, useState } from 'react'
import axios from 'axios'

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY

const Weather = ({ country }) => {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    if (!country.capitalInfo || !country.capitalInfo.latlng) return;
    const [lat, lon] = country.capitalInfo.latlng;
    const url = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
    axios.get(url)
      .then((response) => setWeather(response.data))
      .catch((error) => setWeather(null));
  }, [country]);

  if (!weather) {
    return null
  }

  const weatherIcon = weather.weather[0].icon
  const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`

  return (
    <>
      <h2>Weather in {country.capital}</h2>
      <div>Temperature {weather.main.temp} Celsius</div>
      <img
        src={weatherIconUrl}
        alt={`Weather icon of ${weather.weather[0].description}`}
      />
      <div>Wind {weather.wind.speed} m/s</div>
    </>
  )
}

export default Weather