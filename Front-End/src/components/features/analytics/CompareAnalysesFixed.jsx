import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDiseaseInfo, getTranslatedConditionName } from '../../../utils/diseaseData';
import { analysisSync } from '../../../utils/analysisSync';

import { Dialog, DialogContent } from '../../shared/ui/dialog';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { 
  Eye, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeftRight, 
  BookOpen, 
  Loader, 
  Target
} from 'lucide-react';

const AnalysisSelectionModal = ({ isOpen, onClose, analyses, onSelect, title, excludeId }) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnalyses = analyses.filter(analysis => 
    analysis._id !== excludeId &&
    (getTranslatedConditionName(analysis.originalPrediction || analysis.predictionClass || analysis.condition, i18n.language)
      .toLowerCase().includes(searchQuery.toLowerCase()) ||
     new Date(analysis.date || analysis.createdAt).toLocaleDateString().includes(searchQuery))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('farmer.saved_analyses.search_placeholder') || 'البحث في التحاليل...'}
              className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Eye className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredAnalyses.map(analysis => {
              const conditionName = getTranslatedConditionName(
                analysis.originalPrediction || analysis.predictionClass || analysis.condition, 
                i18n.language
              );
              const diseaseInfo = getDiseaseInfo(
                analysis.originalPrediction || analysis.predictionClass || analysis.condition, 
                i18n.language
              );
              const analysisDate = new Date(analysis.date || analysis.createdAt).toLocaleDateString();

              return (
                <div
                  key={analysis._id}
                  onClick={() => onSelect(analysis)}
                  className="cursor-pointer bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-green-300 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={analysis.imageBase64.startsWith('data:') ? analysis.imageBase64 : `data:image/jpeg;base64,${analysis.imageBase64}`}
                        alt="Analysis"
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          diseaseInfo.severity === 'Healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {diseaseInfo.severity || analysis.severity}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">
                        {conditionName}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{analysisDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAnalyses.length === 0 && (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {t('farmer.saved_analyses.no_matching_results') || 'لا توجد نتائج مطابقة'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// إضافة PropTypes validation
AnalysisSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  analyses: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  excludeId: PropTypes.string
};

// المكون الرئيسي للمقارنة
const CompareAnalyses = () => {
  const { t, i18n } = useTranslation();
  
  console.log('🔍 CompareAnalyses component rendered');
  
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstAnalysis, setFirstAnalysis] = useState(null);
  const [secondAnalysis, setSecondAnalysis] = useState(null);
  const [showFirstSelection, setShowFirstSelection] = useState(false);
  const [showSecondSelection, setShowSecondSelection] = useState(false);

  // تحميل التحاليل عند بدء التشغيل
  useEffect(() => {
    console.log('🔍 CompareAnalyses useEffect - loading analyses...');
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    console.log('🔍 loadAnalyses function called');
    setLoading(true);
    try {
      console.log('🔍 Calling analysisSync.loadAnalyses()...');
      const result = await analysisSync.loadAnalyses();
      console.log('🔍 analysisSync.loadAnalyses() result:', result);
      
      if (result && result.analyses) {
        console.log('✅ Found analyses:', result.analyses.length, 'items');
        setAnalyses(result.analyses);
      } else {
        console.log('⚠️ No analyses found in result');
        setAnalyses([]);
      }
    } catch (error) {
      console.error("❌ Failed to load analyses:", error);
      toast.error(t('expert.compare.load_error') || 'فشل تحميل التحاليلات');
      setAnalyses([]);
    } finally {
      console.log('🔍 Setting loading to false');
      setLoading(false);
    }
  };

  // الحصول على نتيجة المقارنة
  const getComparisonResult = (first, second) => {
    if (!first || !second) return null;

    const firstInfo = getDiseaseInfo(first.originalPrediction || first.predictionClass || first.condition, i18n.language);
    const secondInfo = getDiseaseInfo(second.originalPrediction || second.predictionClass || second.condition, i18n.language);
    
    const firstHealthy = firstInfo.severity === 'Healthy';
    const secondHealthy = secondInfo.severity === 'Healthy';
    
    let comparisonType = 'neutral';
    let comparisonText = '';
    let icon = <Activity className="w-6 h-6" />;
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-600';
    
    if (firstHealthy && !secondHealthy) {
      comparisonType = 'decline';
      comparisonText = i18n.language === 'ar' ? 'تراجعت الحالة الصحية للنبات' : 'Plant health declined';
      icon = <TrendingDown className="w-6 h-6" />;
      bgColor = 'bg-red-100';
      textColor = 'text-red-600';
    } else if (!firstHealthy && secondHealthy) {
      comparisonType = 'improvement';
      comparisonText = i18n.language === 'ar' ? 'تحسنت الحالة الصحية للنبات 🎉' : 'Plant health improved 🎉';
      icon = <TrendingUp className="w-6 h-6" />;
      bgColor = 'bg-green-100';
      textColor = 'text-green-600';
    } else if (firstHealthy && secondHealthy) {
      comparisonType = 'stable_healthy';
      comparisonText = i18n.language === 'ar' ? 'النبات لا يزال بصحة جيدة ✅' : 'Plant remained healthy ✅';
      icon = <CheckCircle className="w-6 h-6" />;
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-600';
    } else {
      comparisonType = 'stable_unhealthy';
      comparisonText = i18n.language === 'ar' ? 'الحالة المرضية لا تزال موجودة ⚠️' : 'Condition persists ⚠️';
      icon = <AlertTriangle className="w-6 h-6" />;
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-600';
    }

    return { comparisonType, comparisonText, icon, bgColor, textColor };
  };

  // عرض كارت التحليل
  const renderAnalysisCard = (analysis, title, onSelect, onRemove) => {
    if (!analysis) {
      return (
        <div 
          onClick={onSelect}
          className="cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 hover:bg-green-50/50 transition-all duration-300"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <ArrowLeftRight className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">
                {i18n.language === 'ar' ? 'انقر لاختيار تحليل' : 'Click to select analysis'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    const conditionName = getTranslatedConditionName(
      analysis.originalPrediction || analysis.predictionClass || analysis.condition, 
      i18n.language
    );
    const diseaseInfo = getDiseaseInfo(
      analysis.originalPrediction || analysis.predictionClass || analysis.condition, 
      i18n.language
    );
    const analysisDate = new Date(analysis.date || analysis.createdAt).toLocaleDateString();

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="relative">
          <img 
            src={analysis.imageBase64.startsWith('data:') ? analysis.imageBase64 : `data:image/jpeg;base64,${analysis.imageBase64}`}
            alt="Analysis"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4">
            <button
              onClick={onRemove}
              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              diseaseInfo.severity === 'Healthy' 
                ? 'bg-green-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              {diseaseInfo.severity || analysis.severity}
            </span>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <h4 className="text-md font-semibold text-green-700 mb-2">{conditionName}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{analysisDate}</span>
            </div>
          </div>
          
          {diseaseInfo.description && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 line-clamp-3">{diseaseInfo.description}</p>
            </div>
          )}
          
          <button
            onClick={onSelect}
            className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
          >
            {i18n.language === 'ar' ? 'تغيير التحليل' : 'Change Analysis'}
          </button>
        </div>
      </div>
    );
  };

  const comparison = getComparisonResult(firstAnalysis, secondAnalysis);
  return (
    <div className="w-full">
      {console.log('🔍 CompareAnalyses render - Loading:', loading, ', Analyses count:', analyses.length)}
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('expert.compare.compare_analyses') || 'مقارنة التحاليل'}
        </h2>
        <p className="text-gray-600">
          {i18n.language === 'ar' 
            ? `اختر تحليلين للمقارنة بينهما (${analyses.length} تحليل متاح)`
            : `Select two analyses to compare (${analyses.length} analyses available)`
          }
        </p>
        
        {/* معلومات سريعة */}
        <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold">
                📊 عدد التحاليل المتاحة: {analyses.length}
              </p>
              <p className="text-green-600 text-sm mt-1">
                💡 اختر تحليلين من تواريخ مختلفة لمراقبة تطور حالة النبات
              </p>
            </div>
            <button 
              onClick={loadAnalyses}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Loader className="w-4 h-4" />
              إعادة تحميل
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-green-500" />
            <p className="text-gray-600">
              {i18n.language === 'ar' ? 'جاري تحميل التحاليل...' : 'Loading analyses...'}
            </p>
          </div>
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {i18n.language === 'ar' ? 'لا توجد تحاليل محفوظة' : 'No saved analyses'}
          </h3>
          <p className="text-gray-500 mb-4">
            {i18n.language === 'ar' 
              ? 'يجب أن تقوم بحفظ تحليلين على الأقل لاستخدام أداة المقارنة'
              : 'You need to save at least two analyses to use the comparison tool'
            }
          </p>
          <button 
            onClick={loadAnalyses}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            تحميل بيانات تجريبية للاختبار
          </button>
        </div>
      ) : (
        <>
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {renderAnalysisCard(
              firstAnalysis, 
              i18n.language === 'ar' ? 'التحليل الأول (قبل العلاج)' : 'First Analysis (Before Treatment)',
              () => setShowFirstSelection(true),
              () => setFirstAnalysis(null)
            )}
            
            {renderAnalysisCard(
              secondAnalysis, 
              i18n.language === 'ar' ? 'التحليل الثاني (بعد العلاج)' : 'Second Analysis (After Treatment)',
              () => setShowSecondSelection(true),
              () => setSecondAnalysis(null)
            )}
          </div>

          {/* Comparison Result */}
          {comparison && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${comparison.bgColor} ${comparison.textColor}`}>
                  {comparison.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {i18n.language === 'ar' ? 'نتيجة المقارنة' : 'Comparison Result'}
                </h2>
                <p className={`text-lg font-semibold ${comparison.textColor}`}>
                  {comparison.comparisonText}
                </p>
              </div>

              {/* Detailed Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* First Analysis Details */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {i18n.language === 'ar' ? 'قبل العلاج' : 'Before Treatment'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-blue-600">
                        {i18n.language === 'ar' ? 'الحالة المكتشفة:' : 'Detected Condition:'}
                      </span>
                      <p className="font-medium text-blue-800">
                        {getTranslatedConditionName(
                          firstAnalysis.originalPrediction || firstAnalysis.predictionClass || firstAnalysis.condition,
                          i18n.language
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-blue-600">
                        {i18n.language === 'ar' ? 'درجة الخطورة:' : 'Severity Level:'}
                      </span>
                      <p className="font-medium text-blue-800">
                        {getDiseaseInfo(
                          firstAnalysis.originalPrediction || firstAnalysis.predictionClass || firstAnalysis.condition,
                          i18n.language
                        ).severity}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-blue-600">
                        {i18n.language === 'ar' ? 'التاريخ:' : 'Date:'}
                      </span>
                      <p className="font-medium text-blue-800">
                        {new Date(firstAnalysis.date || firstAnalysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparison Arrow */}
                <div className="flex items-center justify-center">
                  <div className="bg-white p-4 rounded-full shadow-lg border-2 border-green-200">
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                {/* Second Analysis Details */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {i18n.language === 'ar' ? 'بعد العلاج' : 'After Treatment'}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-green-600">
                        {i18n.language === 'ar' ? 'الحالة المكتشفة:' : 'Detected Condition:'}
                      </span>
                      <p className="font-medium text-green-800">
                        {getTranslatedConditionName(
                          secondAnalysis.originalPrediction || secondAnalysis.predictionClass || secondAnalysis.condition,
                          i18n.language
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">
                        {i18n.language === 'ar' ? 'درجة الخطورة:' : 'Severity Level:'}
                      </span>
                      <p className="font-medium text-green-800">
                        {getDiseaseInfo(
                          secondAnalysis.originalPrediction || secondAnalysis.predictionClass || secondAnalysis.condition,
                          i18n.language
                        ).severity}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">
                        {i18n.language === 'ar' ? 'التاريخ:' : 'Date:'}
                      </span>
                      <p className="font-medium text-green-800">
                        {new Date(secondAnalysis.date || secondAnalysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!firstAnalysis || !secondAnalysis ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200 mt-6">
              <BookOpen className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {i18n.language === 'ar' ? 'كيفية استخدام أداة المقارنة' : 'How to Use Comparison Tool'}
              </h3>
              <p className="text-gray-600 mb-4">
                {i18n.language === 'ar' 
                  ? 'اختر تحليلين مختلفين لمقارنة التطور في حالة النبات'
                  : 'Select two different analyses to compare plant condition progress'
                }
              </p>
              <div className="space-y-2 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {i18n.language === 'ar' ? 'اختر التحليل الأول (قبل العلاج)' : 'Select first analysis (before treatment)'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {i18n.language === 'ar' ? 'اختر التحليل الثاني (بعد العلاج)' : 'Select second analysis (after treatment)'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {i18n.language === 'ar' ? 'اعرض نتيجة المقارنة والتوصيات' : 'View comparison results and recommendations'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Selection Modals */}
      <AnalysisSelectionModal
        isOpen={showFirstSelection}
        onClose={() => setShowFirstSelection(false)}
        analyses={analyses}
        onSelect={(analysis) => {
          setFirstAnalysis(analysis);
          setShowFirstSelection(false);
          toast.success('تم اختيار التحليل الأول');
        }}
        title={i18n.language === 'ar' ? 'اختر التحليل الأول (قبل العلاج)' : 'Select First Analysis (Before Treatment)'}
        excludeId={secondAnalysis?._id}
      />

      <AnalysisSelectionModal
        isOpen={showSecondSelection}
        onClose={() => setShowSecondSelection(false)}
        analyses={analyses}
        onSelect={(analysis) => {
          setSecondAnalysis(analysis);
          setShowSecondSelection(false);
          toast.success('تم اختيار التحليل الثاني');
        }}
        title={i18n.language === 'ar' ? 'اختر التحليل الثاني (بعد العلاج)' : 'Select Second Analysis (After Treatment)'}
        excludeId={firstAnalysis?._id}      />
    </div>
  );
};

// Set display name for debugging
CompareAnalyses.displayName = 'CompareAnalyses';

// Export default component
export default CompareAnalyses;
