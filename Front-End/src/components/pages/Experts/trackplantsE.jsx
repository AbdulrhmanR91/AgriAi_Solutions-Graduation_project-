import { Card, CardHeader, CardContent } from '../ui/card';
import { Link } from 'react-router-dom';
// import searchIcon from '../../../assets/images/search.png';
import tomatoImage from '../../../assets/images/Tomato.jpg';
import user from "/src/assets/images/user.png";
import React, { useState, useEffect, useRef } from 'react';
import { getExpertProfile } from '../../../utils/apiService';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '../ui/dialog';
import toast from 'react-hot-toast';
import axios from 'axios';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import PropTypes from 'prop-types';
import {  getDiseaseInfo } from '../../../utils/diseaseData';

const OrderModal = ({ isOpen, onClose, onSubmit, loading }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-lg font-bold">Request Consultation</h3>
        <textarea
          name="problem"
          placeholder="Describe your problem..."
          className="w-full h-32 p-2 border rounded-md"
          required
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-green-300"
          >
            {loading ? 'Sending...' : 'Send Request'}
          </button>
            </div>
      </form>
    </DialogContent>
  </Dialog>
);

OrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

const AnalysisCard = React.forwardRef(({ children }, ref) => (
  <div ref={ref} className="analysis-card">
    <Card className="bg-white/50 backdrop-blur-sm border border-green-100">
      {children}
    </Card>
  </div>
));

AnalysisCard.propTypes = {
  children: PropTypes.node.isRequired
};

AnalysisCard.displayName = 'AnalysisCard';

