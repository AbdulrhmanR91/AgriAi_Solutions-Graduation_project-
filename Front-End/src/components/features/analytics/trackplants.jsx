// filepath: e:\Graduationproject\GraduationProject\refinal\frontend\src\components\features\analytics\trackplants.jsx
import { Link, useNavigate } from 'react-router-dom';
import user from "/src/assets/images/user.png";
import { useState, useEffect } from 'react';
import { getFarmerProfile, getAvailableExperts, getExpertReviews, getImageUrl } from '../../../utils/apiService';
import { Dialog, DialogContent } from '../../shared/ui/dialog.js';
import toast from 'react-hot-toast';
import axios from 'axios';
import PropTypes from 'prop-types';
import { getDiseaseInfo, getTranslatedConditionName } from '../../../utils/diseaseData';
import config from '../../../config/config.js';
import embeddedService from '../../../services/embeddedService';
import { Star, MessageCircle, Zap, Sparkles, Eye, CheckCircle, Leaf, Microscope, Save, Clock, Camera, Upload } from 'lucide-react';
import { Book, Users, AlertCircle, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnalysisSyncService } from '../../../utils/analysisSync';
import WeatherRecommendations from '../../common/WeatherRecommendations';
import WeatherTab from '../../common/WeatherTab';

// Create a singleton instance for the component
const analysisSync = new AnalysisSyncService();

// Enhanced ShareCard with modern design
const ShareCard = ({ resultImageBase64, predictionClass, predictionResult }) => {
  const { t, i18n } = useTranslation();
  
  if (!resultImageBase64 || !predictionClass || !predictionResult) return null;
  
  const conditionDisplayName = getTranslatedConditionName(predictionClass, i18n.language);
  
  const plantDisplayName = conditionDisplayName.includes(' - ') 
    ? conditionDisplayName.split(' - ')[0] 
    : conditionDisplayName.includes('نبات') 
      ? conditionDisplayName.split('نبات ')[1]?.split(' ')[0] || 'Unknown'
      : (predictionClass || '___').split('___')[0]?.replace(/_/g, ' ') || 'Unknown';

  return (
    <div 
      id="share-card" 
      className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-green-200/40" 
      style={{ width: '800px', minHeight: '600px' }}
    >
      <div className="flex flex-col gap-6 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/40 to-emerald-200/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-teal-200/30 rounded-full blur-xl"></div>
        
        {/* Enhanced Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Plant Analysis AI
              </h1>
              <p className="text-gray-500">Advanced Disease Detection Report</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Analysis Date</div>
            <div className="font-semibold text-gray-700">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Plant Analysis Content */}
        <div className="grid grid-cols-2 gap-8 relative z-10">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img 
                src={`data:image/jpeg;base64,${resultImageBase64}`} 
                alt={t('farmer.track_plants.plant_analysis')}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">{t('farmer.track_plants.detected_plant')}</div>
              <div className="font-bold text-xl text-green-600">{plantDisplayName}</div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Microscope className="w-6 h-6 text-green-500" />
                {t('farmer.track_plants.analysis_results')}
              </h2>
              
              <div className="space-y-4">
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-500 font-medium">{t('farmer.track_plants.condition')}</span>
                  </div>
                  <div className="font-bold text-lg text-gray-800">
                    {getTranslatedConditionName(predictionClass, i18n.language)}
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-500 font-medium">{t('farmer.track_plants.confidence')}</span>
                  </div>
                  <div className="font-bold text-lg text-blue-600">{predictionResult.confidence}</div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-500 font-medium">{t('farmer.track_plants.analysis_time')}</span>
                  </div>
                  <div className="font-bold text-lg text-gray-700">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-gradient-to-r from-green-200 to-emerald-200 relative z-10">
          <div className="flex items-center gap-3 text-gray-500 font-medium">
            <Sparkles className="w-5 h-5" />
            <span>Powered by AI Technology</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500 font-medium">
            <Book className="w-5 h-5" />
            <span>Plant Disease Detection System</span>
          </div>
        </div>
      </div>
    </div>
  );
};

ShareCard.propTypes = {
  resultImageBase64: PropTypes.string,
  predictionClass: PropTypes.string,
  predictionResult: PropTypes.object
};

