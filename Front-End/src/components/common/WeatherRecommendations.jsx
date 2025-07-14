import { useState, useEffect } from 'react';
import { getWeatherData } from '../../services/weatherService';
import { 
  AlertTriangle,
  AlertCircle,
  Droplets,
  Wind,
  Sprout,
  ShieldAlert,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const WeatherRecommendations = ({ 
  lat = 30.033333, 
  lon = 31.233334, 
  className = '',
  onViewDetails = null,
  showViewMoreButton = true 
}) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

  // دالة لتحديد لون التحذير
  const getWarningColor = (type) => {
    switch (type) {
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  // دالة لتوليد التحذيرات الزراعية
  const generateAgricultureWarnings = (current) => {
    const warnings = [];

    // تحذير درجة الحرارة المرتفعة
    if (current.temperature > 35) {
      warnings.push({
        type: 'danger',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: t('weather.high_temp_warning'),
        message: t('weather.high_temp_advice'),
        priority: 1
      });
    }

    // تحذير درجة الحرارة المنخفضة
    if (current.temperature < 5) {
      warnings.push({
        type: 'warning',
        icon: <AlertCircle className="w-4 h-4" />,
        title: t('weather.low_temp_warning'),
        message: t('weather.low_temp_advice'),
        priority: 2
      });
    }

    // تحذير الرطوبة المرتفعة
    if (current.humidity > 85) {
      warnings.push({
        type: 'warning',
        icon: <Droplets className="w-4 h-4" />,
        title: t('weather.high_humidity_warning'),
        message: t('weather.high_humidity_advice'),
        priority: 3
      });
    }

    // تحذير الرياح القوية
    if (current.windSpeed > 25) {
      warnings.push({
        type: 'warning',
        icon: <Wind className="w-4 h-4" />,
        title: t('weather.high_wind_warning'),
        message: t('weather.high_wind_advice'),
        priority: 4
      });
    }

    // نصائح عامة للطقس المثالي
    if (current.temperature >= 18 && current.temperature <= 28 && current.humidity <= 70) {
      warnings.push({
        type: 'info',
        icon: <Sprout className="w-4 h-4" />,
        title: t('weather.perfect_growing_weather'),
        message: t('weather.ideal_planting_conditions'),
        priority: 5
      });
    }

    // ترتيب التحذيرات حسب الأولوية
    return warnings.sort((a, b) => a.priority - b.priority);
  };

  // دالة لتحديث البيانات
  const fetchWeatherData = async () => {
    try {
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
    }
  };
  useEffect(() => {
    fetchWeatherData();
    // تحديث البيانات كل 15 دقيقة
    const interval = setInterval(fetchWeatherData, 900000);
    return () => clearInterval(interval);
  }, [lat, lon]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-4 shadow-lg border border-green-200/50 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-200 rounded-full"></div>
            <div className="space-y-1">
              <div className="h-4 bg-green-200 rounded w-32"></div>
              <div className="h-3 bg-green-100 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-12 bg-green-100 rounded-lg"></div>
            <div className="h-8 bg-green-50 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl p-4 shadow-lg border border-red-200/50 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-red-800 mb-1">
            {t('weather.error_loading')}
          </h3>
          <p className="text-red-600 text-xs mb-3">{error}</p>
          <button
            onClick={fetchWeatherData}
            className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            {t('weather.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData || !weatherData.current) {
    return null;
  }

  const { current } = weatherData;
  const warnings = generateAgricultureWarnings(current);

  return (
    <div className={`bg-gradient-to-br from-white via-green-50/50 to-emerald-50/30 backdrop-blur-lg rounded-2xl shadow-lg border border-green-200/40 overflow-hidden mb-4 sm:mb-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 border-b border-green-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {t('weather.agriculture_recommendations')}
              </h3>
              <p className="text-gray-500 text-xs">
                {current.temperature}° • {current.description}
              </p>
            </div>
          </div>
          {warnings.length > 0 && (
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
              {warnings.length}
            </span>
          )}
        </div>
      </div>

      {/* التوصيات */}
      <div className="p-4 pb-6 sm:pb-4">
        {warnings.length > 0 ? (
          <div className="space-y-3">
            {warnings.slice(0, 3).map((warning, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border-2 ${getWarningColor(warning.type)} backdrop-blur-sm transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-white/60 backdrop-blur-sm">
                    {warning.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm mb-1 flex items-center justify-between">
                      <span className="truncate">{warning.title}</span>
                      {warning.type === 'danger' && <span className="text-red-600 text-xs ml-2">🔴</span>}
                      {warning.type === 'warning' && <span className="text-yellow-600 text-xs ml-2">⚠️</span>}
                      {warning.type === 'info' && <span className="text-green-600 text-xs ml-2">✅</span>}
                    </h5>
                    <p className="text-xs leading-relaxed">{warning.message}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {warnings.length > 3 && (
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  +{warnings.length - 3} {t('weather.more_recommendations')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Sprout className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h4 className="font-bold text-green-800 mb-1">
              {t('weather.perfect_conditions')}
            </h4>
            <p className="text-green-600 text-sm">
              {t('weather.no_warnings_today')}
            </p>
          </div>
        )}        {/* أزرار العمل */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-green-200/50 mb-2 sm:mb-0">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>آخر تحديث: {new Date().toLocaleTimeString(i18n.language)}</span>
          </div>
          
          {showViewMoreButton && (
            <button
              onClick={onViewDetails}
              className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
            >
              <Eye className="w-3 h-3" />
              {t('weather.view_details')}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* ملخص سريع */}
        <div className="mt-3 p-3 bg-gradient-to-r from-green-100/50 to-emerald-100/50 rounded-lg border border-green-200/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                {current.temperature}°
              </span>
              <span className="text-gray-600">
                <Droplets className="w-3 h-3 inline mr-1" />
                {current.humidity}%
              </span>
              <span className="text-gray-600">
                <Wind className="w-3 h-3 inline mr-1" />
                {current.windSpeed} كم/س
              </span>
            </div>
            <div className="text-green-600 font-medium">
              {current.cityName || t('weather.current_location')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

WeatherRecommendations.propTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  className: PropTypes.string,
  onViewDetails: PropTypes.func,
  showViewMoreButton: PropTypes.bool
};

export default WeatherRecommendations;