const ShareCard = ({ resultImageBase64, predictionClass, predictionResult }) => (
  <div 
    id="share-card" 
    className="bg-white p-8 rounded-lg shadow-lg" 
    style={{ width: '800px', minHeight: '600px' }}
  >
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Plant Analysis Results 🌿</h2>
        <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Image */}
        <div className="space-y-4">
          <img 
            src={`data:image/jpeg;base64,${resultImageBase64}`}
            alt="Analysis Result" 
            className="w-full h-72 object-cover rounded-lg shadow-md"
          />
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Analyzed Plant</div>
            <div className="font-medium text-lg">
              {predictionClass.split('___')[0].replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Detected Condition</div>
            <div className={`font-bold text-lg ${
              predictionClass.includes('healthy') ? 'text-green-600' : 'text-red-600'
            }`}>
              {predictionClass.split('___')[1].replace(/_/g, ' ') || 'Healthy'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className={`font-bold text-lg ${
              predictionClass.includes('healthy') ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {predictionResult.severity}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">Description</div>
            <p className="text-gray-700">{predictionResult.description}</p>
          </div>
        </div>
      </div>

      {/* Treatment Plan */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3">Treatment Plan</h3>
        <div className="grid grid-cols-2 gap-4">
          {predictionResult.treatment.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-600 flex-shrink-0">•</span>
              <span className="text-gray-700 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-500">
          Analyzed by AgriAI 🌱
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  </div>
);

ShareCard.propTypes = {
  resultImageBase64: PropTypes.string.isRequired,
  predictionClass: PropTypes.string.isRequired,
  predictionResult: PropTypes.object.isRequired
};

const DetailsModal = ({ isOpen, onClose, diseaseInfo }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent 
      className="sm:max-w-3xl" 
      style={{ zIndex: 9999 }}
    >
      <div className="overflow-y-auto" style={{ maxHeight: '80vh' }}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-green-800">{diseaseInfo.condition}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className={`font-medium ${
                 diseaseInfo.severity === 'Healthy' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                { diseaseInfo.severity}
              </div>
            </div>


            {/* Image */}
            <div className="row-span-2">
              <img 
                src={`data:image/jpeg;base64,${diseaseInfo.imageBase64}`}
                alt="Plant Analysis"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Description</div>
              <p className="text-gray-700">{diseaseInfo.description}</p>
            </div>
          </div>

          {/* Treatment Plan */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-3">Recommended Treatment</h4>
            <ol className="space-y-2">
              {diseaseInfo.treatment.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-green-600">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

DetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  diseaseInfo: PropTypes.shape({
    condition: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    treatment: PropTypes.arrayOf(PropTypes.string).isRequired,
    imageBase64: PropTypes.string.isRequired
  }).isRequired
};

const PlantTrackingPage = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [selectedMode, setSelectedMode] = useState('upload'); // 'upload' or 'embedded'
  const [predictionClass, setPredictionClass] = useState('');
  const [resultImageBase64, setResultImageBase64] = useState('');
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisCardRef = useRef(null);
  const [showDetails, setShowDetails] = useState(false);


  const BASE_URL = 'https://dark-gennifer-abdulrhman-5d081501.koyeb.app';
  const API_URL = 'https://abdulrhmanr91-agriai.hf.space/predict/';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return user;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BASE_URL}${imagePath}`;
  };

  useEffect(() => {
    const loadFarmerProfile = async () => {
      try {
        const data = await getExpertProfile();
        setExperts(data);
        setProfileImage(getImageUrl(data.profileImage));
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
  }, [navigate, setLoading]);

 
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      // Reset all prediction-related states
      setPredictionResult(null);
      setPredictionClass('');
      setResultImageBase64('');
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image first!");
      return;
    }

    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];
    
    if (!file) {
      alert("No file selected");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const { prediction, image } = response.data;
      setPredictionClass(prediction);
      setResultImageBase64(image);
      
      // Get disease info using new helper function
      const diseaseInfo = getDiseaseInfo(prediction);
      const isHealthy = prediction.toLowerCase().includes('healthy');
      
      setPredictionResult({
        condition: diseaseInfo.name,
        confidence: "High",
        severity: isHealthy ? "Healthy" : diseaseInfo.severity,
        description: diseaseInfo.description,
        treatment: isHealthy ? 
          ["Plant appears healthy! Continue with regular care.", ...diseaseInfo.treatment] :
          [
            "Consider consulting with an agricultural expert",
            "Monitor the affected areas closely",
            ...diseaseInfo.treatment
          ]
      });

      // Save analysis to localStorage
      const newAnalysis = {
        id: Date.now(),
        condition: diseaseInfo.name,
        severity: isHealthy ? "Healthy" : diseaseInfo.severity,
        imageBase64: image,
        treatment: isHealthy ? 
          ["Plant appears healthy! Continue with regular care.", ...diseaseInfo.treatment] :
          [
            "Consider consulting with an agricultural expert",
            "Monitor the affected areas closely",
            ...diseaseInfo.treatment
          ],
        date: new Date()
      };
      handleSaveAnalysis(newAnalysis);

    } catch (error) {
      console.error("Error details:", error);
      alert("Failed to get prediction. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add this helper function near the top or inside your component
  const handleSaveAnalysis = (newAnalysis) => {
    try {
      const existing = localStorage.getItem('plantAnalysisExpert');
      const analyses = existing ? JSON.parse(existing) : [];
      analyses.push(newAnalysis);
      localStorage.setItem('plantAnalysisExpert', JSON.stringify(analyses));
      toast.success('Analysis saved successfully!');
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error('Failed to save analysis');
    }
  };

  const handleShare = async () => {
    try {
      toast.loading('Preparing image...');

      // Create temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      // Render share card
      const root = ReactDOM.createRoot(container);
      root.render(
        <ShareCard 
          resultImageBase64={resultImageBase64}
          predictionClass={predictionClass}
          predictionResult={predictionResult}
        />
      );

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the share card
      const shareCard = container.querySelector('#share-card');
      const canvas = await html2canvas(shareCard, {
        useCORS: true,
        scale: 2,
        backgroundColor: 'white',
        logging: false
      });

      // Clean up
      root.unmount();
      document.body.removeChild(container);

      // Share or download
      if (navigator.share) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
        const file = new File([blob], 'plant-analysis.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'Plant Analysis Results',
          text: 'Check out my plant analysis results from AgriAI!'
        });
        toast.success('Shared successfully!');
      } else {
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'plant-analysis.png';
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Image downloaded successfully!');
        }, 'image/png', 1.0);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to generate image');
    } finally {
      toast.dismiss();
    }
  };

  const handleSaveResult = () => {
    if (!predictionResult || !resultImageBase64) {
      toast.error('No analysis result to save');
      return;
    }

    try {
      // Get existing results or initialize empty array
      let savedResults = [];
      try {
        const existing = localStorage.getItem('plantAnalysis');
        if (existing) {
          savedResults = JSON.parse(existing);
        }
      } catch (e) {
        console.error('Error parsing existing results:', e);
      }

      // Create new result object
      const newResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        imageBase64: resultImageBase64,
        prediction: predictionClass,
        condition: predictionResult.condition,
        severity: predictionResult.severity,
        treatment: predictionResult.treatment
      };

      // Add to beginning of array
      savedResults.unshift(newResult);
      
      // Save to localStorage
      localStorage.setItem('plantAnalysis', JSON.stringify(savedResults));
      
      console.log('Saved successfully:', newResult);
      toast.success('Analysis saved successfully!');
      
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error('Failed to save analysis');
    }
  };

  const renderAnalysisResults = () => (
    <>
      <AnalysisCard ref={analysisCardRef}>
        <CardHeader>
          <h2 className="text-lg sm:text-xl font-bold text-green-800">AI Analysis Results 🤖</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {resultImageBase64 && (
              <div className="md:w-1/3">
                <div className="relative group">
                  <img 
                    src={`data:image/jpeg;base64,${resultImageBase64}`}
                    alt="Analysis Result" 
                    className="w-full h-48 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                  <span className="absolute bottom-2 left-2 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">Analyzed Image</span>
                </div>
              </div>
            )}
            
            <div className="md:w-2/3 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-50">
                  <div className="text-sm text-gray-500 mb-1">Detected Condition</div>
                  <div className={`font-medium text-lg typewriter delay-1 ${
                    predictionClass.includes('healthy') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {predictionClass.split('___').join(' - ').replace(/_/g, ' ')}
                  </div>
                </div>
                
                {predictionResult && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-50">
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className={`font-medium text-lg typewriter delay-2 ${
                      predictionClass.includes('healthy') ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {predictionResult.severity}
                    </div>
                  </div>
                )}
              </div>

              {predictionResult && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-50">
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Share Analysis
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </AnalysisCard>

      {/* Add Details Modal */}
      {predictionResult && (
        <DetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          diseaseInfo={{
            condition: predictionResult.condition,
            severity: predictionResult.severity,
            description: predictionResult.description,
            treatment: predictionResult.treatment,
            imageBase64: resultImageBase64
          }}
        />
      )}

      {predictionResult && (
        <Card className="mt-4 bg-white/50 backdrop-blur-sm border border-green-100">
          <CardHeader>
            <h2 className="text-xl font-bold text-green-800 typewriter delay-3">Treatment Plan 🌱</h2>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {predictionResult.treatment.map((item, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-green-50 treatment-item"
                  style={{ 
                    animationDelay: `${2 + (index * 0.15)}s`
                  }}
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </>
  );

  const renderUploadSection = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-lg sm:text-xl font-bold mb-4">Upload Plant Image</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="w-full sm:flex-1 cursor-pointer border-2 border-dashed border-green-300 p-4 sm:p-8 text-center rounded-lg">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden"
            />
            <span className="text-green-600 text-sm sm:text-base">Click to upload image</span>
          </label>
          
          {selectedImage && (
            <div className="w-full sm:flex-1">
              <img 
                src={selectedImage} 
                alt="Selected Plant" 
                className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-lg mx-auto"
              />
            </div>
          )}
        </div>
        
        <button 
          onClick={handleUpload}
          disabled={isAnalyzing}
          className={`mt-4 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center ${
            isAnalyzing 
              ? 'bg-green-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Image'
          )}
        </button>
      </div>

      {predictionResult && renderAnalysisResults()}
    </div>
  );

  const renderEmbeddedSection = () => (
    <div className="space-y-4">
      {/* Original Design Components */}
      <Card className="mb-4">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden">
              <img 
                src={tomatoImage}
                alt="Tomato Plant"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Tomatoes</h2>
          </div>
          <span className="text-orange-500 text-sm mt-2 sm:mt-0">Warning</span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">💧</span>
              <div>
                <div className="text-sm text-gray-500">Moisture</div>
                <div className="font-medium">65%</div>
            </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-500">🌡️</span>
              <div>
                <div className="text-sm text-gray-500">Temperature</div>
                <div className="font-medium">24°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">🌱</span>
              <div>
                <div className="text-sm text-gray-500">Growth</div>
                <div className="font-medium">85%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">🐛</span>
              <div>
                <div className="text-sm text-gray-500">Pests</div>
                <div className="font-medium">Low Risk</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Results and Treatment (same as upload section) */}
      {predictionResult && (
        <>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">AI Analysis Results 🤖</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Condition</div>
                  <div className="text-green-500">{predictionResult.condition}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Confidence</div>
                  <div className="text-green-500">{predictionResult.confidence}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Severity</div>
                  <div className="text-green-500">{predictionResult.severity}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Treatment Recommendations 💊</h2>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 pl-4">
                {predictionResult.treatment.map((item, index) => (
                  <li key={index} className="text-gray-700">{item}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  
  if (loading) {
    return <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-green-50 relative pb-32">
      <div className="relative z-0 p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/Expert/profile">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full overflow-hidden">
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
            </Link>
            <span className="text-lg sm:text-xl text-green-600 font-bold">Track Plants</span>
            <Link 
              to="/expert/savedanalyses" 
              className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
            >
              View Saved Results 📋
            </Link>
          </div>
{/*           
          <div className="relative w-full sm:max-w-xl">       
            <input 
              type="text" 
              placeholder="Search Plants"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
              <img src={searchIcon} alt="Search Icon" className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div> */}

          {/* <button className="relative">
            <Link to="/farmer/notifications">
              <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full">
                <img src={bellIcon} alt="Notification Icon" className="w-full h-full object-cover" />
              </div>
            </Link>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">3</span>
          </button> */}
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setSelectedMode('upload')}
            className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base ${
              selectedMode === 'upload' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700'
            }`}
          >
            Upload Image
          </button>
          <button
            onClick={() => setSelectedMode('embedded')}
            className={`px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base ${
              selectedMode === 'embedded' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700'
            }`}
          >
            Embedded System
          </button>
        </div>

        {/* Content Section */}
        {selectedMode === 'upload' ? renderUploadSection() : renderEmbeddedSection()}

       
      </div>
    </div>
  );
};

export default PlantTrackingPage;