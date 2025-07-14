import express from 'express';
import axios from 'axios';
const router = express.Router();

const WEATHER_API_KEY = '7f4f4286217da35b910d75cbe52f2b1c';
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

router.get('/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;

    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${WEATHER_API_BASE}/weather`, {
        params: { lat, lon, appid: WEATHER_API_KEY, units: 'metric', lang: 'ar' }
      }),
      axios.get(`${WEATHER_API_BASE}/forecast`, {
        params: { lat, lon, appid: WEATHER_API_KEY, units: 'metric', lang: 'ar' }
      })
    ]);

    const current = currentRes.data;
    const forecastList = forecastRes.data.list;

    const currentData = {
      temperature: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      pressure: current.main.pressure,
      windSpeed: current.wind ? Math.round(current.wind.speed * 10) / 10 : 0,
      windDirection: current.wind?.deg || 0,
      visibility: Math.round((current.visibility ?? 10000) / 1000),
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      cityName: current.name,
      country: current.sys.country,
      timestamp: new Date().toISOString()
    };

    const daily = {};
    forecastList.forEach(item => {
      const dateKey = new Date(item.dt * 1000).toDateString();
      if (!daily[dateKey]) {
        daily[dateKey] = {
          date: item.dt_txt.split(' ')[0],
          temps: [],
          descriptions: [],
          icons: []
        };
      }
      daily[dateKey].temps.push(item.main.temp);
      daily[dateKey].descriptions.push(item.weather[0].description);
      daily[dateKey].icons.push(item.weather[0].icon);
    });

    const forecastData = Object.values(daily).slice(0, 5).map(day => ({
      date: day.date,
      minTemp: Math.round(Math.min(...day.temps)),
      maxTemp: Math.round(Math.max(...day.temps)),
      description: day.descriptions[0],
      icon: day.icons[0]
    }));

    res.json({
      success: true,
      current: currentData,
      forecast: forecastData
    });
  } catch (err) {
    console.error('Weather API Error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: err.message
    });
  }
});

export default router;
