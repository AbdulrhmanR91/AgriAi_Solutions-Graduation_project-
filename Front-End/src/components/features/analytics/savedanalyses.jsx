import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTranslatedConditionName, getDiseaseInfo } from '../../../utils/diseaseData';
import { Card, CardHeader, CardContent } from '../../shared/ui/card.js';
import toast from 'react-hot-toast';
import searchIcon from '../../../assets/images/search.png';
import { Dialog, DialogContent } from '../../shared/ui/dialog.js';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import config from '../../../config/config.js';
import PropTypes from 'prop-types';
import { storage } from '../../../utils/storage.js';
import { AnalysisSyncService } from '../../../utils/analysisSync';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ar from 'date-fns/locale/ar';
import enUS from 'date-fns/locale/en-US';

// Create sync service instance
const analysisSync = new AnalysisSyncService();


// Register locales
registerLocale('ar', ar);
registerLocale('en', enUS);

// Add custom CSS for enhanced styling
const customStyles = `
  .rtl .react-datepicker {
    direction: rtl;
    text-align: right;
  }
  .rtl .react-datepicker__header {
    text-align: right;
  }
  .rtl .react-datepicker__current-month {
    text-align: right;
  }
  .rtl .react-datepicker__day-names {
    direction: rtl;
  }
  
  /* Enhanced animations */
  .analysis-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .analysis-card:hover {
    transform: translateY(-4px);
  }
  
  /* Custom scrollbar for modal */
  .modal-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .modal-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .modal-content::-webkit-scrollbar-thumb {
    background: #10b981;
    border-radius: 3px;
  }
  
  .modal-content::-webkit-scrollbar-thumb:hover {
    background: #059669;
  }
  
  /* Gradient animations */
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .animated-gradient {
    background-size: 200% 200%;
    animation: gradient-shift 6s ease infinite;
  }
`;

// Inject enhanced CSS
if (typeof document !== 'undefined' && !document.getElementById('saved-analyses-styles')) {
  const style = document.createElement('style');
  style.id = 'saved-analyses-styles';
  style.textContent = customStyles;
  document.head.appendChild(style);
}