const DetailsModal = ({ isOpen, onClose, diseaseInfo, predictionClass }) => {
  const { t, i18n } = useTranslation();
  if (!isOpen) return null;
  
  return (
    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <div className="overflow-y-auto" style={{ maxHeight: '80vh' }}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-green-800">
                {getTranslatedConditionName(predictionClass, i18n.language)}
              </h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">{t('expert.trackplants.status')}</div>
                <div className={`font-medium ${diseaseInfo.severity === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}`}>{diseaseInfo.severity}</div>
              </div>
              <div className="row-span-2">
                <img src={`data:image/jpeg;base64,${diseaseInfo.imageBase64}`} alt={t('expert.trackplants.plant_analysis')} className="w-full h-48 object-cover rounded-lg" />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">{t('expert.trackplants.description')}</div>
                <p className="text-gray-700">{diseaseInfo.description}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">{t('expert.trackplants.recommended_treatment')}</h4>
              <ol className="space-y-2">
                {diseaseInfo.treatment.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-green-600">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>                ))}
              </ol>
            </div>
          </div>
        </div>
      </DialogContent>
  );
};

DetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  diseaseInfo: PropTypes.shape({
    condition: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    treatment: PropTypes.arrayOf(PropTypes.string).isRequired,
    imageBase64: PropTypes.string.isRequired,
    predictionClass: PropTypes.string
  }).isRequired,
  predictionClass: PropTypes.string.isRequired
};

