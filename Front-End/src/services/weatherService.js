import axios from 'axios';

const baseUrl ='http://localhost:5000/api/weather';

export async function getWeatherData(lat, lon) {
  try {
    const response = await axios.get(`${baseUrl}/${lat}/${lon}`);
    return response.data;
  } catch (error) {
    console.error("خطأ في جلب بيانات الطقس:", error);
    throw error;
  }
}