const DetailsModal = ({ isOpen, onClose, analysis }) => {
  const { t, i18n } = useTranslation();
  
  // Safe date handling
  const analysisDate = analysis?.date || analysis?.createdAt || new Date().toISOString();
  const dateToShow = new Date(analysisDate).toLocaleDateString();
  
  // Get translated condition name and disease info with safe fallbacks
  const conditionToTranslate = analysis?.originalPrediction || analysis?.predictionClass || analysis?.condition || 'Unknown';
  const conditionDisplayName = getTranslatedConditionName(conditionToTranslate, i18n.language);
  const diseaseInfo = getDiseaseInfo(conditionToTranslate, i18n.language);
  
  if (!analysis) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Enhanced Header */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-200">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {conditionDisplayName || t('farmer.saved_analyses.unknown_condition')}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m0 0v11a2 2 0 002 2h12a2 2 0 002-2V7H4z" />
                </svg>
                {t('farmer.saved_analyses.analyzed_on')} {dateToShow}
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Status Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    (analysis.severity === 'Healthy' || diseaseInfo.severity === 'Healthy') ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="text-sm text-gray-600 font-medium">{t('farmer.saved_analyses.status')}</div>
                </div>
                <div className={`text-xl font-bold ${
                  (analysis.severity === 'Healthy' || diseaseInfo.severity === 'Healthy') ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {diseaseInfo.severity || analysis.severity || 'Unknown'}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m0 0v11a2 2 0 002 2h12a2 2 0 002-2V7H4z" />
                  </svg>
                  <div className="text-sm text-gray-600 font-medium">{t('farmer.saved_analyses.analysis_date')}</div>
                </div>
                <div className="text-xl font-bold text-blue-700">
                  {dateToShow}
                </div>
              </div>
            </div>

            {/* Enhanced Image Display */}
            <div className="lg:col-span-1">
              <div className="relative overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={`data:image/jpeg;base64,${analysis.imageBase64}`}
                  alt={t('farmer.saved_analyses.plant_analysis')}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Treatment Plan */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-green-800">{t('farmer.saved_analyses.treatment_plan')}</h4>
            </div>
            <div className="grid gap-3">
              {(diseaseInfo.treatment || analysis.treatment).map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-green-100/50">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ShareCard = ({ analysis }) => {
  const { t, i18n } = useTranslation();
  // Get translated condition name
  const conditionDisplayName = getTranslatedConditionName(analysis.originalPrediction || analysis.predictionClass || analysis.condition, i18n.language);
  const diseaseInfo = getDiseaseInfo(analysis.originalPrediction || analysis.predictionClass || analysis.condition, i18n.language);
  
  // Add date handling with fallback
  const analysisDate = new Date(analysis.date || Date.now());
  const formattedDate = analysisDate.toLocaleDateString();
  const formattedTime = analysisDate.toLocaleTimeString();

  return (
    <div 
      id="share-card" 
      className="bg-gradient-to-br from-white to-green-50 p-8 rounded-3xl shadow-2xl border border-green-100" 
      style={{ width: '800px', minHeight: '700px' }}
    >
      <div className="flex flex-col gap-6">
        {/* Enhanced Header */}
        <div className="text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl -z-10"></div>
          <div className="p-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-3xl">🌿</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {t('farmer.saved_analyses.plant_analysis_results')}
            </h2>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m0 0v11a2 2 0 002 2h12a2 2 0 002-2V7H4z" />
              </svg>
              <span className="font-medium">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Enhanced Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <img 
                src={`data:image/jpeg;base64,${analysis.imageBase64}`}
                alt={t('farmer.saved_analyses.analysis_result')} 
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
          </div>

          {/* Right Column - Enhanced Details */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-4 h-4 rounded-full ${
                  conditionDisplayName.toLowerCase().includes('healthy') || conditionDisplayName.includes('سليم') ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="text-sm text-gray-600 font-medium">{t('farmer.saved_analyses.detected_condition')}</div>
              </div>
              <div className={`font-bold text-xl ${
                conditionDisplayName.toLowerCase().includes('healthy') || conditionDisplayName.includes('سليم') ? 'text-green-700' : 'text-red-700'
              }`}>
                {conditionDisplayName}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-gray-600 font-medium">{t('farmer.saved_analyses.status')}</div>
              </div>
              <div className={`font-bold text-xl ${
                analysis.severity === 'Healthy' ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {diseaseInfo.severity || analysis.severity}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Treatment Plan */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800">{t('farmer.saved_analyses.treatment_plan')}</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {(diseaseInfo.treatment || analysis.treatment).map((item, index) => (
              <div key={index} className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm border border-green-100/50">
                <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Status Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m0 0v11a2 2 0 002 2h12a2 2 0 002-2V7H4z" />
              </svg>
              <div className="text-sm text-gray-600 font-medium">{t('farmer.saved_analyses.analysis_date')}</div>
            </div>
            <div className="font-bold text-gray-800">{formattedDate}</div>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-600 font-medium">{t('farmer.saved_analyses.analysis_time')}</div>
            </div>
            <div className="font-bold text-gray-800">{formattedTime}</div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-800">{t('farmer.saved_analyses.analyzed_by')} AgriAI</div>
              <div className="text-gray-500">Powered by AI Technology 🤖</div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="font-medium">{formattedDate}</div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified Analysis
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const handleShare = async (analysis) => {
  try {
    toast.loading('Preparing image...');

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(<ShareCard analysis={analysis} />);

    await new Promise(resolve => setTimeout(resolve, 500));

    const shareCard = container.querySelector('#share-card');
    const canvas = await html2canvas(shareCard, {
      useCORS: true,
      scale: 2,
      backgroundColor: 'white',
      logging: false
    });

    root.unmount();
    document.body.removeChild(container);

    // Try Web Share API first
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
        const file = new File([blob], 'plant-analysis.png', { type: 'image/png' });
        
        const shareData = {
          files: [file],
          title: 'Saved Plant Analysis',
          text: 'Check out this plant analysis from AgriAI!'
        };

        if (await navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success('Shared successfully!');
          return;
        }
      } catch (shareError) {
        console.log('Share failed, falling back to download:', shareError);
      }
    }

    // Fallback to direct download
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
    const url = URL.createObjectURL(blob);
    
    // Create invisible download link
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'plant-analysis.png';
    document.body.appendChild(a);
    
    // Trigger download
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Image downloaded successfully!');
  } catch (error) {
    console.error('Error sharing:', error);
    toast.error('Failed to generate image');
  } finally {
    toast.dismiss();
  }
};

const SavedAnalyses = () => {
  const { t, i18n } = useTranslation();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Add this near the top of the component
  useEffect(() => {
    // Debug API config
    const session = storage.getSession();
    console.log('API Config:', {
      baseUrl: config.API_URL,
      endpoint: `${config.API_URL}/plant-analyses`,
      sessionAvailable: !!session,
      tokenAvailable: !!session?.token,
      userType: session?.userData?.userType
    });
  }, []);

  // Load analyses from API
  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      
      // Use the new sync service for loading
      console.log('Loading analyses using AnalysisSyncService...');
      const result = await analysisSync.loadAnalyses();
      
      if (result && result.analyses) {
        console.log('Loaded analyses:', result.analyses.length);
        setAnalyses(result.analyses || []);
        
        // Log the source of data
        if (result.source === 'database') {
          console.log('✅ Data loaded from database');
        } else if (result.source === 'localStorage') {
          console.log('⚠️ Data loaded from localStorage (offline mode)');
        }
      } else {
        console.warn('No analyses found');
        setAnalyses([]);
      }
      
    } catch (error) {
      console.error('Error loading analyses:', error);
      toast.error('Error loading saved analyses. Please try again.');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };
  // Enhanced filter with date
  const filteredAnalyses = useMemo(() => {
    return analyses.filter(analysis => {
      // Get translated condition name for search - with safe fallbacks
      const translatedCondition = getTranslatedConditionName(analysis.originalPrediction || analysis.predictionClass || analysis.condition, i18n.language);
      
      // Safe string matching with fallbacks
      const conditionText = (analysis.condition || '').toLowerCase();
      const severityText = (analysis.severity || '').toLowerCase();
      const translatedText = (translatedCondition || '').toLowerCase();
      const searchText = searchQuery.toLowerCase();
      
      const matchesSearch = 
        conditionText.includes(searchText) ||
        severityText.includes(searchText) ||
        translatedText.includes(searchText) ||
        (analysis.originalPrediction && analysis.originalPrediction.toLowerCase().includes(searchText)) ||
        (analysis.predictionClass && analysis.predictionClass.toLowerCase().includes(searchText));
      
      if (!dateFilter) return matchesSearch;

      // Safe date comparison
      try {
        const analysisDate = new Date(analysis.date || analysis.createdAt).toLocaleDateString();
        const filterDate = new Date(dateFilter).toLocaleDateString();
        return matchesSearch && analysisDate === filterDate;
      } catch (error) {
        console.warn('Date comparison error:', error);
        return matchesSearch;
      }
    });
  }, [analyses, searchQuery, dateFilter, i18n.language]);

  // Delete analysis using sync service
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        console.log('Deleting analysis:', id);
        const result = await analysisSync.deleteAnalysis(id);
        
        if (result.success) {
          // Update local state
          setAnalyses(analyses.filter(analysis => (analysis._id || analysis.id) !== id));
          toast.success('Analysis deleted successfully');
          
          // Log deletion source
          if (result.deletedFromDatabase) {
            console.log('✅ Analysis deleted from database');
          } else {
            console.log('⚠️ Analysis deleted from localStorage only');
          }
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Error deleting analysis:', error);
        toast.error(error.message || 'Failed to delete analysis');
      }
    }
  };


  return (
    // Modern gradient background with improved spacing
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 pb-24"> 
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header with modern styling */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link 
                to="../trackplants"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl hover:from-green-200 hover:to-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('common.back')}
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t('farmer.saved_analyses.title')}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredAnalyses.length} {t('farmer.saved_analyses.analyses')} {t('farmer.saved_analyses.available')}
                </p>
              </div>
            </div>
            
            <Link 
              to="../trackplants"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('farmer.saved_analyses.new_analysis')}
            </Link>
          </div>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Modern Search Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('farmer.saved_analyses.search_placeholder')}
                className="w-full px-6 py-4 pl-14 bg-gray-50/80 border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-400/20 focus:border-green-400 transition-all duration-300 text-gray-700"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <img src={searchIcon} alt="Search" className="w-5 h-5 opacity-60" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Enhanced Date Filter */}
            <div className="relative">
              <DatePicker
                selected={dateFilter ? new Date(dateFilter) : null}
                onChange={(date) => setDateFilter(date?.toISOString().split('T')[0] || '')}
                className="w-full sm:w-auto px-6 py-4 bg-gray-50/80 border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-400/20 focus:border-green-400 transition-all duration-300"
                placeholderText={t("expert.saved_analyses.select_date")}
                calendarClassName={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                calendarStartDay={0}
                showPopperArrow={false}
                locale={i18n.language === 'ar' ? 'ar' : 'en'}
                dateFormat={i18n.language === 'ar' ? 'dd/MM/yyyy' : 'MM/dd/yyyy'}
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Results Count */}
        <div className="mb-6 px-2">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">
              {t('farmer.saved_analyses.showing')} <span className="text-green-600 font-bold">{filteredAnalyses.length}</span> {t('farmer.saved_analyses.of')} <span className="text-gray-800 font-semibold">{analyses.length}</span> {t('farmer.saved_analyses.analyses')}
            </span>
          </div>
        </div>

        {/* Enhanced Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}...</p>
          </div>
        )}

        {/* Enhanced Empty state */}
        {!loading && filteredAnalyses.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? t('farmer.saved_analyses.no_matching_results') : t('farmer.saved_analyses.no_analyses_yet')}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? t('farmer.saved_analyses.try_different_search') 
                : t('farmer.saved_analyses.start_analyzing_plants')
              }
            </p>
            {!searchQuery && (
              <Link 
                to="../trackplants"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('farmer.saved_analyses.new_analysis')}
              </Link>
            )}
          </div>
        )}        {/* Enhanced Results grid with better responsive layout */}
        {!loading && filteredAnalyses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredAnalyses.map(analysis => {
              // Get translated condition name for display with safe fallbacks
              const conditionToTranslate = analysis.originalPrediction || analysis.predictionClass || analysis.condition || 'Unknown';
              const conditionDisplayName = getTranslatedConditionName(conditionToTranslate, i18n.language);
              const diseaseInfo = getDiseaseInfo(conditionToTranslate, i18n.language);
              
              // Safe date handling
              const analysisDate = analysis.date || analysis.createdAt || new Date().toISOString();
              const displayDate = new Date(analysisDate).toLocaleDateString();
              
              const isHealthy = (analysis.severity === 'Healthy' || diseaseInfo.severity === 'Healthy');
              
              return (
              <Card key={analysis._id || analysis.id || Math.random()} className="analysis-card group bg-white/95 backdrop-blur-sm hover:bg-white hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-green-200/80 rounded-2xl overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]">
                <CardHeader className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => handleDelete(analysis._id || analysis.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg hover:shadow-xl"
                      title={t('farmer.saved_analyses.delete_analysis')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      isHealthy 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        isHealthy ? 'bg-green-500' : 'bg-amber-500'
                      }`}></div>
                      {diseaseInfo.severity || analysis.severity || 'Unknown'}
                    </div>
                    
                    <div>
                      <h2 className="font-bold text-lg text-gray-800 leading-tight">
                        {conditionDisplayName || t('farmer.saved_analyses.unknown_condition')}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4m0 0v11a2 2 0 002 2h12a2 2 0 002-2V7H4z" />
                        </svg>
                        {displayDate}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Enhanced Image Display */}
                    <div className="relative overflow-hidden rounded-xl">
                      {analysis.imageBase64 ? (
                        <img 
                          src={`data:image/jpeg;base64,${analysis.imageBase64}`}
                          alt={t('farmer.saved_analyses.plant_analysis')} 
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-400" style={{display: analysis.imageBase64 ? 'none' : 'flex'}}>
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Treatment Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-semibold text-green-800 text-sm">{t('farmer.saved_analyses.treatment')}:</span>
                      </div>
                      <div className="space-y-2">
                        {(diseaseInfo.treatment || analysis.treatment || ['No treatment available']).slice(0, 2).map((item, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="line-clamp-2">{item}</span>
                          </div>
                        ))}
                        {(diseaseInfo.treatment || analysis.treatment || []).length > 2 && (
                          <p className="text-xs text-green-600 font-medium">
                            +{(diseaseInfo.treatment || analysis.treatment).length - 2} {t('farmer.saved_analyses.more_steps')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleShare(analysis)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl text-sm font-medium hover:from-purple-200 hover:to-pink-200 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        {t('farmer.saved_analyses.share')}
                      </button>
                      <button
                        onClick={() => setSelectedAnalysis(analysis)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl text-sm font-medium hover:from-green-200 hover:to-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {t('farmer.saved_analyses.view_details')}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}

        {/* Add Details Modal */}
        {selectedAnalysis && (
          <DetailsModal
            isOpen={!!selectedAnalysis}
            onClose={() => setSelectedAnalysis(null)}
            analysis={selectedAnalysis}
          />
        )}
      </div>
    </div>
  );
};
DetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  analysis: PropTypes.shape({
    condition: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    date: PropTypes.string,
    createdAt: PropTypes.string,
    imageBase64: PropTypes.string.isRequired,
    treatment: PropTypes.arrayOf(PropTypes.string).isRequired,
    predictionClass: PropTypes.string,
    originalPrediction: PropTypes.string
  }).isRequired
};

ShareCard.propTypes = {
  analysis: PropTypes.shape({
    condition: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    imageBase64: PropTypes.string.isRequired,
    treatment: PropTypes.arrayOf(PropTypes.string).isRequired,
    predictionClass: PropTypes.string,
    originalPrediction: PropTypes.string
  }).isRequired
};

export default SavedAnalyses;