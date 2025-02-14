export const saveAnalysisResult = (result) => {
  try {
    const savedResults = JSON.parse(localStorage.getItem('plantAnalysis') || '[]');
    
    const newResult = {
      id: Date.now(),
      date: new Date().toISOString(),
      imageBase64: result.imageBase64,
      prediction: result.prediction,
      condition: result.condition,
      severity: result.severity,
      treatment: result.treatment
    };

    savedResults.unshift(newResult); // Add to beginning of array
    localStorage.setItem('plantAnalysis', JSON.stringify(savedResults));
    return true;
  } catch (error) {
    console.error('Error saving analysis:', error);
    return false;
  }
};

export const getSavedAnalyses = () => {
  try {
    return JSON.parse(localStorage.getItem('plantAnalysis') || '[]');
  } catch {
    return [];
  }
};
