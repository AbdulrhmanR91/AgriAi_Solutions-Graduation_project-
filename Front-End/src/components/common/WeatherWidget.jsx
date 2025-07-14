import { useState, useEffect } from 'react';
import { getWeatherData } from '../../services/weatherService';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  AlertTriangle,
  RefreshCw,
  MapPin,
  TrendingUp,
  AlertCircle,
  Sprout,
  ShieldAlert
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const WeatherWidget = ({ lat = 30.033333, lon = 31.233334, className = '' }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { t, i18n } = useTranslation();
  const getWarningColor = (type) => {
    switch (type) {
      case 'danger': return 'bg-green-100 border-green-300 text-green-800';
      case 'warning': return 'bg-green-50 border-green-200 text-green-700';
      case 'info': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-green-50 border-green-200 text-green-800';
    }
  };
  const getWeatherIcon = (iconCode) => {
    if (iconCode?.includes('01')) return <Sun className="w-8 h-8 text-green-500" />;
    if (iconCode?.includes('02') || iconCode?.includes('03')) return <Cloud className="w-8 h-8 text-green-600" />;
    if (iconCode?.includes('09') || iconCode?.includes('10')) return <CloudRain className="w-8 h-8 text-green-700" />;
    return <Sun className="w-8 h-8 text-green-500" />;
  };

  const generateAgricultureWarnings = (current) => {
    const warnings = [];

    if (current.temperature > 35) {
      warnings.push({
        type: 'danger',
        icon: <AlertTriangle className="w-5 h-5" />,
        title: t('weather.high_temp_warning'),
        message: i18n.language === 'ar' 
          ? t('weather.high_temp_advice')
          : t('weather.high_temp_advice')
      });
    }

    if (current.temperature < 5) {
      warnings.push({
        type: 'warning',
        icon: <AlertCircle className="w-5 h-5" />,
        title: t('weather.low_temp_warning'),
        message: i18n.language === 'ar'
          ? t('weather.low_temp_advice')
          : t('weather.low_temp_advice')
      });
    }

    if (current.humidity > 85) {
      warnings.push({
        type: 'warning',
        icon: <Droplets className="w-5 h-5" />,
        title: t('weather.high_humidity_warning'),
        message: i18n.language === 'ar'
          ? t('weather.high_humidity_advice')
          : t('weather.high_humidity_advice')
      });
    }

    if (current.windSpeed > 25) {
      warnings.push({
        type: 'warning',
        icon: <Wind className="w-5 h-5" />,
        title: t('weather.high_wind_warning'),
        message: i18n.language === 'ar'
          ? t('weather.high_wind_advice')
          : t('weather.high_wind_advice')
      });
    }

    if (current.temperature >= 18 && current.temperature <= 28 && current.humidity <= 70) {
      warnings.push({
        type: 'info',
        icon: <Sprout className="w-5 h-5" />,
        title: t('weather.perfect_growing_weather'),
        message: t('weather.ideal_planting_conditions')
      });
    }

    return warnings;
  }; 
  const fetchWeatherData = async () => {
    try {
      setRefreshing(true);
      const data = await getWeatherData(lat, lon);
      if (data.success) {
        setWeatherData(data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch weather data');
      }
    } catch (err) {
      console.error('فشل في تحميل الطقس:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 600000);
    return () => clearInterval(interval);
  }, [lat, lon]); 
  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-6 shadow-xl border border-green-200/50 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-green-200 rounded w-32"></div>
              <div className="h-3 bg-green-100 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-green-100 rounded-2xl"></div>
            <div className="h-16 bg-green-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={`bg-gradient-to-br from-red-50 to-rose-100 rounded-3xl p-6 shadow-xl border border-red-200/50 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-green-800 mb-2">
            {t('weather.error_loading')}
          </h3>
          <p className="text-green-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchWeatherData}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('weather.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData || !weatherData.current) {
    return null;
  }

  const { current, forecast } = weatherData;
  const warnings = generateAgricultureWarnings(current);
  return (
    <div className={`bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-200/40 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 border-b border-green-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
              {getWeatherIcon(current.icon)}
            </div>            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-500" />
                {current.cityName || t('weather.weather_location')}
              </h3>
              <p className="text-gray-500 text-sm">
                {current.description} • {new Date().toLocaleDateString(i18n.language)}
              </p>
            </div>
          </div>          <button
            onClick={fetchWeatherData}            disabled={refreshing}
            className="p-2 text-green-500 hover:text-green-600 transition-colors hover:bg-green-50 rounded-lg"
            title={t('weather.refresh')}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button            onClick={() => setExpanded(!expanded)}
            className="p-2 text-green-500 hover:text-green-600 transition-colors hover:bg-green-50 rounded-lg"
            title={expanded ? t('weather.hide_details') : t('weather.show_details')}
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-500 font-medium">{t('weather.temperature')}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{current.temperature}°</div>
            <div className="text-xs text-gray-500">
              {t('weather.feels_like')} {current.feelsLike}°
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500 font-medium">{t('weather.humidity')}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{current.humidity}%</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Wind className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500 font-medium">{t('weather.wind_speed')}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{current.windSpeed}</div>
            <div className="text-xs text-gray-500">كم/س</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500 font-medium">{t('weather.visibility')}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{current.visibility}</div>
            <div className="text-xs text-gray-500">كم</div>
          </div>
        </div>      
        {warnings.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              {t('weather.agriculture_recommendations')}
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                {warnings.length}
              </span>
            </h4>
            <div className="space-y-3">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border-2 ${getWarningColor(warning.type)} backdrop-blur-sm transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-white/50 backdrop-blur-sm">
                      {warning.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold mb-2 flex items-center justify-between">
                        {warning.title}
                        {warning.type === 'danger' && <span className="text-red-600 text-xs">🔴 عاجل</span>}
                        {warning.type === 'warning' && <span className="text-yellow-600 text-xs">⚠️ تنبيه</span>}
                        {warning.type === 'info' && <span className="text-green-600 text-xs">✅ مثالي</span>}
                      </h5>
                      <p className="text-sm leading-relaxed">{warning.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {forecast && forecast.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              {t('weather.forecast')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {forecast.slice(0, 5).map((day, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-green-100/50 shadow-sm text-center hover:shadow-md transition-all duration-300 hover:scale-105"
                >
                  <div className="text-xs text-gray-500 mb-2">
                    {index === 0 ? t('weather.today') : 
                     index === 1 ? t('weather.tomorrow') : 
                     new Date(day.date).toLocaleDateString(i18n.language, { weekday: 'short' })}
                  </div>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(day.icon)}
                  </div>
                  <div className="text-sm font-bold text-gray-800">
                    {day.maxTemp}° / {day.minTemp}°
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {day.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 p-6 rounded-2xl border border-green-200/50 shadow-lg">
          <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-500" />
            ملخص الطقس السريع
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">
                الضغط الجوي: <span className="font-medium">{current.pressure} هكتوباسكال</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">
                مدى الرؤية: <span className="font-medium">{current.visibility} كم</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span className="text-gray-600">
                اتجاه الرياح: <span className="font-medium">{current.windDirection}°</span>
              </span>
            </div>            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              <span className="text-gray-600">
                آخر تحديث: <span className="font-medium">{new Date().toLocaleTimeString(i18n.language)}</span>
              </span>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-2xl border border-green-200/50 shadow-lg">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              تفاصيل الطقس المتقدمة
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-600">الحرارة الملموسة</span>
                </div>
                <div className="text-lg font-bold text-gray-800">{current.feelsLike}°م</div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">اتجاه الرياح</span>
                </div>
                <div className="text-lg font-bold text-gray-800">{current.windDirection}°</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">مدى الرؤية</span>
                </div>
                <div className="text-lg font-bold text-gray-800">{current.visibility} كم</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-600">الضغط الجوي</span>
                </div>
                <div className="text-lg font-bold text-gray-800">{current.pressure} هكتوباسكال</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">البلد</span>
                </div>
                <div className="text-lg font-bold text-gray-800">{current.country || 'غير محدد'}</div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600">آخر تحديث</span>
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {new Date(current.timestamp).toLocaleTimeString(i18n.language)}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
              <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <Sprout className="w-4 h-4" />
                نصائح زراعية ذكية
              </h5>
              <div className="text-sm text-green-700 space-y-1">
                {current.temperature >= 15 && current.temperature <= 25 && (
                  <p>• درجة الحرارة مثالية لمعظم المحاصيل</p>
                )}
                {current.humidity >= 40 && current.humidity <= 60 && (
                  <p>• مستوى الرطوبة مثالي للنمو الصحي</p>
                )}
                {current.windSpeed <= 15 && (
                  <p>• الرياح هادئة - وقت مناسب للرش والمعالجة</p>
                )}
                {current.pressure >= 1013 && (
                  <p>• الضغط الجوي مستقر - طقس مناسب للأنشطة الزراعية</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

WeatherWidget.propTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  className: PropTypes.string
};

export default WeatherWidget;