const PlantTrackingPage = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [selectedMode, setSelectedMode] = useState('upload'); 
  const [predictionClass, setPredictionClass] = useState('');
  const [resultImageBase64, setResultImageBase64] = useState('');
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);  
  const [experts, setExperts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isEmbeddedMonitoring, setIsEmbeddedMonitoring] = useState(false);
  const [liveImage, setLiveImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showExpertDetails, setShowExpertDetails] = useState(false);  
  const [expertReviews, setExpertReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [imageSelectionMode, setImageSelectionMode] = useState('upload'); 
  const [isSaving, setIsSaving] = useState(false);
  // const [isSharing, setIsSharing] = useState(false);
  // Weather states
  const [showWeatherTab, setShowWeatherTab] = useState(false);
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  // const BASE_URL = 'http://localhost:5000/';  const BASE_URL = 'http://localhost:5000';
  // const API_URL = 'https://abdulrhmanr91-agriai.hf.space/prdeict';
  const API_URL = 'https://abdulrhmanr91-agriai.hf.space/predict/';
  const getProfileImage = (imagePath) => {
    if (!imagePath) return user;
    return getImageUrl(imagePath);
  };  useEffect(() => {
    const loadFarmerProfile = async () => {
      try {
        const data = await getFarmerProfile();
        setFarmer(data);
        setProfileImage(getProfileImage(data.profileImage));
      } catch (error) {
        console.error('Error loading Farmer profile:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    loadFarmerProfile();
  }, []); 

  useEffect(() => {
    const loadExperts = async () => {
      try {
        const response = await getAvailableExperts('-rating');
        if (response.success && Array.isArray(response.data)) {
          const sortedExperts = response.data.sort((a, b) => {
            if (a.expertDetails?.averageRating === undefined) return 1;
            if (b.expertDetails?.averageRating === undefined) return -1;
            return b.expertDetails.averageRating - a.expertDetails.averageRating;
          });
          setExperts(sortedExperts);
          if (config.DEBUG) {
            console.log("Experts sorted by rating:", sortedExperts.map(e => ({
              name: e.name,
              rating: e.expertDetails?.averageRating
            })));
          }
        }
      } catch (error) {
        console.error('Failed to load experts:', error);
      }    };
    loadExperts();
  }, []);

  // Add listener for mobile app responses
  // useEffect(() => {
  //   const handleMobileMessage = (event) => {
  //     try {
  //       if (event.data && typeof event.data === 'string') {
  //         const message = JSON.parse(event.data);
  //           switch (message.type) {
  //           case 'shareComplete':
  //             toast.success(i18n.language === 'ar' ? 'تمت المشاركة بنجاح!' : 'Shared successfully!');
  //             setIsSharing(false);
  //             break;
  //           default:
  //             break;
  //         }
  //       }
  //     } catch (error) {
  //       console.log('Error parsing mobile message:', error);
  //     }
  //   };

  //   // Listen for messages from mobile app
  //   if (window.ReactNativeWebView) {
  //     window.addEventListener('message', handleMobileMessage);
  //     return () => window.removeEventListener('message', handleMobileMessage);
  //   }
  // }, [i18n.language]);

  useEffect(() => {
    return () => {
      embeddedService.cleanup();
    };
  }, []);

  // Helper function to get display URL for images
  const getImageDisplayUrl = (image) => {
    if (!image) return null;
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return image; // already a URL string
  };

  useEffect(() => {
    if (selectedMode === 'embedded') {
      embeddedService.setLiveImageCallback((imageBase64) => {
        setLiveImage(imageBase64);
      });
    }
    return () => {
      embeddedService.setLiveImageCallback(null);
    };
  }, [selectedMode]);

  useEffect(() => {
    if (selectedMode === 'embedded') {
      setIsEmbeddedMonitoring(true);
      embeddedService.startStreaming((imageBase64) => {
        setLiveImage(imageBase64);
      });
    } else {
      setIsEmbeddedMonitoring(false);
      embeddedService.stopStreaming();
      setLiveImage(null);
    }
    return () => {
      embeddedService.stopStreaming();
    };
  }, [selectedMode]);

  useEffect(() => {
    return () => {
      embeddedService.cleanup();
    };
  }, []);

  const handleCapture = () => {
    if (!isEmbeddedMonitoring || !liveImage) {
      toast.error('Camera is not active');
      return;
    }
    if (capturedImage) {
      setCapturedImage(null);
    } else {
      setCapturedImage(liveImage);
    }
  };  const renderEmbeddedSection = () => (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <span>{t('farmer.track_plants.live_camera')}</span>
        </h3>
        <p className="text-gray-600">
          {t('farmer.track_plants.live_camera_feed')}
        </p>
      </div>
        
      <div className="space-y-6">        <div className="bg-gray-50 rounded-xl p-6 h-80 flex items-center justify-center border border-gray-200 relative overflow-hidden">
          {liveImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={`data:image/jpeg;base64,${liveImage}`}
                alt="Live camera feed"
                className="max-h-full max-w-full object-contain rounded-lg shadow-md"
              />
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                {t('farmer.track_plants.live')}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-medium">{t('farmer.track_plants.camera_loading')}</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleCapture}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            disabled={!isEmbeddedMonitoring}
          >
            {capturedImage ? (
              <>
                <Eye className="w-5 h-5" />
                {t('farmer.track_plants.clear_capture')}
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                {t('farmer.track_plants.capture')}
              </>
            )}
          </button>
        </div>
        
        {capturedImage && (
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {t('farmer.track_plants.captured_image')}
            </h4>
            <div className="bg-white rounded-lg p-4 h-64 flex items-center justify-center mb-4">
              <img
                src={`data:image/jpeg;base64,${capturedImage}`}
                alt="Captured image"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
            <button
              onClick={handleAnalyzeCaptured}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('farmer.track_plants.analyzing')}
                </>
              ) : (
                <>
                  <Microscope className="w-5 h-5" />
                  {t('farmer.track_plants.analyze_captured')}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const handleAnalyzeCaptured = async () => {
    if (!capturedImage || isAnalyzing) return;
    try {
      setIsAnalyzing(true);
      const blob = await fetch(`data:image/jpeg;base64,${capturedImage}`).then(res => res.blob());
      const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const prediction = response.data.prediction;
      const confidence = response.data.confidence;
      const image = capturedImage;
      setPredictionResult({ confidence });
      setPredictionClass(prediction);
      setResultImageBase64(image);
      
      const diseaseInfo = getDiseaseInfo(prediction, i18n.language);
      const isHealthy = prediction.toLowerCase().includes('healthy');
      
      setPredictionResult({
        confidence,
        condition: prediction.split('___')[1]?.replace(/_/g, ' ') || 'Healthy',
        severity: isHealthy ? "Healthy" : diseaseInfo.severity,
        description: diseaseInfo.description,
        treatment: diseaseInfo.treatment
      });
      setResultImageBase64(image);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('farmer.track_plants.analysis_failed'));
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleStartChat = async (expertId) => {
    try {
      if (!expertId) {
        toast.error('Invalid expert selected');
        return;
      }
      
      const loadingToast = toast.loading('Starting chat...');
      
      // تأخير قصير للتأكد من عدم حدوث infinite loop
      setTimeout(() => {
        toast.dismiss(loadingToast);
        navigate(`/chat/${expertId}`);
      }, 100);
      
    } catch (error) {
      console.error('Chat error details:', error);
      toast.error('Could not connect with expert');
    }
  };

  const ExpertDetailsModal = ({ expert, isOpen, onClose, reviews, loading }) => {
    if (!expert) return null;
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="space-y-4">            <div className="flex items-center gap-4">
              <img
                src={getProfileImage(expert.profileImage)}
                alt={expert.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => { e.target.src = user; }}
              />
              <div>
                <h3 className="text-xl font-bold">{expert.name}</h3>
                <p className="text-gray-600">{expert.expertDetails?.specialization || (t('common.plant Expert'))}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(expert.expertDetails?.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({expert.expertDetails?.averageRating?.toFixed(1) || '0.0'})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">{t('common.reviews')}</div>
                <div className="font-semibold">{expert.expertDetails?.totalReviews || 0}</div>
              </div>
            </div>

            {expert.expertDetails?.bio && (
              <div>
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-gray-700">{expert.expertDetails.bio}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">{t('common.Recent Reviews')}</h4>
              {loading ? (
                <div className="text-center py-4">{t('common.Loading reviews...')}</div>
              ) : reviews.length > 0 ? (
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {review.date?.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{review.feedback}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">{t('common.No reviews yet')}</div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  onClose();
                  handleStartChat(expert._id);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
               {t('common.Start Chat')}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.Close')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  ExpertDetailsModal.propTypes = {
    expert: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    reviews: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired
  };

  const fetchExpertReviews = async (expertId) => {
    if (!expertId) return;
    try {
      setLoadingReviews(true);
      const response = await getExpertReviews(expertId);
      if (response.success && response.data) {
        const reviews = response.data.map(review => ({
          rating: review.rating,
          feedback: review.feedback || '',
          date: new Date(review.createdAt),
        }));
        setExpertReviews(reviews);
      } else {
        setExpertReviews([]);
      }
    } catch (error) {
      console.error('Error fetching expert reviews:', error);
      setExpertReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleShowExpertDetails = (expert) => {
    setSelectedExpert(expert);
    setShowExpertDetails(true);
    fetchExpertReviews(expert._id);
  };  const renderExpertsSection = () => (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-green-100 p-8 mb-8">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {t('farmer.track_plants.available_experts')}
          </h3>
        </div>
        <p className="text-gray-600">
          {t('farmer.track_plants.connect_plant_experts')}
        </p>
      </div>
      
      {experts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4 opacity-50">
            <Users className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 text-lg">{t('farmer.track_plants.no_experts_available')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experts.slice(0, 4).map((expert) => (
            <div key={expert._id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={getProfileImage(expert.profileImage)}
                    alt={expert.name}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-100"
                    onError={(e) => { e.target.src = user; }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-800 mb-1">{expert.name}</h4>
                  <p className="text-gray-600 text-sm">
                    {t('farmer.track_plants.plant_specialist')}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-sm text-gray-700">{expert.expertDetails?.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-500">({expert.expertDetails?.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleShowExpertDetails(expert)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  {t('farmer.track_plants.view_details')}
                </button>
                <button
                  onClick={() => handleStartChat(expert._id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('farmer.track_plants.chat')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    return () => {
      embeddedService.cleanup();
    };
  }, []);  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Store the file directly instead of creating blob URL
      setSelectedImage(file);
      setPredictionResult(null);
      setPredictionClass('');
      setResultImageBase64('');
    }
  };
    const handleCameraCapture = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Try to use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
        .then(stream => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          // Create modal for camera preview
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
          modal.innerHTML = `
            <div class="bg-white p-4 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
              <h3 class="text-lg font-bold mb-4 text-center text-gray-800">${t('farmer.track_plants.take_photo')}</h3>
              <div class="relative">
                <video autoplay playsinline muted class="w-full rounded-lg mb-4 bg-gray-200" style="aspect-ratio: 4/3; object-fit: cover;"></video>
                <div class="flex gap-3 justify-center">
                  <button id="capture-btn" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium">
                    ${t('farmer.track_plants.capture')}
                  </button>
                  <button id="cancel-btn" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-medium">
                    ${t('farmer.track_plants.cancel')}
                  </button>
                </div>
              </div>
            </div>
          `;
          
          document.body.appendChild(modal);
          const modalVideo = modal.querySelector('video');
          
          // Set up the video stream
          modalVideo.srcObject = stream;
          
          // Wait for video metadata to load
          modalVideo.onloadedmetadata = () => {
            modalVideo.play().catch(err => {
              console.error('Error playing video:', err);
            });
          };
          
          modal.querySelector('#capture-btn').onclick = () => {
            // Make sure video is playing and has dimensions
            if (modalVideo.videoWidth > 0 && modalVideo.videoHeight > 0) {
              canvas.width = modalVideo.videoWidth;
              canvas.height = modalVideo.videoHeight;
              context.drawImage(modalVideo, 0, 0);
              
              canvas.toBlob(blob => {
                const imageUrl = URL.createObjectURL(blob);
                setSelectedImage(imageUrl);
                setPredictionResult(null);
                setPredictionClass('');
                setResultImageBase64('');
                
                // Stop all tracks and cleanup
                stream.getTracks().forEach(track => track.stop());
                document.body.removeChild(modal);
                toast.success(t('farmer.track_plants.image_captured'));
              }, 'image/jpeg', 0.9);
            } else {
              toast.error(t('farmer.track_plants.camera_not_ready'));
            }
          };
          
          modal.querySelector('#cancel-btn').onclick = () => {
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
          };
          
          // Close modal when clicking outside
          modal.onclick = (e) => {
            if (e.target === modal) {
              stream.getTracks().forEach(track => track.stop());
              document.body.removeChild(modal);
            }
          };
        })
        .catch(error => {
          console.error('Error accessing camera:', error);
          let errorMessage = t('farmer.track_plants.camera_error');
          
          if (error.name === 'NotAllowedError') {
            errorMessage = t('farmer.track_plants.camera_permission_denied');
          } else if (error.name === 'NotFoundError') {
            errorMessage = t('farmer.track_plants.camera_not_found');
          } else if (error.name === 'NotSupportedError') {
            errorMessage = t('farmer.track_plants.camera_not_supported');
          }
          
          toast.error(errorMessage);
        });
    } else {
      toast.error(t('farmer.track_plants.camera_not_supported'));
    }
  };
  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error(t('farmer.track_plants.select_image'));
      return;
    }

    try {      setIsAnalyzing(true);
      
      let file = null;
      
      // Check if selectedImage is a File object or blob URL
      if (selectedImage instanceof File) {
        // Direct file from upload
        file = selectedImage;
      } else if (typeof selectedImage === 'string' && selectedImage.startsWith('blob:')) {
        // Convert blob URL to file for camera captures
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
      } else {
        // Fallback: Get file from input for regular uploads
        const fileInput = document.querySelector('input[type="file"]');
        file = fileInput?.files[0];
        
        if (!file) {
          toast.error(t('farmer.track_plants.select_image'));
          return;
        }
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const prediction = response.data.prediction;
      const confidence = response.data.confidence;

      const reader = new FileReader();
      reader.onload = function(event) {
        const imageBase64 = event.target.result.split(',')[1];
        setPredictionResult({ confidence });
        setPredictionClass(prediction);
        setResultImageBase64(imageBase64);

        const diseaseInfo = getDiseaseInfo(prediction, i18n.language);
        const isHealthy = prediction.toLowerCase().includes('healthy');
        
        setPredictionResult({
          confidence,
          condition: prediction.split('___')[1]?.replace(/_/g, ' ') || 'Healthy',
          severity: isHealthy ? "Healthy" : diseaseInfo.severity,
          description: diseaseInfo.description,
          treatment: diseaseInfo.treatment
        });
        setResultImageBase64(imageBase64);
      };
      reader.readAsDataURL(file);    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {      setIsAnalyzing(false);
    }
  };

// const shareToSocialMedia = async () => {
//     if (!predictionClass || !predictionResult) {
//       toast.error(i18n.language === 'ar' ? 'لا توجد نتائج للمشاركة' : 'No results to share');
//       return;
//     }
    
    // setIsSharing(true);
    
//     try {
//       const conditionDisplayName = getTranslatedConditionName(predictionClass, i18n.language);
//       const analysisDate = new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');
      
//       const shareText = i18n.language === 'ar' 
//         ? `🌱 نتائج تحليل النبات - AgriAI

// 📅 تاريخ التحليل: ${analysisDate}
// 🔍 الحالة المكتشفة: ${conditionDisplayName}
// 📊 مستوى الثقة: ${predictionResult.confidence}
// ⚠️ درجة الخطورة: ${predictionResult.severity}

// 📝 الوصف:
// ${predictionResult.description}

// 💡 التوصيات:
// ${predictionResult.treatment.map((item, index) => `${index + 1}. ${item}`).join('\n')}

// 🚀 تم التحليل بواسطة نظام AgriAI للذكاء الاصطناعي
// #تحليل_النبات #الذكاء_الاصطناعي #الزراعة`
//         : `🌱 Plant Analysis Results - AgriAI

// 📅 Analysis Date: ${analysisDate}
// 🔍 Detected Condition: ${conditionDisplayName}
// 📊 Confidence Level: ${predictionResult.confidence}
// ⚠️ Severity Level: ${predictionResult.severity}

// 📝 Description:
// ${predictionResult.description}

// 💡 Recommendations:
// ${predictionResult.treatment.map((item, index) => `${index + 1}. ${item}`).join('\n')}

// 🚀 Analyzed by AgriAI AI System
// #PlantAnalysis #AI #Agriculture`;
      
//       // Check if we're in mobile app
//       const isMobileApp = window.ReactNativeWebView !== undefined;
      
//       if (isMobileApp) {
//         // For mobile app, use native text sharing
//         window.ReactNativeWebView.postMessage(JSON.stringify({
//           type: 'shareText',
//           title: i18n.language === 'ar' ? 'نتائج تحليل النبات' : 'Plant Analysis Results',
//           text: shareText,
//           shareType: 'text_analysis'
//         }));
        
//         toast.success(i18n.language === 'ar' ? 'تم نسخ النص للمشاركة' : 'Text copied for sharing');
//       } else {
//         // For web, use Web Share API or clipboard
//         if (navigator.share) {
//           try {
//             await navigator.share({
//               title: i18n.language === 'ar' ? 'نتائج تحليل النبات' : 'Plant Analysis Results',
//               text: shareText
//             });
//             toast.success(i18n.language === 'ar' ? 'تمت المشاركة بنجاح' : 'Shared successfully');          } catch (shareError) {
//             console.log('Share cancelled or failed:', shareError);
//             // Fallback to clipboard
//             await navigator.clipboard.writeText(shareText);
//             toast.success(i18n.language === 'ar' ? 'تم نسخ النص إلى الحافظة' : 'Text copied to clipboard');
//           }
//         } else {
//           // Fallback to clipboard
//           await navigator.clipboard.writeText(shareText);
//           toast.success(i18n.language === 'ar' ? 'تم نسخ النص إلى الحافظة' : 'Text copied to clipboard');
//         }
//       }
      
//     } catch (error) {
//       console.error('Error sharing:', error);
//       toast.error(i18n.language === 'ar' ? 'فشل في مشاركة النص' : 'Failed to share text');
//     } finally {
//       setIsSharing(false);
//     } };
  const saveAnalysis = async () => {
    if (!resultImageBase64 || !predictionClass || !predictionResult) {
      toast.error('لا توجد نتائج للحفظ');
      return;
    }

    setIsSaving(true);

    try {
      // Extract plant type and condition like the backup file did
      const [plantType, conditionRaw] = (predictionClass || '___').split('___');
      const conditionDisplayName = conditionRaw ? conditionRaw.replace(/_/g, ' ') : 'Healthy';
      const fullCondition = `${plantType || 'Unknown'} - ${conditionDisplayName}`;

      const analysisData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        condition: fullCondition,
        originalPrediction: predictionClass,
        predictionClass: predictionClass,
        severity: predictionResult.severity || 'Unknown',
        confidence: predictionResult.confidence,
        description: predictionResult.description || '',
        treatment: predictionResult.treatment || [],
        imageBase64: resultImageBase64
      };

      console.log('Saving analysis with data:', {
        condition: analysisData.condition,
        severity: analysisData.severity,
        hasImage: !!analysisData.imageBase64,
        treatmentCount: Array.isArray(analysisData.treatment) ? analysisData.treatment.length : 0
      });

      // Use the new sync service for dual persistence
      const result = await analysisSync.saveAnalysis(analysisData);
      
      if (result.success) {
        if (result.savedToDatabase) {
          toast.success('✅ تم حفظ التحليل في قاعدة البيانات بنجاح!');
        } else if (result.savedToLocalStorage) {
          toast.success('⚠️ تم حفظ التحليل محلياً (سيتم المزامنة لاحقاً)');
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error(`فشل في حفظ النتائج: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  // Get saved analyses count
  const getSavedAnalysesCount = () => {
    try {
      const saved = localStorage.getItem('plantAnalysisFarmer');
      if (saved) {
        const parsed = JSON.parse(saved);
        const count = Array.isArray(parsed) ? parsed.length : 0;
        console.log('Current saved analyses count:', count);
        return count;
      }
      return 0;
    } catch (error) {
      console.error('Error getting saved analyses count:', error);
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 relative pb-40 overflow-hidden">
    
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-400/15 via-green-400/10 to-teal-400/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-gradient-to-r from-teal-400/10 via-cyan-400/8 to-blue-400/10 rounded-full blur-2xl"></div>
      </div>
      <div className="relative z-10 p-3 sm:p-6">
     
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-green-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/farmer/profile" className="group">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 border-2 border-green-100">
                  <img 
                    src={profileImage || user}
                    alt="farmer Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = user;
                      e.target.onerror = null;
                    }}
                  />
                </div>
              </Link>
              
            </div>
              <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('farmer.track_plants.welcome')}</p>
                <p className="font-semibold text-gray-800">
                  {farmer?.name || t('farmer.track_plants.distinguished_farmer')}
                </p>
              </div>
              
              {/* Saved Analyses Button */}
              <Link 
                to="/farmer/saved-analyses" 
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                title={t('farmer.track_plants.saved_analyses_title')}
              >
                <Book className="w-4 h-4" />
                <span className="hidden sm:inline">{t('farmer.track_plants.saved_analyses_title')}</span>
                {getSavedAnalysesCount() > 0 && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[20px] text-center">
                    {getSavedAnalysesCount()}
                  </span>
                )}
              </Link>
              
             
            </div>
          </div>       
          </div>        
        <WeatherRecommendations 
          className="mb-8" 
          onViewDetails={() => setShowWeatherTab(true)}
          showViewMoreButton={true}
        />        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            onClick={() => setSelectedMode('upload')}
            className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
              selectedMode === 'upload' 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedMode === 'upload' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {t('farmer.track_plants.upload_images')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('farmer.track_plants.upload_plant_image')}
                </p>
              </div>
            </div>
            {selectedMode === 'upload' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t('farmer.track_plants.selected_ready')}</span>
              </div>
            )}
          </div>

          <div 
            onClick={() => setSelectedMode('embedded')}
            className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
              selectedMode === 'embedded' 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedMode === 'embedded' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {t('farmer.track_plants.embedded_camera')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('farmer.track_plants.use_embedded_camera')}
                </p>
              </div>
            </div>
            {selectedMode === 'embedded' && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-100 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t('farmer.track_plants.selected_ready')}</span>
              </div>
            )}
          </div>
        </div>        {/* Upload Section */}
        {selectedMode === 'upload' && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-green-100 p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span>{t('farmer.track_plants.upload_plant_image_title')}</span>
              </h2>
              <p className="text-gray-600">
                {t('farmer.track_plants.select_clear_image')}
              </p>
            </div>

            {/* Image Selection Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* <button
                onClick={() => setImageSelectionMode('upload')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                  imageSelectionMode === 'upload'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white hover:border-green-300 text-gray-600'
                }`}
              >
                <Upload className="w-6 h-6" />
                <div className="text-left">
                 <div className="text-sm opacity-75">{t('farmer.track_plants.choose_from_gallery')}</div>
                </div>
              </button>   <div className="font-semibold">{t('farmer.track_plants.upload_from_device')}</div> */}
                
              
              {/* <button
                onClick={() => setImageSelectionMode('camera')}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                  imageSelectionMode === 'camera'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white hover:border-green-300 text-gray-600'
                }`}
              >
                <Camera className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-semibold">{t('farmer.track_plants.take_photo')}</div>
                  <div className="text-sm opacity-75">{t('farmer.track_plants.use_device_camera')}</div>
                </div>
              </button> */}
            </div>

            <div className="upload-area mb-8">
              {imageSelectionMode === 'upload' ? (
                <label htmlFor="imageUpload" className="block">                  <div className="border-2 border-dashed border-green-300 rounded-xl p-12 text-center hover:border-green-400 transition-colors cursor-pointer bg-green-50 hover:bg-green-100">
                    {selectedImage ? (
                      <div className="relative">
                        <img 
                          src={getImageDisplayUrl(selectedImage)} 
                          alt="Selected" 
                          className="max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="mt-4 text-green-600 font-medium">
                          {t('farmer.track_plants.ready')}
                        </div>
                      </div>
                    ) : (
                      <div className="py-12">
                        <div className="w-16 h-16 bg-green-500 text-white rounded-lg flex items-center justify-center mx-auto mb-6">
                          <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-xl font-semibold text-gray-700 mb-4">
                          {t('farmer.track_plants.drag_drop_here')}
                        </p>
                        <p className="text-gray-600 mb-6">
                          {t('farmer.track_plants.click_select_device')}
                        </p>
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                          <span className="bg-white px-3 py-1 rounded-lg">JPG</span>
                          <span className="bg-white px-3 py-1 rounded-lg">PNG</span>
                          <span className="bg-white px-3 py-1 rounded-lg">WEBP</span>
                        </div>
                      </div>
                    )}
                  </div>
                </label>            
                  ) : (
                <div className="border-2 border-dashed border-green-300 rounded-xl p-12 text-center bg-green-50">
                  {selectedImage ? (
                    <div className="relative">
                      <img 
                        src={getImageDisplayUrl(selectedImage)} 
                        alt="Captured" 
                        className="max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="mt-4 text-green-600 font-medium">
                        {t('farmer.track_plants.photo_captured')}
                      </div>
                       {/* <button
                        onClick={handleCameraCapture}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('farmer.track_plants.take_another')}
                      </button>  */}
                    </div>
                  ):(
                     <div className="py-12">
                       <div className="w-16 h-16 bg-green-500 text-white rounded-lg flex items-center justify-center mx-auto mb-6">
                         <Camera className="w-8 h-8" />
                       </div>
                       <p className="text-xl font-semibold text-gray-700 mb-4">
                         {t('farmer.track_plants.ready_to_capture')}
                       </p>
                       <p className="text-gray-600 mb-6">
                         {t('farmer.track_plants.click_to_open_camera')}
                      </p>
                    {/* <button
                        onClick={handleCameraCapture}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        {t('farmer.track_plants.open_camera')}
                      </button>  */}
                    </div>
                  )}
                </div>
              )}
              
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!selectedImage || isAnalyzing}
                className="bg-green-600 text-white px-12 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors flex items-center gap-3 shadow-md hover:shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('farmer.track_plants.analyzing')}</span>
                  </>
                ) : (
                  <>
                    <Microscope className="w-5 h-5" />
                    <span>{t('farmer.track_plants.analysis_image')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Embedded Camera Section */}
        {selectedMode === 'embedded' && renderEmbeddedSection()}        {/* Analysis Results */}
        {predictionResult && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-green-100 p-6 mb-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {t('farmer.track_plants.analysis_results')}
                </h2>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 inline-block">
                <span className="text-green-700 font-medium">
                  ✅ {t('farmer.track_plants.analysis_success')}
                </span>
              </div>
            </div>

            {/* Plant Image */}
            <div className="text-center mb-6">
              <div className="inline-block relative">
                <img 
                  src={`data:image/jpeg;base64,${resultImageBase64}`} 
                  alt="Plant Analysis"
                  className="max-h-60 mx-auto rounded-lg shadow-md border border-gray-200"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {t('farmer.track_plants.analyzed')}
                </div>
              </div>
            </div>

            {/* Plant Condition */}
            <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('farmer.track_plants.detected_plant_condition')}
                  </h3>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {getTranslatedConditionName(predictionClass, i18n.language)}
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">       
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm text-gray-600 mb-1">{t('farmer.track_plants.severity_level')}</div>
                <div className={`text-lg font-bold ${
                  predictionResult.severity === 'Healthy' ? 'text-green-600' : 
                  predictionResult.severity === 'Mild' ? 'text-yellow-600' :
                  predictionResult.severity === 'Moderate' ? 'text-orange-600' : 
                  'text-red-600'
                }`}>
                  {predictionResult.severity === 'Healthy' ? 'سليم' : 
                   predictionResult.severity === 'Mild' ? 'خفيف' :
                   predictionResult.severity === 'Moderate' ? 'متوسط' : 
                   predictionResult.severity === 'Severe' ? 'شديد' : predictionResult.severity}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm text-gray-600 mb-1">{t('farmer.track_plants.analysis_time')}</div>
                <div className="text-lg font-bold text-purple-600">
                  {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Disease Description */}
            {predictionResult.description && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('farmer.track_plants.condition_description')}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {predictionResult.description}
                </p>
              </div>
            )}            {/* Treatment Recommendations */}
            {predictionResult && (
              <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Book className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('farmer.track_plants.treatment_recommendations')}
                  </h3>
                </div>
                
                {/* Conditional rendering based on condition type */}
                {(predictionResult.condition === 'Unknown Condition' || predictionResult.condition === 'حالة غير معروفة') ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 bg-white rounded-lg p-5 border border-amber-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-gray-700 leading-relaxed">
                          {i18n.language === 'ar' 
                            ? 'نعمل على إضافة المزيد من النباتات إلى نموذجنا للتحليل. حتى نتمكن من دعم هذا النوع من النباتات، يمكنك استشارة أحد خبرائنا الزراعيين المتاحين أدناه للحصول على تشخيص دقيق ومساعدة متخصصة.'
                            : 'We are working on adding more plants to our analysis model. Until we can support this type of plant, you can consult with one of our agricultural experts available below for accurate diagnosis and specialized assistance.'}
                        </p>
                        
                        <button 
                          onClick={() => window.location.href = '/consult'}
                          className="bg-amber-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-amber-600 transition-all duration-300 flex items-center gap-2 mx-auto mt-3"
                        >
                          <UserCheck className="w-4 h-4" />
                          {i18n.language === 'ar' ? 'تواصل مع خبير' : 'Consult with Expert'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  predictionResult.treatment && predictionResult.treatment.length > 0 && (
                    <div className="space-y-3">
                      {predictionResult.treatment.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4 border border-green-100">
                          <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Action Buttons */}            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <button
                onClick={saveAnalysis}
                disabled={isSaving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}                {isSaving ? 
                  (i18n.language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : 
                  t('farmer.track_plants.save_results')
                }
              </button>
              
           
            </div>
          </div>
        )}

        {/* Experts Section */}
        {renderExpertsSection()}

        {/* Share Card (Hidden) */}
        <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
          <ShareCard 
            resultImageBase64={resultImageBase64}
            predictionClass={predictionClass}
            predictionResult={predictionResult}
          />
        </div>

        {/* Details Modal */}
        {showDetails && predictionResult && (
          <DetailsModal
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            diseaseInfo={predictionResult}
            predictionClass={predictionClass}
          />
        )}        {/* Expert Details Modal */}
        <ExpertDetailsModal
          expert={selectedExpert}
          isOpen={showExpertDetails}
          onClose={() => setShowExpertDetails(false)}
          reviews={expertReviews}
          loading={loadingReviews}
        />

        {/* Weather Tab Modal */}
        <WeatherTab
          isOpen={showWeatherTab}
          onClose={() => setShowWeatherTab(false)}
          lat={30.033333}
          lon={31.233334}
        />
      </div>
    </div>
  );
};

export default PlantTrackingPage;
