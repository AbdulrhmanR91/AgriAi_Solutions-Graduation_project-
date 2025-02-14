import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../ui/card';
import toast from 'react-hot-toast';
import searchIcon from '../../../assets/images/search.png';
import { Dialog, DialogContent } from '../ui/dialog';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';

const DetailsModal = ({ isOpen, onClose, analysis }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-3xl">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-green-800">{analysis.condition}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className={`font-medium ${
              analysis.severity === 'Healthy' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {analysis.severity}
            </div>
          </div>

          {/* Date */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Analysis Date</div>
            <div className="text-gray-700">
              {new Date(analysis.date).toLocaleDateString()}
            </div>
          </div>

          {/* Image */}
          <div className="sm:col-span-2">
            <img 
              src={`data:image/jpeg;base64,${analysis.imageBase64}`}
              alt="Plant Analysis"
              className="w-full h-64 object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-3">Treatment Plan</h4>
          <ol className="space-y-2">
            {analysis.treatment.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-green-600">•</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const ShareCard = ({ analysis }) => (
  <div 
    id="share-card" 
    className="bg-white p-8 rounded-lg shadow-lg" 
    style={{ width: '800px', minHeight: '600px' }}
  >
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Saved Analysis Results 🌿</h2>
        <p className="text-gray-500">{new Date(analysis.date).toLocaleDateString()}</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <img 
            src={`data:image/jpeg;base64,${analysis.imageBase64}`}
            alt="Analysis Result" 
            className="w-full h-72 object-cover rounded-lg shadow-md"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Condition</div>
            <div className="font-bold text-lg text-green-600">
              {analysis.condition}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className="font-bold text-lg text-yellow-600">
              {analysis.severity}
            </div>
          </div>
        </div>
      </div>

      {/* Treatment Plan */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3">Treatment Plan</h3>
        <div className="grid grid-cols-2 gap-4">
          {analysis.treatment.map((item, index) => (
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
          {new Date(analysis.date).toLocaleTimeString()}
        </div>
      </div>
    </div>
  </div>
);

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

    if (navigator.share) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      const file = new File([blob], 'saved-analysis.png', { type: 'image/png' });
      await navigator.share({
        files: [file],
        title: 'Saved Plant Analysis',
        text: 'Check out this plant analysis from AgriAI!'
      });
      toast.success('Shared successfully!');
    } else {
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'saved-analysis.png';
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

const SavedAnalysess = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Load analyses
  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = () => {
    try {
      const saved = localStorage.getItem('plantAnalysisExpert'); // changed key
      if (saved) {
        const parsedAnalyses = JSON.parse(saved);
        if (Array.isArray(parsedAnalyses)) {
          setAnalyses(parsedAnalyses);
        }
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
      toast.error('Error loading saved analyses');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filter with date
  const filteredAnalyses = useMemo(() => {
    return analyses.filter(analysis => {
      const matchesSearch = 
        analysis.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.severity.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!dateFilter) return matchesSearch;

      const analysisDate = new Date(analysis.date).toLocaleDateString();
      const filterDate = new Date(dateFilter).toLocaleDateString();
      
      return matchesSearch && analysisDate === filterDate;
    });
  }, [analyses, searchQuery, dateFilter]);

  // Delete analysis
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
        localStorage.setItem('plantAnalysisExpert', JSON.stringify(updatedAnalyses)); // changed key
        setAnalyses(updatedAnalyses);
        toast.success('Analysis deleted successfully');
      } catch (error) {
        console.error('Error deleting analysis:', error);
        toast.error('Failed to delete analysis');
      }
    }
  };

  return (
    // Add pb-20 to create space for bottom navigation
    <div className="min-h-screen bg-green-50 p-4 pb-24"> 
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link 
              to="../trackplants"
              className="px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-700">
              Saved Analyses ({filteredAnalyses.length})
            </h1>
          </div>
          
          <Link 
            to="../trackplants"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            New Analysis
          </Link>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search analyses..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <img src={searchIcon} alt="Search" className="w-5 h-5 opacity-50" />
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredAnalyses.length} of {analyses.length} analyses
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredAnalyses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'No matching analyses found' : 'No saved analyses yet'}
            </p>
            {!searchQuery && (
              <Link 
                to="../trackplants"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Start New Analysis
              </Link>
            )}
          </div>
        )}

        {/* Results grid */}
        {!loading && filteredAnalyses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnalyses.map(analysis => (
              <Card key={analysis.id} className="bg-white hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-lg">{analysis.condition}</h2>
                      <span className="text-sm text-gray-500">
                        {new Date(analysis.date).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete analysis"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-32 h-32">
                      <img 
                        src={`data:image/jpeg;base64,${analysis.imageBase64}`}
                        alt="Plant Analysis" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Status: </span>
                        <span className={`font-medium ${
                          analysis.severity === 'Healthy' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {analysis.severity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Treatment:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {analysis.treatment.map((item, index) => (
                            <li key={index} className="text-gray-600 line-clamp-1">{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleShare(analysis)}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                          Share
                        </button>
                        <button
                          onClick={() => setSelectedAnalysis(analysis)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

export default SavedAnalysess;
