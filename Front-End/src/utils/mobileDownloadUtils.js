// Mobile Download Utilities for React Native WebView with Expo
// This utility handles downloading reports in mobile apps using PostMessage

import { MOBILE_DOWNLOAD_CONFIG, getMessages, validateAnalysisData, formatFileName } from '../config/mobileDownloadConfig.js';

export class MobileDownloadManager {
  constructor() {
    this.isReactNativeWebView = typeof window !== 'undefined' && window.ReactNativeWebView !== undefined;
    this.isExpoApp = typeof window !== 'undefined' && (window.expo !== undefined || navigator.userAgent.includes('Expo'));
    this.isMobileEnvironment = this.isReactNativeWebView || this.isExpoApp;
    this.config = MOBILE_DOWNLOAD_CONFIG;
  }

  // Check if we're in a mobile environment
  isMobile() {
    return this.isMobileEnvironment;
  }

  // Enhanced PostMessage with retry mechanism
  async sendMessage(message, retryCount = null) {
    const maxRetries = retryCount || this.config.RETRY_ATTEMPTS;
    
    if (!this.isReactNativeWebView) {
      console.log('Not in React Native WebView environment');
      return false;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Sending message attempt ${attempt}:`, message.type);
        
        // Send the message
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
        
        // Add small delay between attempts
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return true;
      } catch (error) {
        console.error(`Message send attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
    
    return false;
  }
  // Main download function for React Native WebView
  async downloadPlantAnalysisReport(analysisData, options = {}) {
    if (!this.isMobile()) {
      console.log('Not in mobile environment, skipping mobile download');
      return false;
    }

    try {
      // Validate analysis data
      validateAnalysisData(analysisData);
      
      // Get messages for the language
      const messages = getMessages(analysisData.language || 'en');
      
      // Generate filename
      const fileName = formatFileName(
        analysisData.plantName || 'analysis', 
        options.format || 'pdf',
        analysisData.language
      );

      // Prepare comprehensive report data
      const reportData = {
        type: this.config.MESSAGE_TYPES.WEB_TO_APP.DOWNLOAD_PLANT_REPORT,
        timestamp: Date.now(),
        data: {
          // Plant Analysis Information
          plantName: analysisData.plantName || 'Unknown Plant',
          condition: analysisData.condition || 'Unknown Condition',
          confidence: analysisData.confidence || 'N/A',
          severity: analysisData.severity || 'Unknown',
          description: analysisData.description || '',
          treatment: Array.isArray(analysisData.treatment) ? analysisData.treatment : [],
          
          // Image data (Base64)
          imageBase64: analysisData.imageBase64 || '',
          
          // Report metadata
          reportTitle: options.title || messages.downloadSuccess,
          analysisDate: analysisData.analysisDate || new Date().toLocaleDateString(),
          analysisTime: analysisData.analysisTime || new Date().toLocaleTimeString(),
          language: analysisData.language || 'en',
          
          // File information
          fileName: fileName,
          fileExtension: options.format || this.config.DEFAULT_FORMAT,
          
          // Additional options
          includeImage: options.includeImage !== false,
          includeTreatment: options.includeTreatment !== false,
          format: options.format || this.config.DEFAULT_FORMAT
        },
        // App-specific options
        options: {
          ...this.config.SAVE_OPTIONS,
          ...options
        }
      };

      // Send primary download message
      const success = await this.sendMessage(reportData);
      
      if (success) {
        console.log('Mobile download message sent successfully');
        
        // Send fallback messages for better compatibility
        await this.sendFallbackMessages(analysisData, options);
        
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Mobile download failed:', error);
      return false;
    }
  }  // Send additional fallback messages for different mobile app implementations
  async sendFallbackMessages(analysisData, options = {}) {
    const fileName = formatFileName(
      analysisData.plantName || 'analysis',
      options.format || 'pdf',
      analysisData.language
    );
    
    const fallbackMessages = [
      // Message 1: Simple PDF download
      {
        type: this.config.MESSAGE_TYPES.WEB_TO_APP.DOWNLOAD_PDF,
        data: {
          content: this.generatePDFContent(analysisData),
          fileName: fileName,
          title: analysisData.language === 'ar' ? 'تقرير تحليل النبات' : 'Plant Analysis Report'
        }
      },
      
      // Message 2: Image download
      {
        type: this.config.MESSAGE_TYPES.WEB_TO_APP.DOWNLOAD_IMAGE,
        data: {
          imageBase64: analysisData.imageBase64,
          fileName: formatFileName(analysisData.plantName || 'analysis', 'png', analysisData.language),
          title: analysisData.condition || 'Plant Analysis'
        }
      },
      
      // Message 3: Generic download with all data
      {
        type: 'downloadFile',
        fileType: 'plant_analysis_report',
        content: analysisData,
        metadata: {
          fileName: fileName,
          format: options.format || this.config.DEFAULT_FORMAT,
          language: analysisData.language || 'en'
        }
      },
      
      // Message 4: Save to device storage
      {
        type: this.config.MESSAGE_TYPES.WEB_TO_APP.SAVE_TO_DEVICE,
        category: 'plant_analysis',
        data: {
          ...analysisData,
          savedAt: new Date().toISOString(),
          id: `analysis_${Date.now()}`
        }
      }
    ];

    // Send fallback messages with delays
    for (let i = 0; i < fallbackMessages.length; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)));
        await this.sendMessage(fallbackMessages[i], 1); // Single attempt for fallbacks
      } catch (error) {
        console.log(`Fallback message ${i + 1} failed:`, error);
      }
    }
  }

  // Generate PDF content structure for mobile app
  generatePDFContent(analysisData) {
    return {
      title: analysisData.language === 'ar' ? 'تقرير تحليل النبات' : 'Plant Analysis Report',
      sections: [
        {
          type: 'header',
          content: {
            title: analysisData.language === 'ar' ? 'تحليل النبات بالذكاء الاصطناعي' : 'AI Plant Analysis',
            subtitle: analysisData.language === 'ar' ? 'تقرير مفصل' : 'Detailed Report',
            date: analysisData.analysisDate || new Date().toLocaleDateString(),
            time: analysisData.analysisTime || new Date().toLocaleTimeString()
          }
        },
        {
          type: 'image',
          content: {
            base64: analysisData.imageBase64,
            caption: analysisData.language === 'ar' ? 'صورة النبات المحللة' : 'Analyzed Plant Image'
          }
        },
        {
          type: 'results',
          content: {
            plantName: analysisData.plantName || 'Unknown',
            condition: analysisData.condition || 'Unknown',
            confidence: analysisData.confidence || 'N/A',
            severity: analysisData.severity || 'Unknown',
            description: analysisData.description || ''
          }
        },
        {
          type: 'treatment',
          content: {
            title: analysisData.language === 'ar' ? 'خطة العلاج المقترحة' : 'Recommended Treatment Plan',
            steps: Array.isArray(analysisData.treatment) ? analysisData.treatment : []
          }
        },
        {
          type: 'footer',
          content: {
            generatedBy: 'AgriAI - Plant Analysis System',
            timestamp: new Date().toISOString(),
            language: analysisData.language || 'en'
          }
        }
      ]
    };
  }

  // Listen for responses from mobile app
  setupResponseListener(callback) {
    if (typeof window !== 'undefined') {
      const handleMessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type && data.type.includes('download')) {
            callback(data);
          }
        } catch (error) {
          console.log('Message parsing failed:', error);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
    
    return () => {};
  }
}

// Create singleton instance
export const mobileDownloadManager = new MobileDownloadManager();

// Utility functions
export const isMobileWebView = () => mobileDownloadManager.isMobile();

export const downloadPlantReport = async (analysisData, options = {}) => {
  return await mobileDownloadManager.downloadPlantAnalysisReport(analysisData, options);
};

// React hook for mobile download
export const useMobileDownload = () => {
  const isMobile = mobileDownloadManager.isMobile();
  
  const downloadReport = async (analysisData, options = {}) => {
    if (isMobile) {
      return await mobileDownloadManager.downloadPlantAnalysisReport(analysisData, options);
    }
    return false;
  };
  
  const setupListener = (callback) => {
    return mobileDownloadManager.setupResponseListener(callback);
  };
  
  return {
    isMobile,
    downloadReport,
    setupListener,
    isSupported: isMobile
  };
};
