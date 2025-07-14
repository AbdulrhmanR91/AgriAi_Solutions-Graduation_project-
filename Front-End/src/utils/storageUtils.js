export const saveAnalysisResult = (result) => {
  try {
    // Get existing results
    let savedResults = [];
    const existing = localStorage.getItem('plantAnalysisFarmer');
    if (existing) {
      savedResults = JSON.parse(existing);
    }
    
    // Add new result to the beginning of the array
    savedResults.unshift(result);
    
    // Save the updated array back to localStorage
    localStorage.setItem('plantAnalysisFarmer', JSON.stringify(savedResults));
    
    return true;
  } catch (error) {
    console.error('Error saving analysis result:', error);
    return false;
  }
};

// Function to get saved analysis results
export const getSavedAnalysisResults = () => {
  try {
    const saved = localStorage.getItem('plantAnalysisFarmer');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error retrieving saved analyses:', error);
    return [];
  }
};
