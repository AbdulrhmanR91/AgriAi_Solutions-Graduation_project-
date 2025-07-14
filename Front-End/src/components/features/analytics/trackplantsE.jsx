import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDiseaseInfo, getTranslatedConditionName } from '../../../utils/diseaseData';
import { Card, CardHeader, CardContent } from '../../shared/ui/card.js';
import { Dialog, DialogContent } from '../../shared/ui/dialog.js';
import user from "/src/assets/images/user.png";
import { 
  getExpertProfile, 
  getFarmersSummary, 
  getVisitStats, 
  createFarmerVisit, 
  updateVisitStatus,
  updateFarmerVisit,
  deleteFarmerVisit,
  getFarmerVisits,
  getImageUrl 
} from '../../../utils/apiService';
import { storage } from '../../../utils/storage';
import toast from 'react-hot-toast';
import axios from 'axios';
// import html2canvas from 'html2canvas';
// import ReactDOM from 'react-dom/client';
import PropTypes from 'prop-types';
import embeddedService from '../../../services/embeddedService';
import { AnalysisSyncService } from '../../../utils/analysisSync';
import { 
  Microscope, 
  Sparkles, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Leaf, 
  Zap, 
  Book, 
  Camera, 
  Upload,
  Users,
  Calendar,
  Phone,
  Clock,
  Plus,
  Edit3,
  Trash2,
  X,
  UserCheck
} from 'lucide-react';
import WeatherRecommendations from '../../common/WeatherRecommendations';
import WeatherTab from '../../common/WeatherTab';

// Add custom CSS animations
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.2); }
    50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.4); }
  }
  
  .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-glow { animation: glow 2s ease-in-out infinite; }
  .hover\\:scale-102:hover { transform: scale(1.02); }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

// Create sync service instance for expert analyses
const expertAnalysisSync = new AnalysisSyncService('plantAnalysisExpert'); // Use expert-specific key

// Enhanced AnalysisCard with glassmorphism effect
const AnalysisCard = React.forwardRef(({ children }, ref) => (
  <div ref={ref} className="analysis-card transform hover:scale-105 transition-all duration-300">
    <Card className="bg-gradient-to-br from-white/90 to-green-50/80 backdrop-blur-lg border border-green-200/40 shadow-2xl rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-100/20 pointer-events-none"></div>
      <div className="relative z-10">
        {children}
      </div>
    </Card>
  </div>
));
AnalysisCard.propTypes = { children: PropTypes.node.isRequired };
AnalysisCard.displayName = 'AnalysisCard';

