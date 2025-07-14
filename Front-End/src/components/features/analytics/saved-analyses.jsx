import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import searchIcon from '../../../assets/images/search.png';
import { Dialog, DialogContent } from '../../shared/ui/dialog';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { getDiseaseInfo, getTranslatedConditionName } from '../../../utils/diseaseData';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import ar from 'date-fns/locale/ar';
import enUS from 'date-fns/locale/en-US';

// Register locales
registerLocale('ar', ar);
registerLocale('en', enUS);

// Add custom CSS for RTL DatePicker and animations
const datePickerStyle = `
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
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 2px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #10b981;
    border-radius: 2px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #059669;
  }
`;

// Inject CSS
if (typeof document !== 'undefined' && !document.getElementById('datepicker-rtl-styles')) {
  const style = document.createElement('style');
  style.id = 'datepicker-rtl-styles';
  style.textContent = datePickerStyle;
  document.head.appendChild(style);
}

const DetailsModal = ({ isOpen, onClose, analysis }) => {
  const { t, i18n } = useTranslation();
  const dateToShow = new Date(analysis.date || analysis.createdAt).toLocaleDateString();
  
  const conditionDisplayName = getTranslatedConditionName(analysis.originalPrediction || analysis.predictionClass || analysis.condition, i18n.language);
  const diseaseInfo = getDiseaseInfo(analysis.originalPrediction || analysis.predictionClass || analysis.condition, i18n.language);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-8 space-y-6">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center pb-6 border-b border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  {conditionDisplayName}
                </h3>
                <p className="text-gray-600 mt-1">{t('expert.trackplants.analysis_details')}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Status */}
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img 
                  src={`data:image/jpeg;base64,${analysis.imageBase64}`} 
                  alt={t('expert.trackplants.plant_analysis')} 
                  className="w-full h-80 object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">{t('expert.saved_analyses.status')}</div>
                  </div>
                  <div className={`font-bold text-lg ${analysis.severity === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {diseaseInfo.severity || analysis.severity}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">{t('farmer.track_plants.analysis_time')}</div>
                  </div>
                  <div className="font-bold text-lg text-gray-700">{dateToShow}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Treatment Plan */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-green-800">{t('expert.trackplants.treatment_plan')}</h4>
                </div>
                
                <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
                  {(diseaseInfo.treatment || analysis.treatment).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        {idx + 1}
                      </div>
                      <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ShareCard = ({ analysis }) => {
  const { t, i18n } = useTranslation();
  const conditionDisplayName = getTranslatedConditionName(analysis.originalPrediction || analysis.predictionClass || analysis.condition, i18n.language);
  const diseaseInfo = getDiseaseInfo(analysis.originalPrediction || analysis.predictionClass || analysis.condition, i18n.language);
  
  const analysisDate = new Date(analysis.date || Date.now());
  const formattedDate = analysisDate.toLocaleDateString();
  const formattedTime = analysisDate.toLocaleTimeString();

  return (
    <div id="share-card" className="bg-gradient-to-br from-white to-green-50 p-10 rounded-3xl shadow-2xl border border-green-200" style={{ width: '900px', minHeight: '700px' }}>
      <div className="flex flex-col gap-8">
        {/* Enhanced Header */}
        <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                {t('expert.trackplants.plant_analysis')}
              </h2>
              <p className="text-gray-600 mt-1">AgriAI Analysis Report</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-green-700 font-semibold">{formattedDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Image and Plant Info */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img 
                src={`data:image/jpeg;base64,${analysis.imageBase64}`} 
                alt={t('expert.trackplants.analysis_result')} 
                className="w-full h-80 object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">{t('expert.trackplants.analyzed_plant')}</div>
                  <div className="font-bold text-lg text-gray-800">{t('expert.trackplants.track_plants')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">{t('expert.trackplants.detected_condition')}</div>
                  <div className={`font-bold text-xl ${conditionDisplayName.toLowerCase().includes('healthy') ? 'text-green-600' : 'text-red-600'}`}>
                    {conditionDisplayName}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-yellow-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">{t('expert.trackplants.status')}</div>
                  <div className={`font-bold text-xl ${analysis.severity === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {diseaseInfo.severity || analysis.severity}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Plan Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-800">{t('expert.trackplants.treatment_plan')}</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {(diseaseInfo.treatment || analysis.treatment).slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  {idx + 1}
                </div>
                <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <div className="font-bold text-green-800">{t('farmer.trackplants.analyzed_by')} AgriAI</div>
              <div className="text-sm text-gray-600">Advanced Plant Health Analysis</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{t('farmer.track_plants.analysis_time')}</div>
            <div className="font-semibold text-gray-700">{formattedDate} • {formattedTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const handleShare = async (analysis, t) => {
  try {
    toast.loading(t('expert.trackplants.preparing_image'));
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

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
        const file = new File([blob], 'plant-analysis.png', { type: 'image/png' });
        const shareData = {
          files: [file],
          title: t('expert.trackplants.share_title'),
          text: t('expert.trackplants.share_text')
        };
        if (await navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success(t('expert.trackplants.shared_success'));
          return;
        }
      } catch {
        // fallback to download
      }
    }
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'plant-analysis.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('expert.trackplants.image_downloaded'));
  } catch (error) {
    toast.error(t('expert.trackplants.failed_generate_image'), error);
  } finally {
    toast.dismiss();
  }
};

const SavedAnalysess = () => {
  const { t, i18n } = useTranslation(); // Get i18n in addition to t
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Add this to force re-renders when language changes
  
  // Add useEffect to listen for language changes
  useEffect(() => {
    // Force re-render when language changes
    setRefreshKey(prev => prev + 1);
  }, [i18n.language]);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = () => {
    try {
      const saved = localStorage.getItem('plantAnalysisExpert');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnalyses(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };
  const filteredAnalyses = useMemo(() => {
    return analyses.filter(analysis => {
      // Use correct field priority for translation
      const conditionToTranslate = analysis.originalPrediction || analysis.predictionClass || analysis.condition;
      const translatedCondition = getTranslatedConditionName(conditionToTranslate, i18n.language);
      const matchesSearch = 
        (analysis.condition && analysis.condition.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (analysis.originalPrediction && analysis.originalPrediction.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (analysis.predictionClass && analysis.predictionClass.toLowerCase().includes(searchQuery.toLowerCase())) ||
        translatedCondition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (analysis.severity && analysis.severity.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!dateFilter) return matchesSearch;
      const analysisDate = new Date(analysis.date || analysis.createdAt).toLocaleDateString();
      const filterDate = new Date(dateFilter).toLocaleDateString();
      return matchesSearch && analysisDate === filterDate;
    });
  }, [analyses, searchQuery, dateFilter, i18n.language]);

  const handleDelete = (id) => {
    if (window.confirm(t('expert.saved_analyses.confirm_delete'))) {
      try {
        const updated = analyses.filter(analysis => (analysis._id || analysis.id) !== id);
        localStorage.setItem('plantAnalysisExpert', JSON.stringify(updated));
        setAnalyses(updated);
        toast.success(t('expert.trackplants.analysis_saved_success'));
      } catch {
        toast.error(t('expert.trackplants.failed_to_save'));
      }
    }
  };
  // When displaying disease info from saved analyses, process on-the-fly
  const processAnalysisForDisplay = (analysis) => {
    // Use correct field priority: originalPrediction || predictionClass || condition
    const conditionToTranslate = analysis.originalPrediction || analysis.predictionClass || analysis.condition;
    
    if (conditionToTranslate) {
      const diseaseInfo = getDiseaseInfo(conditionToTranslate, i18n.language);
      return {
        ...analysis,
        condition: getTranslatedConditionName(conditionToTranslate, i18n.language),
        description: diseaseInfo.description,
        severity: diseaseInfo.severity || analysis.severity,
        treatment: diseaseInfo.treatment || analysis.treatment
      };
    }
    
    // For cases where no condition data is available
    return {
      ...analysis,
      condition: analysis.condition || t('expert.saved_analyses.unknown_condition')
    };
  };

  // Use this function when displaying or sharing an analysis
  const prepareAnalysisForDisplay = (analysis) => {
    return processAnalysisForDisplay(analysis);
  };

  // Modify your existing view/share handlers
  const handleViewDetails = (analysis) => {
    setSelectedAnalysis(prepareAnalysisForDisplay(analysis));
  };

  const handleShareUpdated = (analysis) => {
    handleShare(prepareAnalysisForDisplay(analysis), t);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 pb-24" key={refreshKey}> 
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link 
                to="../trackplants" 
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('expert.saved_analyses.back')}
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    {t('expert.saved_analyses.saved_analyses')}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredAnalyses.length} {t('expert.saved_analyses.analyses')} {t('expert.saved_analyses.of')} {analyses.length}
                  </p>
                </div>
              </div>
            </div>
            <Link 
              to="../trackplants" 
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('expert.saved_analyses.new_analysis')}
            </Link>
          </div>
        </div>
        {/* Enhanced Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <img src={searchIcon} alt={t('market.search')} className="w-5 h-5 filter brightness-0 invert" />
                </div>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('expert.saved_analyses.search_analyses')}
                className="w-full px-4 py-4 pl-16 pr-4 border-2 border-green-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-400 transition-all duration-300 bg-white/90 backdrop-blur-sm placeholder-gray-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-gray-600 font-bold">✕</span>
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <DatePicker
                selected={dateFilter ? new Date(dateFilter) : null}
                onChange={(date) => setDateFilter(date?.toISOString().split('T')[0] || '')}
                className="w-full sm:w-64 px-4 py-4 pl-14 pr-12 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 bg-white/90 backdrop-blur-sm"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-200 hover:bg-purple-300 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-purple-700 font-bold">✕</span>
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Enhanced Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">{t('expert.saved_analyses.loading')}</p>
          </div>
        )}

        {/* Enhanced Empty State */}
        {!loading && filteredAnalyses.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100 py-16 px-8">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {searchQuery ? t('expert.saved_analyses.no_matching_analyses') : t('expert.saved_analyses.no_analyses')}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 
                  'Try adjusting your search terms or date filter' : 
                  'Start analyzing plants to see your saved results here'
                }
              </p>
              {!searchQuery && (
                <Link 
                  to="../trackplants" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('expert.saved_analyses.new_analysis')}
                </Link>
              )}
            </div>
          </div>
        )}
        {/* Enhanced Analysis Cards Grid */}
        {!loading && filteredAnalyses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis, index) => {
              // Process each analysis with current language
              const displayAnalysis = processAnalysisForDisplay(analysis);
              return (
                <div 
                  key={analysis._id || analysis.id} 
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-green-100 hover:shadow-2xl hover:border-green-200 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Card Header */}
                  <div className="relative p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {new Date(displayAnalysis.date || displayAnalysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h2 className="font-bold text-lg text-gray-800 leading-tight">
                          {displayAnalysis.condition && displayAnalysis.condition.trim() !== '' ? 
                            displayAnalysis.condition : t('expert.saved_analyses.unknown_condition')}
                        </h2>
                      </div>
                      <button
                        onClick={() => handleDelete(displayAnalysis._id || displayAnalysis.id)}
                        className="group/delete p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                        title={t('expert.saved_analyses.delete')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover/delete:scale-110" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" 
                         style={{
                           background: displayAnalysis.severity === 'Healthy' ? 
                             'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 
                             'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                         }}>
                      <div className={`w-2 h-2 rounded-full ${displayAnalysis.severity === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className={displayAnalysis.severity === 'Healthy' ? 'text-green-700' : 'text-yellow-700'}>
                        {displayAnalysis.severity}
                      </span>
                    </div>
                  </div>

                  {/* Plant Image */}
                  <div className="px-6 pb-4">
                    <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <img 
                        src={`data:image/jpeg;base64,${displayAnalysis.imageBase64}`} 
                        alt={t('expert.trackplants.plant_analysis')} 
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>

                  {/* Treatment Information */}
                  <div className="px-6 pb-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-100">
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('expert.saved_analyses.treatment')}
                      </h4>
                      <ul className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar">
                        {displayAnalysis.treatment.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                        {displayAnalysis.treatment.length > 3 && (
                          <li className="text-xs text-gray-500 italic">
                            +{displayAnalysis.treatment.length - 3} more steps...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShareUpdated(displayAnalysis)}
                        className="flex-1 group/share px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover/share:scale-110" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        {t('expert.saved_analyses.share')}
                      </button>
                      <button
                        onClick={() => handleViewDetails(displayAnalysis)}
                        className="flex-1 group/view px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <svg className="h-4 w-4 transition-transform group-hover/view:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {t('expert.trackplants.view_details')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
    condition: PropTypes.string,
    originalPrediction: PropTypes.string,
    predictionClass: PropTypes.string,
    severity: PropTypes.string.isRequired,
    date: PropTypes.string,
    createdAt: PropTypes.string,
    imageBase64: PropTypes.string.isRequired,
    treatment: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};
ShareCard.propTypes = {
  analysis: PropTypes.shape({
    condition: PropTypes.string,
    originalPrediction: PropTypes.string,
    predictionClass: PropTypes.string,
    severity: PropTypes.string.isRequired,
    date: PropTypes.string,
    createdAt: PropTypes.string,
    imageBase64: PropTypes.string.isRequired,
    treatment: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};

export default SavedAnalysess;