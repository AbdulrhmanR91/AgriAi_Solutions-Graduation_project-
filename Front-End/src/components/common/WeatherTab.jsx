import { useState, useEffect } from 'react';
import { 
  Cloud, 
  Eye,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import WeatherWidget from './WeatherWidget';

const WeatherTab = ({ 
  lat, 
  lon, 
  isOpen, 
  onClose, 
  className = '' 
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const { t } = useTranslation();
  // Hide/show bottom navigation when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      // Hide bottom navigation
      const bottomNav = document.querySelector('.bottom-nav');
      if (bottomNav) {
        bottomNav.classList.add('hidden-for-modal');
      }
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Show bottom navigation
      const bottomNav = document.querySelector('.bottom-nav');
      if (bottomNav) {
        bottomNav.classList.remove('hidden-for-modal');
      }
      // Restore body scroll
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to ensure navigation is shown if component unmounts
    return () => {
      const bottomNav = document.querySelector('.bottom-nav');
      if (bottomNav) {
        bottomNav.classList.remove('hidden-for-modal');
      }
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  // Enhanced close function to ensure bottom nav is shown
  const handleClose = () => {
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
      bottomNav.classList.remove('hidden-for-modal');
    }
    document.body.style.overflow = 'auto';
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={handleClose}
      >
      </div>{/* Weather Tab Modal */}
      <div className={`fixed ${isMaximized ? 'inset-4 bottom-4' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl max-h-[80vh]'} 
        bg-white rounded-3xl shadow-2xl z-[9999] overflow-hidden transition-all duration-300 ${className}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {t('weather.detailed_weather')}
                </h2>
                <p className="text-green-100 text-sm">
                  {t('weather.comprehensive_weather_info')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                title={isMaximized ? t('weather.minimize') : t('weather.maximize')}
              >
                {isMaximized ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
                <button
                onClick={handleClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                title={t('weather.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: isMaximized ? 'calc(100vh - 200px)' : '50vh' }}>
          <div className="p-4">
            <WeatherWidget 
              lat={lat} 
              lon={lon} 
              className="border-0 shadow-none bg-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-green-50/30 p-4 border-t border-gray-200/50 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>{t('weather.real_time_data')}</span>
            </div>
              <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                {t('common.close')}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {t('weather.refresh_data')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

WeatherTab.propTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default WeatherTab;