// Enhanced ShareCard with modern design for experts
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
      className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-green-200/50" 
      style={{ width: '800px', minHeight: '600px' }}
    >
      <div className="flex flex-col gap-6 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-2xl"></div>
        
        {/* Enhanced Header */}
        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
              <Microscope className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              {t('expert.trackplants.plant_analysis')} - Expert Report
            </h2>
          </div>
          <p className="text-gray-500 font-medium">{new Date().toLocaleDateString()}</p>
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-2 gap-8 relative z-10">
          {/* Left Column - Enhanced Image */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <img 
                src={`data:image/jpeg;base64,${resultImageBase64}`}
                alt={t('expert.trackplants.analysis_result')} 
                className="relative w-full h-80 object-cover rounded-2xl shadow-2xl transform group-hover:scale-105 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                <Leaf className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{t('common.description')}</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-blue-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <div className="text-sm text-gray-500 font-medium">{t('expert.trackplants.analyzed_plant')}</div>
              </div>
              <div className="font-bold text-xl text-gray-800">{plantDisplayName}</div>
            </div>
          </div>

          {/* Right Column - Enhanced Details */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-blue-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <div className="text-sm text-gray-500 font-medium">{t('expert.trackplants.detected_condition')}</div>
              </div>
              <div className={`font-bold text-xl flex items-center gap-2 ${
                conditionDisplayName.toLowerCase().includes('healthy') ? 'text-green-600' : 'text-red-600'
              }`}>
                {conditionDisplayName.toLowerCase().includes('healthy') ? 
                  <CheckCircle className="w-6 h-6" /> : 
                  <AlertTriangle className="w-6 h-6" />
                }
                {conditionDisplayName}
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-blue-100/50 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <div className="text-sm text-gray-500 font-medium">{t('expert.trackplants.status')}</div>
              </div>
              <div className={`font-bold text-xl ${
                predictionResult.severity === 'Healthy' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {predictionResult.severity}
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-blue-100/50 shadow-lg">
              <div className="text-sm text-gray-500 mb-3 font-medium">{t('expert.trackplants.description')}</div>
              <p className="text-gray-700 leading-relaxed">{predictionResult.description}</p>
            </div>
          </div>
        </div>        {/* Enhanced Treatment Plan - Only show if treatment array is not empty */}
        {predictionResult.treatment && predictionResult.treatment.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50/50 p-8 rounded-2xl border border-green-200/50 shadow-lg relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Book className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-xl text-green-800">{t('expert.trackplants.treatment_plan')}</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {predictionResult.treatment.map((item, index) => (
                <div key={index} className="flex items-start gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-green-100/50">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Status Details */}
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-blue-100/50 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div className="text-sm text-gray-500 font-medium">{t('expert.trackplants.confidence_level')}</div>
            </div>
            <div className="font-bold text-xl text-green-600">{predictionResult.confidence}</div>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-blue-100/50 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <div className="text-sm text-gray-500 font-medium">{t('expert.trackplants.analysis_time')}</div>
            </div>
            <div className="font-bold text-xl text-gray-700">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-gradient-to-r from-blue-200 to-indigo-200 relative z-10">
          <div className="flex items-center gap-3 text-gray-500 font-medium">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
              <Leaf className="w-5 h-5 text-blue-600" />
            </div>
            <span>{t('expert.trackplants.analyzed_by')} AgriAI Expert 🔬</span>
          </div>
          <div className="text-gray-500 font-medium">{new Date().toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
};
ShareCard.propTypes = {
  resultImageBase64: PropTypes.string.isRequired,
  predictionClass: PropTypes.string.isRequired,
  predictionResult: PropTypes.shape({
    severity: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    treatment: PropTypes.arrayOf(PropTypes.string).isRequired,
    confidence: PropTypes.string.isRequired
  }).isRequired
};

const DetailsModal = ({ isOpen, onClose, diseaseInfo, predictionClass }) => {
  const { t, i18n } = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center pb-4 border-b border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {getTranslatedConditionName(predictionClass, i18n.language)}
                </h3>
                <p className="text-gray-600 mt-1">{t('expert.trackplants.analysis_details')}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Image and Status */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl shadow-lg">
                <img 
                  src={`data:image/jpeg;base64,${diseaseInfo.imageBase64}`} 
                  alt={t('expert.trackplants.plant_analysis')} 
                  className="w-full h-80 object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="text-sm text-gray-500 font-medium">{t('expert.trackplants.status')}</div>
                  </div>
                  <div className={`font-bold text-lg ${diseaseInfo.severity === 'Healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {diseaseInfo.severity}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div className="text-sm text-gray-500 font-medium">{t('expert.trackplants.analysis_time')}</div>
                  </div>
                  <div className="font-bold text-lg text-blue-600">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Description and Treatment */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Book className="w-5 h-5 text-purple-500" />
                  <h4 className="text-lg font-semibold text-gray-800">{t('expert.trackplants.description')}</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">{diseaseInfo.description}</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-md border border-green-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-green-800">{t('expert.trackplants.recommended_treatment')}</h4>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {diseaseInfo.treatment.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-green-100">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 leading-relaxed">{item}</span>
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
  const { t, i18n } = useTranslation();
  
  console.log('🔍 PlantTrackingPage component rendered');
  
  // Modal states - all defaulted to false to prevent unintended opening
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showVisitDeleteConfirmation, setShowVisitDeleteConfirmation] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Content states
  const [itemToDelete, setItemToDelete] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [selectedMode, setSelectedMode] = useState('upload');
  const [predictionClass, setPredictionClass] = useState('');
  const [resultImageBase64, setResultImageBase64] = useState('');  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Loading states for buttons
  // const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const analysisCardRef = useRef(null);
  const [isEmbeddedMonitoring, setIsEmbeddedMonitoring] = useState(false);
  const [liveImage, setLiveImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);  const [imageSelectionMode, setImageSelectionMode] = useState('upload'); // 'upload' or 'camera'
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' أو 'visits' أو 'compare'
  
  console.log('🔍 Current activeTab:', activeTab);
  
  // Weather states
  const [showWeatherTab, setShowWeatherTab] = useState(false);
  
  const initialFarmerState = {
  farmerName: '',
  farmerPhone: '',
  farmerEmail: '',
  farmerImage: '',
  totalVisits: 0,
  needsFollowUp: 0,
  lastVisitDate: '',
  lastProblem: '',
  lastStatus: 'pending',
  _id: ''
};
  // Farmer visits states - Modal states explicitly set to false to prevent auto-opening
  const [farmersSummary, setFarmersSummary] = useState([]);
  const [visitStats, setVisitStats] = useState({});
  const [selectedFarmer, setSelectedFarmer] = useState(initialFarmerState);
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [showEditVisitModal, setShowEditVisitModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  // Fix: Remove this incorrect state that was causing issues
  // const [setShowDeleteConfirm] = useState(false);
  const [deletingVisitId, setDeletingVisitId] = useState(null);
  const [newVisitData, setNewVisitData] = useState({
    farmerName: '',
    farmerPhone: '',
    farmName: '',
    farmLocation: '',
    visitDate: new Date().toISOString().split('T')[0],
    problemDescription: '',
    expertNotes: '',
    priority: 'medium'
  });
  const [loadingVisits, setLoadingVisits] = useState(false);
  
  // const BASE_URL = 'http://localhost:5000';
  const API_URL = 'https://abdulrhmanr91-agriai.hf.space/predict/';

const getProfileImage = (imagePath) => {
    if (!imagePath) return user;
    return getImageUrl(imagePath);
  };

  const handleDelete = (item) => {
  setItemToDelete(item);
  setShowDeleteConfirmation(true);
};

  const FarmerDetailsModal = ({ farmer, onClose, onAddVisit, onUpdateStatus }) => {
    // Check for valid farmer object and required properties before rendering
    if (!farmer || !farmer._id) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">تفاصيل المزارع</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full overflow-hidden">
              {farmer.farmerImage ? (
                <img 
                  src={getImageUrl(farmer.farmerImage)} 
                  alt={farmer.farmerName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = user;
                    e.target.onerror = null;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-green-200 flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">{farmer.farmerName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{farmer.farmerPhone || 'لا يوجد رقم هاتف'}</span>
              </div>
              {farmer.farmerEmail && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-600 text-sm">{farmer.farmerEmail}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-xl">
              <p className="text-sm text-blue-600">إجمالي الزيارات</p>
              <p className="text-xl font-bold text-blue-700">{farmer.totalVisits}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl">
              <p className="text-sm text-orange-600">تحتاج متابعة</p>
              <p className="text-xl font-bold text-orange-700">{farmer.needsFollowUp}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">آخر زيارة:</p>
              <p className="text-gray-800">
                {farmer.lastVisitDate 
                  ? new Date(farmer.lastVisitDate).toLocaleDateString('ar-EG')
                  : 'لم يتم تسجيل زيارة'
                }
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">آخر مشكلة:</p>
              <p className="text-gray-800">{farmer.lastProblem || 'لا توجد مشكلة مسجلة'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">حالة المتابعة:</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-3 h-3 rounded-full ${
                  farmer.lastStatus === 'completed' ? 'bg-green-500' :
                  farmer.lastStatus === 'in_progress' ? 'bg-blue-500' :
                  farmer.lastStatus === 'needs_followup' ? 'bg-orange-500' :
                  'bg-gray-400'
                }`}></span>
                <span className="text-gray-800">
                  {farmer.lastStatus === 'completed' ? 'مكتملة' :
                   farmer.lastStatus === 'in_progress' ? 'قيد التنفيذ' :
                   farmer.lastStatus === 'needs_followup' ? 'يحتاج متابعة' :
                   'في الانتظار'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onAddVisit(farmer._id)}
              className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة زيارة جديدة
            </button>
            {farmer.lastStatus === 'needs_followup' && (
              <button
                onClick={() => onUpdateStatus(farmer._id, 'completed')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                تحديث الحالة
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

// Add PropTypes for type checking
FarmerDetailsModal.propTypes = {
  farmer: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    farmerName: PropTypes.string.isRequired,
    farmerPhone: PropTypes.string,
    farmerEmail: PropTypes.string,
    farmerImage: PropTypes.string,
    totalVisits: PropTypes.number.isRequired,
    needsFollowUp: PropTypes.number.isRequired,
    lastVisitDate: PropTypes.string,
    lastProblem: PropTypes.string,
    lastStatus: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onAddVisit: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired
};
  useEffect(() => {
    console.log('🔍 PlantTrackingPage useEffect - Loading expert profile...');
    const loadExpertProfile = async () => {
      try {
        console.log('🔍 Starting expert profile load...');
        const data = await getExpertProfile();
        console.log('✅ Expert profile loaded successfully:', data);
        setProfileImage(getProfileImage(data.profileImage));
      } catch (error) {
        console.error('❌ Failed to load expert profile:', error);
        toast.error(t('expert.trackplants.failed_load_profile'));
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        console.log('🔍 Setting loading to false...');
        setLoading(false);
      }
    };
    loadExpertProfile();
  }, [navigate, t, setLoading]);
 

  // Helper function to get display URL for images
  const getImageDisplayUrl = (image) => {
    if (!image) return null;
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return image; // already a URL string
  };

  const handleImageChange = (event) => {
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
              <h3 class="text-lg font-bold mb-4 text-center text-gray-800">${t('expert.trackplants.take_photo')}</h3>
              <div class="relative">
                <video autoplay playsinline muted class="w-full rounded-lg mb-4 bg-gray-200" style="aspect-ratio: 4/3; object-fit: cover;"></video>
                <div class="flex gap-3 justify-center">
                  <button id="capture-btn" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
                    ${t('expert.trackplants.capture')}
                  </button>
                  <button id="cancel-btn" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-medium">
                    ${t('expert.trackplants.cancel')}
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
                toast.success(t('expert.trackplants.image_captured'));
              }, 'image/jpeg', 0.9);
            } else {
              toast.error(t('expert.trackplants.camera_not_ready'));
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
          toast.error(t('expert.trackplants.camera_error'));
        });
    } else {
      toast.error(t('expert.trackplants.camera_not_supported'));
    }
  };
  const handleUpload = async () => {
    if (!selectedImage) {
      alert(t('expert.trackplants.select_image'));
      return;
    }
    
    setIsAnalyzing(true);
    
    let file = null;
    
    // Check if selectedImage is a File object or blob URL
    if (selectedImage instanceof File) {
      // Direct file from upload
      file = selectedImage;
    } else {
      // Fallback: Get file from input for regular uploads
      const fileInput = document.querySelector('input[type="file"]');
      file = fileInput?.files[0];
      
      if (!file) {
        alert(t('expert.trackplants.no_file_selected'));
        return;
      }
    }
    
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });      const { prediction, image } = response.data;
      setPredictionClass(prediction);
      setResultImageBase64(image);
      
      // Check if the prediction is for allowed plants (Corn, Potato, Tomato)
      const allowedPlants = ['Corn', 'Potato', 'Tomato'];
      const predictedPlant = (prediction || '').split('___')[0];
      const isAllowedPlant = allowedPlants.some(plant => 
        predictedPlant.toLowerCase().includes(plant.toLowerCase())
      );
      
      if (!isAllowedPlant) {
        // Show as unknown condition for non-allowed plants
        setPredictionResult({
          condition: i18n.language === 'ar' ? 'حالة غير معروفة' : 'Unknown Condition',
          confidence: "Medium",
          severity: i18n.language === 'ar' ? 'غير محدد' : 'Unspecified',
          description: i18n.language === 'ar' 
            ? 'تم اكتشاف حالة غير معروفة. يرجى استشارة خبير زراعي للحصول على تشخيص دقيق.'
            : 'An unknown condition has been detected. Please consult an agricultural expert for accurate diagnosis.',
          treatment: []
        });      } else {
        // Process normally for allowed plants
        const diseaseInfo = getDiseaseInfo(prediction,i18n.language);
        const isHealthy = prediction.toLowerCase().includes('healthy');
        const translatedConditionName = getTranslatedConditionName(prediction, i18n.language);
        
        setPredictionResult({
          condition: translatedConditionName, // Use translated name instead of raw condition
          confidence: "High",
          severity: isHealthy ? (i18n.language === 'ar' ? 'سليم' : 'Healthy') : diseaseInfo.severity,
          description: diseaseInfo.description,
          treatment: isHealthy
            ? [t('expert.trackplants.healthy_care'), ...diseaseInfo.treatment]
            : [t('expert.trackplants.consult_expert'),
                t('expert.trackplants.monitor_area'),
                ...diseaseInfo.treatment]
        });
      }
    } catch (error) {
      alert(t('expert.trackplants.prediction_failed',error));
    } finally {
      setIsAnalyzing(false);
    }
  };
  

    
  //   try {
  //     // Check if we're in a mobile app (React Native WebView)
  //     const isMobileApp = window.ReactNativeWebView !== undefined;
      
  //     if (isMobileApp) {
  //       console.log('Running in mobile app, using mobile-optimized sharing');
        
  //       // Prepare analysis data for mobile
  //       const analysisData = {
  //         id: Date.now().toString(),
  //         date: new Date().toISOString(),
  //         condition: getTranslatedConditionName(predictionClass, i18n.language),
  //         originalPrediction: predictionClass,
  //         severity: predictionResult.severity || 'Unknown',
  //         confidence: predictionResult.confidence || 'High',
  //         description: predictionResult.description || '',
  //         treatment: predictionResult.treatment || [],
  //         imageBase64: resultImageBase64,
  //         title: 'تقرير تحليل الخبير - AgriAI Expert'
  //       };
        
  //       // Method 1: Try mobile bridge for report generation
  //       if (window.MobileBridge && window.MobileBridge.generateReport) {
  //         const success = await window.MobileBridge.generateReport(analysisData, `expert-analysis-${Date.now()}.pdf`);
  //         if (success) {
  //           toast.success(i18n.language === 'ar' ? 'تم إنتاج التقرير بنجاح!' : 'Report generated successfully!');
  //           return;
  //         }
  //       }
        
  //       // Method 2: Send data to mobile app for sharing
  //       window.ReactNativeWebView.postMessage(JSON.stringify({
  //         type: 'shareAnalysis',
  //         analysisData: analysisData,
  //         shareType: 'expert_report'
  //       }));
        
  //       toast.success(i18n.language === 'ar' ? 'جاري مشاركة التحليل...' : 'Sharing analysis...');
  //       return;
  //     }

  //     // Web version with html2canvas
  //     toast.loading(t('expert.trackplants.preparing_image'));
  //     const container = document.createElement('div');
  //     container.style.position = 'absolute';
  //     container.style.left = '-9999px';
  //     document.body.appendChild(container);
  //     const root = ReactDOM.createRoot(container);
  //     root.render(
  //       <ShareCard 
  //         resultImageBase64={resultImageBase64}
  //         predictionClass={predictionClass}
  //         predictionResult={predictionResult}
  //       />
  //     );
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //     const shareCard = container.querySelector('#share-card');
  //     const canvas = await html2canvas(shareCard, {
  //       useCORS: true,
  //       scale: 2,
  //       backgroundColor: 'white',
  //       logging: false
  //     });
  //     root.unmount();
  //     document.body.removeChild(container);
      
  //     if (navigator.share && navigator.canShare) {
  //       try {
  //         const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
  //         const file = new File([blob], 'expert-plant-analysis.png', { type: 'image/png' });
  //         const shareData = {
  //           files: [file],
  //           title: t('expert.trackplants.share_title'),
  //           text: t('expert.trackplants.share_text')
  //         };
  //         if (navigator.canShare(shareData)) {
  //           await navigator.share(shareData);
  //           toast.success(t('expert.trackplants.shared_success'));
  //           return;
  //         }
  //       } catch (shareError) {
  //         console.error('Error sharing:', shareError);
  //       }
  //     }
      
  //     // Fallback to download
  //     const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.style.display = 'none';
  //     a.href = url;
  //     a.download = 'expert-plant-analysis.png';
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //     toast.success(t('expert.trackplants.image_downloaded'));
  //   } catch (error) {
  //     console.error('Error sharing:', error);
  //     toast.error(t('expert.trackplants.failed_generate_image'));
  //   } finally {
  //     setIsSharing(false);
  //     toast.dismiss();
  //   }
  // };
  const handleSaveResult = async () => {
    if (!predictionResult || !resultImageBase64 || !predictionClass) {
      toast.error(t('expert.trackplants.no_analysis_to_save'));
      return;
    }

    setIsSaving(true);

    try {
      // Extract plant type and condition
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
        confidence: predictionResult.confidence || 'High',
        description: predictionResult.description || '',
        treatment: predictionResult.treatment || [],
        imageBase64: resultImageBase64
      };

      console.log('Saving expert analysis with data:', {
        condition: analysisData.condition,
        severity: analysisData.severity,
        hasImage: !!analysisData.imageBase64,
        treatmentCount: Array.isArray(analysisData.treatment) ? analysisData.treatment.length : 0
      });

      // Use the expert sync service for dual persistence
      const result = await expertAnalysisSync.saveAnalysis(analysisData);
      
      if (result.success) {
        if (result.savedToDatabase) {
          toast.success(i18n.language === 'ar' ? '✅ تم حفظ تحليل الخبير في قاعدة البيانات بنجاح!' : '✅ Expert analysis saved to database successfully!');
        } else if (result.savedToLocalStorage) {
          toast.success(i18n.language === 'ar' ? '⚠️ تم حفظ تحليل الخبير محلياً (سيتم المزامنة لاحقاً)' : '⚠️ Expert analysis saved locally (will sync later)');
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error saving expert analysis:', error);
      toast.error(`${i18n.language === 'ar' ? 'فشل في حفظ التحليل: ' : 'Failed to save analysis: '}${error.message}`);    } finally {
      setIsSaving(false);
    }  };

  const renderAnalysisResults = () => (
    <>
      <AnalysisCard ref={analysisCardRef}>
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {i18n.language === 'ar' ? 'اكتمل تحليل الخبير' : 'Expert Analysis Complete'}
            </h2>
          </div>
          <p className="text-gray-600">{i18n.language === 'ar' ? 'نتائج كشف الأمراض المهني' : 'Professional disease detection results'}</p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Plant Condition Display */}
          <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-200/50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-xl"></div>
            
            <div className="relative z-10">              <div className="flex items-center justify-center gap-3 mb-4">
                <Microscope className="w-8 h-8 text-green-500" />
                <h3 className="text-xl font-bold text-gray-800">{i18n.language === 'ar' ? 'تشخيص الخبير' : 'Expert Diagnosis'}</h3>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {getTranslatedConditionName(predictionClass, i18n.language)}
              </div>              <div className="text-lg text-gray-600">
                {i18n.language === 'ar' ? 'مستوى الثقة: ' : 'Confidence: '}<span className="font-semibold text-green-600">{predictionResult.confidence}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Image and Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Enhanced Image Section */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl shadow-xl group">
                <img 
                  src={`data:image/jpeg;base64,${resultImageBase64}`}
                  alt={t('expert.trackplants.analysis_result')} 
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{i18n.language === 'ar' ? 'عرض الخبير' : 'Expert View'}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Status Details */}
            <div className="space-y-4">                <div className="bg-gradient-to-r from-gray-50 to-green-50/50 p-6 rounded-2xl border border-green-100/50 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="text-sm text-gray-500 font-medium">{i18n.language === 'ar' ? 'الحالة المكتشفة' : 'Detected Condition'}</div>
                  </div>
                <div className={`font-bold text-lg ${
                  predictionClass.includes('healthy') ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {getTranslatedConditionName(predictionClass, i18n.language)}
                </div>
              </div>
              
              {predictionResult && (                <div className="bg-gradient-to-r from-gray-50 to-green-50/50 p-6 rounded-2xl border border-green-100/50 shadow-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <div className="text-sm text-gray-500 font-medium">{i18n.language === 'ar' ? 'مستوى الخطورة' : 'Severity Level'}</div>
                  </div>
                  <div className={`font-bold text-lg ${
                    predictionClass.includes('healthy') ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {predictionResult.severity}
                  </div>
                </div>
              )}
              
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-blue-100/50 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <div className="text-sm text-gray-500 font-medium">Analysis Time</div>
                </div>
                <div className="font-bold text-lg text-gray-700">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Enhanced Description */}
          {/* {predictionResult && (
            <div className="bg-gradient-to-br from-white/90 to-blue-50/70 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center">
                    <Book className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{t('common.description')}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{predictionResult.description}</p>
              </div>
            </div>
          )}           */}
          <div className="flex flex-wrap gap-4 justify-center pt-6">
            {/* <button
              onClick={() => setShowDetails(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              {i18n.language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
            </button> */}
            
            <button
              onClick={handleSaveResult}
              disabled={isSaving}
              className="bg-gradient-to-r from-teal-600 to-green-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-teal-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {isSaving ? 
                (i18n.language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : 
                (i18n.language === 'ar' ? 'حفظ النتائج' : 'Save Results')
              }            </button>
            
           
          </div>
        </CardContent>
      </AnalysisCard>      {/* Enhanced Treatment Plan Section */}
      {predictionResult && (
        <div className="bg-gradient-to-br from-white/90 to-green-50/70 backdrop-blur-sm p-8 rounded-3xl border border-green-200/50 relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-green-200/20 to-lime-200/20 rounded-full blur-lg"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center">
                <Book className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{t('common.Recommendation')}</h3>
            </div>
            
            {/* Conditional rendering based on condition type */}
            {(predictionResult.condition === 'Unknown Condition' || predictionResult.condition === 'حالة غير معروفة') ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-amber-100/50">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-700 font-medium leading-relaxed">
                      {i18n.language === 'ar' 
                        ? 'نعمل على إضافة المزيد من النباتات إلى نموذجنا للتحليل. حتى نتمكن من دعم هذا النوع من النباتات، يمكنك استشارة أحد خبرائنا الزراعيين المتاحين أدناه للحصول على تشخيص دقيق ومساعدة متخصصة.'
                        : 'We are working on adding more plants to our analysis model. Until we can support this type of plant, you can consult with one of our agricultural experts available below for accurate diagnosis and specialized assistance.'}
                    </p>
                    
                    
                  </div>
                </div>
              </div>
            ) : (
              predictionResult.treatment && predictionResult.treatment.length > 0 && (
                <div className="space-y-4">
                  {predictionResult.treatment.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-green-100/50">
                      <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {predictionResult && showDetails && (
        <DetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          diseaseInfo={{
            condition: predictionResult.condition,
            severity: predictionResult.severity,
            description: predictionResult.description,
            treatment: predictionResult.treatment,
            imageBase64: resultImageBase64,
            predictionClass: predictionClass
          }}
          predictionClass={predictionClass}
        />
      )}
    </>
  );

  const renderUploadSection = () => (
    <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-green-200/60 p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
          <Leaf className="w-7 h-7 text-green-600" />
          {t('expert.trackplants.upload_image')}
        </h2>
        <p className="text-gray-600">{t('expert.trackplants.Professional plant disease analysis for experts')}</p>
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
            <div className="font-semibold">{t('farmer.track_plants.upload_from_device')}</div>
            <div className="text-sm opacity-75">{t('farmer.track_plants.choose_from_gallery')}</div>
          </div>
        </button> */}
        
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

      <div className="upload-area mb-6">
        {imageSelectionMode === 'upload' ? (
          <label htmlFor="imageUpload" className="block">            <div className="border-2 border-dashed border-green-300 rounded-2xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer bg-gradient-to-br from-green-50/50 to-emerald-50/50">              {selectedImage ? (
                <div className="relative">
                  <img 
                    src={getImageDisplayUrl(selectedImage)} 
                    alt={t('farmer.track_plants.Selected')}
                    className="max-h-64 mx-auto rounded-xl shadow-lg"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="mt-4 text-green-600 font-medium">
                    {t('farmer.track_plants.ready')}
                  </div>
                </div>
              ) : (
                <div className="py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {t('farmer.track_plants.drag_drop_here')}
                  </p>
                  <p className="text-gray-600 mb-4">
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
          </label>        ) : (
          <div className="border-2 border-dashed border-green-300 rounded-2xl p-8 text-center bg-green-50">
            {selectedImage ? (              <div className="relative">
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
                <button
                  onClick={handleCameraCapture}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t('farmer.track_plants.take_another')}
                </button>
              </div>
            ) : (
              <div className="py-12">
                <div className="w-16 h-16 bg-green-500 text-white rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-xl font-semibold text-gray-700 mb-4">
                  {t('farmer.track_plants.ready_to_capture')}
                </p>
                <p className="text-gray-600 mb-6">
                  {t('farmer.track_plants.click_to_open_camera')}
                </p>              <button
                onClick={handleCameraCapture}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                  {t('farmer.track_plants.open_camera')}
                </button>
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
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t('expert.trackplants.analyzing')}
            </>
          ) : (
            <>
              <Microscope className="w-5 h-5" />
              {t('expert.trackplants.analyze_image')}
            </>
          )}
        </button>
      </div>
      
      {predictionResult && renderAnalysisResults()}
    </div>
  );

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

  // Add this useEffect to set up live image callback when the selectedMode changes
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

  const handleCapture = () => {
    if (!isEmbeddedMonitoring || !liveImage) {
      toast.error(t('expert.trackplants.camera_not_active'));
      return;
    }
    if (capturedImage) {
      setCapturedImage(null);
    } else {
      setCapturedImage(liveImage);
    }
  };

  const handleEmbeddedAnalyze = async () => {
    if (!capturedImage) {
      toast.error(t('expert.trackplants.no_image_captured'));
      return;
    }
    setIsAnalyzing(true);
    try {
      // Convert base64 to Blob
      const blob = await fetch(`data:image/jpeg;base64,${capturedImage}`).then(res => res.blob());
      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });      const { prediction, image } = response.data;
      setPredictionClass(prediction);
      setResultImageBase64(image);
      
      // Check if the prediction is for allowed plants (Corn, Potato, Tomato)
      const allowedPlants = ['Corn', 'Potato', 'Tomato'];
      const predictedPlant = (prediction || '').split('___')[0];
      const isAllowedPlant = allowedPlants.some(plant => 
        predictedPlant.toLowerCase().includes(plant.toLowerCase())
      );
      
      if (!isAllowedPlant) {
        // Show as unknown condition for non-allowed plants
        setPredictionResult({
          condition: i18n.language === 'ar' ? 'حالة غير معروفة' : 'Unknown Condition',
          confidence: "Medium",
          severity: i18n.language === 'ar' ? 'غير محدد' : 'Unspecified',
          description: i18n.language === 'ar' 
            ? 'تم اكتشاف حالة غير معروفة. يرجى استشارة خبير زراعي للحصول على تشخيص دقيق.'
            : 'An unknown condition has been detected. Please consult an agricultural expert for accurate diagnosis.',
          treatment: []
        });      } else {
        // Process normally for allowed plants
        const diseaseInfo = getDiseaseInfo(prediction, i18n.language);
        const isHealthy = prediction.toLowerCase().includes('healthy');
        const translatedConditionName = getTranslatedConditionName(prediction, i18n.language);
        
        setPredictionResult({
          condition: translatedConditionName, // Use translated name instead of raw condition
          confidence: "High",
          severity: isHealthy ? (i18n.language === 'ar' ? 'سليم' : 'Healthy') : diseaseInfo.severity,
          description: diseaseInfo.description,
          treatment: isHealthy
            ? [t('expert.trackplants.healthy_care'), ...diseaseInfo.treatment]
            : [t('expert.trackplants.consult_expert'),
                t('expert.trackplants.monitor_area'),
                ...diseaseInfo.treatment]
        });
      }
      
      
      // Modified: Properly reset to live stream mode after analysis
      setTimeout(() => {
        setCapturedImage(null);
        // Restart streaming if needed
        if (selectedMode === 'embedded' && !isEmbeddedMonitoring) {
          setIsEmbeddedMonitoring(true);
          embeddedService.startStreaming((imageBase64) => {
            setLiveImage(imageBase64);
          });
        }
      }, 1000);
    } catch (error) {
      console.error('Analysis error:', error);
      // Also add error recovery to restore camera stream
      setCapturedImage(null); // Clear failed image immediately
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderEmbeddedSection = () => (
    <div className="space-y-4">
      <Card className="mb-4">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('expert.trackplants.live_camera_system')}</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Live Camera Feed - Always show the live feed, not the captured image */}
            <div className="mb-4">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {liveImage ? (
                  <img
                    src={`data:image/jpeg;base64,${liveImage}`}
                    alt={t('expert.trackplants.live_camera_feed')}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      {isEmbeddedMonitoring ? t('expert.trackplants.connecting') : t('expert.trackplants.camera_inactive')}
                    </p>
                  </div>
                )}
                
                {/* Camera Controls - Only Capture/Retake button remains on camera */}
                {isEmbeddedMonitoring && !isAnalyzing && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    {/* Capture/Retake Button */}
                    <button
                      onClick={handleCapture}
                      className={`px-6 py-3 ${capturedImage 
                        ? 'bg-yellow-500 hover:bg-yellow-600' 
                        : 'bg-green-500 hover:bg-green-600'} 
                        text-white rounded-full transition-colors
                        flex items-center gap-2 shadow-lg`}
                    >
                      {capturedImage ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v10a2 2 0 01-2 2H7a2 2 0 01-2-2V10m11 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
                          </svg>
                          {t('expert.trackplants.retake')}
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h2l.4-2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2m4 0h-2l-.4-2M7 7h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {t('expert.trackplants.capture')}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Captured Image Section - Display below the camera */}
            {capturedImage && !isAnalyzing && (
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="text-sm text-gray-500 mb-3 font-medium">
                  {t('expert.trackplants.captured_image')}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/2">
                    <img
                      src={`data:image/jpeg;base64,${capturedImage}`}
                      alt={t('expert.trackplants.captured_image')}
                      className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                  <div className="md:w-1/2 flex flex-col justify-center gap-4">
                    <p className="text-gray-600">
                      {t('expert.trackplants.ready_to_analyze')}
                    </p>
                    <button
                      onClick={handleEmbeddedAnalyze}
                      disabled={isAnalyzing}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
                    >
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('expert.trackplants.analyzing')}
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 012-2h6a2 2 0 012 2v2m4 0h-2l-.4-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {t('expert.trackplants.analyze_image')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-3 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
                  <p className="text-green-700 font-medium">{t('expert.trackplants.analyzing_plant')}</p>
                </div>
              </div>
            )}
            {/* Connection Status */}
            <div className="flex items-center gap-2 bg-white p-4 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                isEmbeddedMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`} />
              <span className="text-sm text-gray-600">
                {isEmbeddedMonitoring ? t('expert.trackplants.camera_active') : t('expert.trackplants.camera_inactive')}
              </span>
              {capturedImage && (
                <span className="ml-auto text-sm text-green-600">
                  {t('expert.trackplants.image_captured')}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Analysis Results */}
      {predictionResult && renderAnalysisResults()}
    </div>
  );

  // Load farmer visits data
  const loadFarmerVisitsData = async (bustCache = false) => {
    setLoadingVisits(true);
    console.log('Loading farmer visits data, bustCache:', bustCache);
    try {
      const [summaryResponse, statsResponse] = await Promise.all([
        getFarmersSummary(bustCache),
        getVisitStats(bustCache)
      ]);

      console.log('Summary response:', summaryResponse);
      console.log('Stats response:', statsResponse);

      if (summaryResponse.success) {
        console.log('Setting farmers summary:', summaryResponse.data);
        setFarmersSummary(summaryResponse.data || []);
      }
      
      if (statsResponse.success) {
        console.log('Setting visit stats:', statsResponse.data);
        setVisitStats(statsResponse.data || {});
      }
    } catch (error) {
      console.error('Error loading farmer visits data:', error);
      toast.error('Failed to load farmer visits data');
    } finally {
      setLoadingVisits(false);
    }
  };

  // Get visit ID for a farmer
  const getVisitIdForFarmer = async (farmerName) => {
    try {
      // Get all visits for this expert and find the latest one for this farmer
      const response = await getFarmerVisits();
      if (response.success && response.data) {
        const farmerVisits = response.data.filter(visit => visit.farmerName === farmerName);
        if (farmerVisits.length > 0) {
          // Sort by date and get the most recent
          const latestVisit = farmerVisits.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate))[0];
          return latestVisit._id;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting visit ID for farmer:', error);
      return null;
    }
  };
  const handleAddVisit = async () => {
    // Debug current user
    const session = storage.getSession();
    console.log('Current user session:', session);
    console.log('User type:', session?.user?.userType);
    console.log('Token present:', session?.token ? 'Yes' : 'No');
    
    if (!newVisitData.farmerName || !newVisitData.problemDescription || !newVisitData.farmName || !newVisitData.farmLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await createFarmerVisit(newVisitData);
      if (response.success) {
        toast.success('Visit added successfully');
        setShowAddVisitModal(false);
        setNewVisitData({
          farmerName: '',
          farmerPhone: '',
          farmName: '',
          farmLocation: '',
          visitDate: new Date().toISOString().split('T')[0],
          problemDescription: '',
          expertNotes: '',
          priority: 'medium'
        });
        loadFarmerVisitsData(true); // Reload data with cache busting
      }
    } catch (error) {
      console.error('Error adding visit:', error);
      toast.error('Failed to add visit');
    }
  };

  // Update visit status
  const handleUpdateVisitStatus = async (visitId, status) => {
    console.log('=== UPDATE VISIT STATUS ===');
    console.log('Visit ID:', visitId);
    console.log('New Status:', status);
    
    try {
      const response = await updateVisitStatus(visitId, status);
      console.log('Update response:', response);
      if (response.success) {
        toast.success('Visit status updated successfully');
        loadFarmerVisitsData(true); // Reload data with cache busting
      }
    } catch (error) {
      console.error('Error updating visit status:', error);
      toast.error('Failed to update visit status');
    }
  };

  // Edit visit
  const handleEditVisit = (visit) => {
    setEditingVisit(visit);
    setNewVisitData({
      farmerName: visit.farmerName,
      farmerPhone: visit.farmerPhone || '',
      farmName: visit.farmName,
      farmLocation: visit.farmLocation,
      visitDate: new Date(visit.visitDate).toISOString().split('T')[0],
      problemDescription: visit.problemDescription,
      expertNotes: visit.expertNotes || '',
      priority: visit.priority
    });
    setShowEditVisitModal(true);
  };

  // Update visit
  const handleUpdateVisit = async () => {
    if (!newVisitData.farmerName || !newVisitData.problemDescription || !newVisitData.farmName || !newVisitData.farmLocation) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await updateFarmerVisit(editingVisit._id, newVisitData);
      if (response.success) {
        toast.success('Visit updated successfully');
        setShowEditVisitModal(false);
        setEditingVisit(null);
        setNewVisitData({
          farmerName: '',
          farmerPhone: '',
          farmName: '',
          farmLocation: '',
          visitDate: new Date().toISOString().split('T')[0],
          problemDescription: '',
          expertNotes: '',
          priority: 'medium'
        });
        loadFarmerVisitsData(true); // Reload data with cache busting
      }
    } catch (error) {
      console.error('Error updating visit:', error);
      toast.error('Failed to update visit');
    }
  };

  // Delete visit
  const handleDeleteVisit = async () => {
    try {
      const response = await deleteFarmerVisit(deletingVisitId);
      if (response.success) {
        toast.success('Visit deleted successfully');
        setShowVisitDeleteConfirmation(false);
        setDeletingVisitId(null);
        loadFarmerVisitsData(true); // Reload data with cache busting
      }
    } catch (error) {
      console.error('Error deleting visit:', error);
      toast.error('Failed to delete visit');
    }
  };

  // Confirm delete
  const confirmDeleteVisit = (visitId) => {
    setDeletingVisitId(visitId);
    setShowVisitDeleteConfirmation(true);
  };  // Load farmer visits data when visits tab is active
  useEffect(() => {
    if (activeTab === 'visits') {
      loadFarmerVisitsData();
    }
  }, [activeTab]);

  // Add this effect to update disease info when language changes
  useEffect(() => {
    if (predictionClass && resultImageBase64) {
      // Re-process the disease information with the new language
      const diseaseInfo = getDiseaseInfo(predictionClass, i18n.language);
      const isHealthy = predictionClass.toLowerCase().includes('healthy');
      
      // Extract detected condition from prediction string
      const [, conditionRaw] = (predictionClass || '___').split('___');
      const detectedCondition = conditionRaw ? conditionRaw.replace(/_/g, ' ') : 'Healthy';
      
      // Update the prediction result with the new language
      setPredictionResult({
        condition: detectedCondition,
        confidence: "High",
        severity: isHealthy ? "Healthy" : diseaseInfo.severity,
        description: diseaseInfo.description,
        treatment: isHealthy
          ? [t('expert.trackplants.healthy_care'), ...diseaseInfo.treatment]
          : [t('expert.trackplants.consult_expert'),
             t('expert.trackplants.monitor_area'),
             ...diseaseInfo.treatment]
      });
    }
  }, [i18n.language, predictionClass, resultImageBase64, t]);

  if (loading) {
    return (      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('expert.trackplants.Loading Expert Analysis...')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 relative pb-40">
      {/* Simple Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-green-300/15 rounded-full blur-2xl"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-green-200/25 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-green-300/20 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative p-2 sm:p-4">        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-green-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link to="/expert/profile" className="group">
                <div className="relative">
                  <div className="w-12 h-12 bg-green-500 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                    <img 
                      src={profileImage || user}
                      alt="Expert Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = user;
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
              </Link>
              
              <div>
                <h1 className="text-2xl font-bold text-green-700">
                  {t('expert.trackplants.Expert Plant Analysis')}
                </h1>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-500" />
                  {t('expert.trackplants.Professional Disease Detection System')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/expert/savedanalyses" 
                className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-all duration-300 shadow-md flex items-center gap-2"
              >
                <Book className="w-4 h-4" />
                {t('expert.trackplants.view_saved_results')}
              </Link>
              <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Plant Expert AI</span>
              </div>
            </div>
          </div>
        </div>        {/* Weather Recommendations - New Separate Component */}
        <WeatherRecommendations 
          className="mb-8" 
          onViewDetails={() => setShowWeatherTab(true)}
          showViewMoreButton={true}
        />        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-1 shadow-lg border border-green-200">
            <div className="flex">              <button
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'analysis' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => {
                  console.log('🔍 Switching to analysis tab');
                  setActiveTab('analysis');
                }}
              >
                <Microscope className="w-4 h-4" />
                <span>تحليل النباتات</span>
              </button>
              <button
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'visits' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                onClick={() => {
                  console.log('🔍 Switching to visits tab');
                  setActiveTab('visits');
                }}
              >
                <Users className="w-4 h-4" />                <span>ملاحظات زيارات المزارعين</span>              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analysis' && (
          <>            {/* Mode Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div 
                onClick={() => setSelectedMode('upload')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedMode === 'upload' 
                    ? 'border-green-400 bg-green-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMode === 'upload' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{t('expert.trackplants.upload')}</h3>
                    <p className="text-sm text-gray-600">{t('expert.trackplants.Upload and analyze plant images')}</p>
                  </div>
                </div>
                {selectedMode === 'upload' && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-100 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">محدد حالياً</span>
                  </div>
                )}
              </div>

              <div 
                onClick={() => setSelectedMode('embedded')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedMode === 'embedded' 
                    ? 'border-green-400 bg-green-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMode === 'embedded' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{t('expert.trackplants.live_camera_system')}</h3>
                    <p className="text-sm text-gray-600">{t('expert.trackplants.Real-time camera analysis')}</p>
                  </div>
                </div>
                {selectedMode === 'embedded' && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-100 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">محدد حالياً</span>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Content */}
            <div className="mb-8">
              {selectedMode === 'upload' ? renderUploadSection() : renderEmbeddedSection()}
            </div>
          </>
        )}        {activeTab === 'visits' && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-green-200 p-6">
            {loadingVisits ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">جاري تحميل بيانات الزيارات...</p>
              </div>
            ) : (
              <div>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">إجمالي الزيارات</p>
                        <p className="text-2xl font-bold text-green-700">{visitStats.totalVisits || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500 rounded-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-yellow-600 font-medium">في الانتظار</p>
                        <p className="text-2xl font-bold text-yellow-700">{visitStats.pendingVisits || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-orange-600 font-medium">يحتاج متابعة</p>
                        <p className="text-2xl font-bold text-orange-700">{visitStats.needsFollowUp || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">مكتملة</p>
                        <p className="text-2xl font-bold text-green-700">{visitStats.completedVisits || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>               {/* Add Visit Section */}
        <div className="bg-green-50 p-6 rounded-2xl border border-green-200 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                قائمة المزارعين والزيارات
              </h3>
              <p className="text-gray-600">تتبع جميع زياراتك وملاحظاتك الزراعية</p>
            </div>
            <button
              onClick={() => setShowAddVisitModal(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-all duration-300 shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة ملاحظة جديدة
            </button>
          </div>
        </div>               {/* Farmers List */}
        {farmersSummary.length === 0 ? (
          <div className="text-center py-16 bg-green-50 rounded-2xl border border-green-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">لا توجد ملاحظات زيارات مسجلة</h3>
            <p className="text-gray-600 mb-2">ابدأ برحلة تتبع زياراتك للمزارعين</p>
            <p className="text-gray-500 text-sm mb-6">انقر على &quot;إضافة ملاحظة جديدة&quot; لبدء التسجيل والمتابعة</p>
            
            <button
              onClick={() => setShowAddVisitModal(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-all duration-300 shadow-md flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              ابدأ الآن - أضف أول ملاحظة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmersSummary.map((farmer) => (
              <div 
                key={farmer._id} 
                className="bg-gradient-to-br from-white to-green-50/30 p-6 rounded-3xl border border-green-200/60 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer backdrop-blur-sm relative overflow-hidden group"
                onClick={() => setSelectedFarmer(farmer)}
              >
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-teal-200/15 to-green-200/15 rounded-full blur-lg group-hover:scale-125 transition-transform duration-700"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              {farmer.farmerImage ? (
                                <img 
                                  src={getImageUrl(farmer.farmerImage)} 
                                  alt={farmer.farmerName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = user;
                                    e.target.onerror = null;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-200 to-emerald-200 flex items-center justify-center">
                                  <Users className="w-8 h-8 text-green-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-xl group-hover:text-green-700 transition-colors duration-300">{farmer.farmerName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600 font-medium">{farmer.farmerPhone}</span>
                              </div>
                            </div>
                          </div>
                          
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                              <Calendar className="w-4 h-4 text-green-600" />
                              <span className="text-gray-600">آخر زيارة: </span>
                              <span className="font-semibold text-green-700">
                                {farmer.lastVisitDate 
                                  ? new Date(farmer.lastVisitDate).toLocaleDateString('ar-EG')
                                  : 'لم يتم تسجيل زيارة'
                                }
                              </span>
                            </div>
                            
                            <div className="flex items-start gap-2 text-sm bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-2xl border border-orange-100">
                              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                              <div>
                                <span className="text-gray-600">المشكلة: </span>
                                <span className="font-semibold text-orange-700">
                                  {farmer.lastProblem || 'لا توجد مشكلة مسجلة'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3">
                              <div className="flex items-center gap-3">
                                <span className={`w-4 h-4 rounded-full shadow-md ${
                                  farmer.lastStatus === 'completed' ? 'bg-green-500' :
                                  farmer.lastStatus === 'in_progress' ? 'bg-blue-500' :
                                  farmer.lastStatus === 'needs_followup' ? 'bg-orange-500' :
                                  'bg-gray-400'
                                }`}></span>
                                <span className="text-sm font-bold">
                                  {farmer.lastStatus === 'completed' ? 'مكتملة' :
                                   farmer.lastStatus === 'in_progress' ? 'قيد التنفيذ' :
                                   farmer.lastStatus === 'needs_followup' ? 'يحتاج متابعة' :
                                   'في الانتظار'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full font-bold border border-green-200">
                                  {farmer.totalVisits} زيارة
                                </span>
                                {farmer.needsFollowUp > 0 && (
                                  <span className="text-xs bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-3 py-1.5 rounded-full font-bold border border-orange-200">
                                    يحتاج متابعة
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Enhanced Action buttons */}
                            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-green-100">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  console.log('Edit button clicked, farmer data:', farmer);
                                  let visitId = farmer.lastVisitId;
                                if (!visitId) {
                                  visitId = await getVisitIdForFarmer(farmer.farmerName);
                                }
                                if (!visitId) {
                                  toast.error('لا يمكن العثور على معرف الزيارة');
                                  return;
                                }
                                handleEditVisit({
                                  _id: visitId,
                                  farmerName: farmer.farmerName,
                                  farmerPhone: farmer.farmerPhone,
                                  farmName: farmer.farmName,
                                  farmLocation: farmer.farmLocation,
                                  visitDate: farmer.lastVisitDate,
                                  problemDescription: farmer.lastProblem,
                                  expertNotes: farmer.lastExpertNotes,
                                  priority: farmer.lastPriority,
                                  followUpStatus: farmer.lastStatus
                                });
                              }}
                              className="flex-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-2 rounded-xl text-xs hover:from-green-200 hover:to-emerald-200 transition-all duration-300 flex items-center justify-center gap-1 font-medium shadow-sm"
                            >
                              <Edit3 className="w-3 h-3" />
                              تعديل
                            </button>
                            
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                console.log('Status button clicked, farmer data:', farmer);
                                let visitId = farmer.lastVisitId;
                                if (!visitId) {
                                  visitId = await getVisitIdForFarmer(farmer.farmerName);
                                }
                                if (!visitId) {
                                  toast.error('لا يمكن العثور على معرف الزيارة');
                                  return;
                                }
                                const newStatus = farmer.lastStatus === 'completed' ? 'pending' : 'completed';
                                handleUpdateVisitStatus(visitId, newStatus);
                              }}
                              className={`flex-1 px-3 py-2 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-1 font-medium shadow-sm ${
                                farmer.lastStatus === 'completed' 
                                  ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 hover:from-amber-200 hover:to-yellow-200' 
                                  : 'bg-gradient-to-r from-teal-100 to-green-100 text-teal-700 hover:from-teal-200 hover:to-green-200'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              {farmer.lastStatus === 'completed' ? 'إعادة فتح' : 'إكمال'}
                            </button>
                            
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                console.log('Delete button clicked, farmer data:', farmer);
                                let visitId = farmer.lastVisitId;                                if (!visitId) {
                                  visitId = await getVisitIdForFarmer(farmer.farmerName);
                                }
                                if (!visitId) {
                                  toast.error('لا يمكن العثور على معرف الزيارة');
                                  return;
                                }
                                confirmDeleteVisit(visitId);
                              }}
                              className="flex-1 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 px-3 py-2 rounded-xl text-xs hover:from-red-200 hover:to-pink-200 transition-all duration-300 flex items-center justify-center gap-1 font-medium shadow-sm"                            >
                              <Trash2 className="w-3 h-3" />
                              حذف                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>              )}
            </div>
          )}

       {/* Share Card (Hidden) */}
    <div className="fixed -top-[9999px] -left-[9999px] pointer-events-none">
      <ShareCard 
        resultImageBase64={resultImageBase64}
        predictionClass={predictionClass}
        predictionResult={predictionResult}
      />
    </div>
  </div> 
)}

        {/* Add Visit Modal */}
        {showAddVisitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">إضافة ملاحظة زيارة جديدة</h3>
                  <button
                    onClick={() => setShowAddVisitModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المزارع <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVisitData.farmerName}
                      onChange={(e) => setNewVisitData({ ...newVisitData, farmerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="اسم المزارع"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم هاتف المزارع
                    </label>
                    <input
                      type="tel"
                      value={newVisitData.farmerPhone}
                      onChange={(e) => setNewVisitData({ ...newVisitData, farmerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="رقم الهاتف"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ الزيارة
                    </label>
                    <input
                      type="date"
                      value={newVisitData.visitDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewVisitData({ ...newVisitData, visitDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المزرعة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVisitData.farmName}
                      onChange={(e) => setNewVisitData({ ...newVisitData, farmName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="اسم المزرعة"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      موقع المزرعة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVisitData.farmLocation}
                      onChange={(e) => setNewVisitData({ ...newVisitData, farmLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="عنوان المزرعة"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف المشكلة <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newVisitData.problemDescription}
                      onChange={(e) => setNewVisitData({ ...newVisitData, problemDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-24 resize-none"
                      placeholder="اشرح المشكلة التي يواجهها المزارع..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملاحظات الخبير
                    </label>
                    <textarea
                      value={newVisitData.expertNotes}
                      onChange={(e) => setNewVisitData({ ...newVisitData, expertNotes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-20 resize-none"
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأولوية
                    </label>
                    <select
                      value={newVisitData.priority}
                      onChange={(e) => setNewVisitData({ ...newVisitData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجلة</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddVisit}
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300"
                  >
                    إضافة الزيارة
                  </button>
                  <button
                    onClick={() => setShowAddVisitModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedFarmer && (
  <FarmerDetailsModal
    farmer={selectedFarmer}
    onClose={() => setSelectedFarmer(initialFarmerState)}
    onAddVisit={(id) => {
      setNewVisitData({
        ...newVisitData,
        farmerId: id
      });
      setShowAddVisitModal(true);
      setSelectedFarmer(initialFarmerState);
    }}
    onUpdateStatus={handleUpdateVisitStatus}
  />
)}
           
        

        {/* Edit Visit Modal */}
        {showEditVisitModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">تعديل الزيارة</h3>
                  <button
                    onClick={() => {
                      setShowEditVisitModal(false);
                      setEditingVisit(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المزارع <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVisitData.farmerName}
                      onChange={(e) => setNewVisitData({ ...newVisitData, farmerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="اسم المزارع"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم هاتف المزارع
                    </label>
                    <input
                      type="tel"
                      value={newVisitData.farmerPhone}
                      onChange={(e) => setNewVisitData({ ...newVisitData, farmerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="رقم الهاتف"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ الزيارة
                    </label>
                    <input
                      type="date"
                      value={newVisitData.visitDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewVisitData({ ...newVisitData, visitDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المزرعة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVisitData.farmName}
                      onChange={(e) => setNewVisitData({ ...newVisitData, farmName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="اسم المزرعة"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      موقع المزرعة <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVisitData.farmLocation}
                      onChange={(e) => setNewVisitData({ ...newVisitData, farmLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="عنوان المزرعة"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف المشكلة <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newVisitData.problemDescription}
                      onChange={(e) => setNewVisitData({ ...newVisitData, problemDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-24 resize-none"
                      placeholder="اشرح المشكلة التي يواجهها المزارع..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملاحظات الخبير
                    </label>
                    <textarea
                      value={newVisitData.expertNotes}
                      onChange={(e) => setNewVisitData({ ...newVisitData, expertNotes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-24 resize-none"
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأولوية
                    </label>
                    <select
                      value={newVisitData.priority}
                      onChange={(e) => setNewVisitData({ ...newVisitData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجلة</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowEditVisitModal(false);
                    setEditingVisit(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleUpdateVisit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300"
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
{showDeleteConfirmation && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
      <h3 className="text-lg font-bold text-gray-900 mb-4">تأكيد الحذف</h3>
      <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا العنصر؟</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowDeleteConfirmation(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
        >
          إلغاء
        </button>
        <button
          onClick={() => {
            handleDelete(itemToDelete);
            setShowDeleteConfirmation(false);
            setItemToDelete(null);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          حذف
        </button>
      </div>
    </div>
  </div>
)}


{/* Visit Delete Confirmation Modal */}
{showVisitDeleteConfirmation && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
        <p className="text-gray-600 mb-6">
          هل أنت متأكد من أنك تريد حذف هذه الزيارة؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowVisitDeleteConfirmation(false);
              setDeletingVisitId(null);
            }}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              handleDeleteVisit();
            }}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"          >
            حذف
          </button>
        </div>
      </div>
    </div>
  </div>
)}

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
}
export default PlantTrackingPage;
