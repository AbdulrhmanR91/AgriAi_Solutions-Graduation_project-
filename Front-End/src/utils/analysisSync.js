/**
 * Analysis Synchronization Service
 * Handles saving and retrieving plant analyses with database and localStorage sync
 */

import { storage } from './storage';
import config from '../config/config';
import axios from 'axios';

class AnalysisSyncService {
  constructor() {
    this.API_URL = config.API_URL;
    this.FARMER_KEY = 'plantAnalysisFarmer';
    this.EXPERT_KEY = 'plantAnalysisExpert';
  }

  getStorageKey() {
    const session = storage.getSession();
    const userType = session?.userData?.userType || 'farmer';
    return userType === 'expert' ? this.EXPERT_KEY : this.FARMER_KEY;
  }

 
  async saveAnalysis(analysisData) {
    const result = {
      success: false,
      savedToDatabase: false,
      savedToLocalStorage: false,
      message: '',
      data: null
    };

    try {
      const dbResult = await this.saveToDatabase(analysisData);
      if (dbResult.success) {
        result.savedToDatabase = true;
        result.data = dbResult.data;
        console.log('✅ Analysis saved to database successfully');
      }
    } catch (dbError) {
      console.warn('⚠️ Database save failed:', dbError.message);
      result.message = `Database save failed: ${dbError.message}`;
    }

    try {
      this.saveToLocalStorage(analysisData);
      result.savedToLocalStorage = true;
      console.log('✅ Analysis saved to localStorage successfully');
    } catch (localError) {
      console.error('❌ localStorage save failed:', localError.message);
    }

    // 3. Determine overall success and message
    if (result.savedToDatabase) {
      result.success = true;
      result.message = 'Analysis saved successfully to database';
    } else if (result.savedToLocalStorage) {
      result.success = true;
      result.message = 'Analysis saved locally (will sync when online)';
    } else {
      result.success = false;
      result.message = 'Failed to save analysis';
    }

    return result;
  }

  /**
   * Save analysis to database via API
   * @param {Object} analysisData - Analysis data
   * @returns {Promise<Object>} - API response
   */
  async saveToDatabase(analysisData) {
    const session = storage.getSession();
    
    if (!session || !session.token) {
      throw new Error('No authentication token found');
    }

    // Prepare data for API
    const apiData = {
      condition: analysisData.condition,
      originalPrediction: analysisData.originalPrediction || analysisData.predictionClass,
      severity: analysisData.severity,
      treatment: Array.isArray(analysisData.treatment) ? analysisData.treatment : [analysisData.treatment],
      imageBase64: analysisData.imageBase64,
      confidence: analysisData.confidence,
      description: analysisData.description
    };

    const response = await axios.post(`${this.API_URL}/plant-analyses`, apiData, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Database save failed');
    }

    return response.data;
  }

  /**
   * Save analysis to localStorage
   * @param {Object} analysisData - Analysis data
   */
  saveToLocalStorage(analysisData) {
    try {
      const storageKey = this.getStorageKey();
      let savedAnalyses = [];

      // Get existing analyses
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        savedAnalyses = JSON.parse(existing);
      }

      // Add timestamp and ID if not present
      const analysisWithMeta = {
        ...analysisData,
        id: analysisData.id || Date.now().toString(),
        date: analysisData.date || new Date().toISOString(),
        localSave: true, // Flag to indicate this was saved locally
        syncStatus: 'pending' // Will be updated when synced to database
      };

      // Add to beginning of array
      savedAnalyses.unshift(analysisWithMeta);

      // Keep only last 50 analyses to prevent localStorage bloat
      if (savedAnalyses.length > 50) {
        savedAnalyses = savedAnalyses.slice(0, 50);
      }

      localStorage.setItem(storageKey, JSON.stringify(savedAnalyses));
      
      console.log(`Saved analysis to localStorage: ${storageKey}`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  /**
   * Load analyses with smart fallback (Database first, then localStorage)
   * @returns {Promise<Array>} - Array of analyses
   */
  async loadAnalyses() {
    let analyses = [];
    let source = 'none';

    // 1. Try to load from database first
    try {
      const dbAnalyses = await this.loadFromDatabase();
      if (dbAnalyses && dbAnalyses.length > 0) {
        analyses = dbAnalyses;
        source = 'database';
        console.log(`✅ Loaded ${analyses.length} analyses from database`);
        
        // Update localStorage with database data
        this.updateLocalStorageFromDatabase(dbAnalyses);
      }
    } catch (dbError) {
      console.warn('⚠️ Database load failed:', dbError.message);
    }

    // 2. Fallback to localStorage if database failed or empty
    if (analyses.length === 0) {
      try {
        const localAnalyses = this.loadFromLocalStorage();
        if (localAnalyses && localAnalyses.length > 0) {
          analyses = localAnalyses;
          source = 'localStorage';
          console.log(`✅ Loaded ${analyses.length} analyses from localStorage`);
          
          // Try to sync local data to database in background
          this.syncLocalToDatabase(localAnalyses);
        }
      } catch (localError) {
        console.error('❌ localStorage load failed:', localError.message);
      }
    }

    console.log(`Final result: ${analyses.length} analyses loaded from ${source}`);
    return {
      analyses,
      source,
      count: analyses.length
    };
  }

  /**
   * Load analyses from database via API
   * @returns {Promise<Array>} - Array of analyses
   */
  async loadFromDatabase() {
    const session = storage.getSession();
    
    if (!session || !session.token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${this.API_URL}/plant-analyses`, {
      headers: {
        'Authorization': `Bearer ${session.token}`
      },
      timeout: 10000
    });

    // Handle different response formats
    let analysesData = [];
    if (Array.isArray(response.data)) {
      analysesData = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      analysesData = response.data.data;
    } else if (response.data && typeof response.data === 'object') {
      const possibleArrays = Object.values(response.data).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        analysesData = possibleArrays[0];
      }
    }

    return analysesData.map(analysis => ({
      ...analysis,
      syncStatus: 'synced',
      localSave: false
    }));
  }

  /**
   * Load analyses from localStorage
   * @returns {Array} - Array of analyses
   */
  loadFromLocalStorage() {
    try {
      const storageKey = this.getStorageKey();
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) {
        return [];
      }

      const analyses = JSON.parse(saved);
      return Array.isArray(analyses) ? analyses : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  }

  /**
   * Update localStorage with database data
   * @param {Array} dbAnalyses - Analyses from database
   */
  updateLocalStorageFromDatabase(dbAnalyses) {
    try {
      const storageKey = this.getStorageKey();
      const processedAnalyses = dbAnalyses.map(analysis => ({
        ...analysis,
        syncStatus: 'synced',
        localSave: false
      }));
      
      localStorage.setItem(storageKey, JSON.stringify(processedAnalyses));
      console.log('✅ Updated localStorage with database data');
    } catch (error) {
      console.warn('⚠️ Failed to update localStorage:', error.message);
    }
  }

  /**
   * Sync local analyses to database in background
   * @param {Array} localAnalyses - Analyses from localStorage
   */
  async syncLocalToDatabase(localAnalyses) {
    const unsyncedAnalyses = localAnalyses.filter(
      analysis => analysis.localSave && analysis.syncStatus === 'pending'
    );

    if (unsyncedAnalyses.length === 0) {
      return;
    }

    console.log(`🔄 Syncing ${unsyncedAnalyses.length} local analyses to database...`);

    for (const analysis of unsyncedAnalyses) {
      try {
        await this.saveToDatabase(analysis);
        analysis.syncStatus = 'synced';
        analysis.localSave = false;
        console.log(`✅ Synced analysis: ${analysis.id}`);
      } catch (error) {
        console.warn(`⚠️ Failed to sync analysis ${analysis.id}:`, error.message);
        analysis.syncStatus = 'failed';
      }
    }

    // Update localStorage with sync status
    try {
      const storageKey = this.getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(localAnalyses));
    } catch (error) {
      console.warn('⚠️ Failed to update sync status in localStorage:', error.message);
    }
  }

  /**
   * Delete analysis from both database and localStorage
   * @param {string} analysisId - ID of analysis to delete
   * @returns {Promise<Object>} - Result with success status
   */
  async deleteAnalysis(analysisId) {
    const result = {
      success: false,
      deletedFromDatabase: false,
      deletedFromLocalStorage: false,
      message: ''
    };

    // 1. Try to delete from database
    try {
      const session = storage.getSession();
      if (session && session.token) {
        await axios.delete(`${this.API_URL}/plant-analyses/${analysisId}`, {
          headers: {
            'Authorization': `Bearer ${session.token}`
          }
        });
        result.deletedFromDatabase = true;
        console.log('✅ Analysis deleted from database');
      }
    } catch (dbError) {
      console.warn('⚠️ Database delete failed:', dbError.message);
    }

    // 2. Delete from localStorage
    try {
      const storageKey = this.getStorageKey();
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        const analyses = JSON.parse(saved);
        const filtered = analyses.filter(analysis => 
          (analysis._id || analysis.id) !== analysisId
        );
        
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        result.deletedFromLocalStorage = true;
        console.log('✅ Analysis deleted from localStorage');
      }
    } catch (localError) {
      console.error('❌ localStorage delete failed:', localError.message);
    }

    // 3. Determine overall success
    if (result.deletedFromDatabase || result.deletedFromLocalStorage) {
      result.success = true;
      result.message = 'Analysis deleted successfully';
    } else {
      result.success = false;
      result.message = 'Failed to delete analysis';
    }

    return result;
  }

  /**
   * Get sync status summary
   * @returns {Object} - Sync status information
   */
  getSyncStatus() {
    try {
      const localAnalyses = this.loadFromLocalStorage();
      const pending = localAnalyses.filter(a => a.syncStatus === 'pending').length;
      const failed = localAnalyses.filter(a => a.syncStatus === 'failed').length;
      const synced = localAnalyses.filter(a => a.syncStatus === 'synced').length;

      return {
        total: localAnalyses.length,
        pending,
        failed,
        synced,
        needsSync: pending + failed > 0
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        total: 0,
        pending: 0,
        failed: 0,
        synced: 0,
        needsSync: false
      };
    }
  }

  /**
   * Force sync all pending analyses
   * @returns {Promise<Object>} - Sync result
   */
  async forceSyncAll() {
    try {
      const localAnalyses = this.loadFromLocalStorage();
      await this.syncLocalToDatabase(localAnalyses);
      
      const newStatus = this.getSyncStatus();
      return {
        success: true,
        message: 'Sync completed',
        status: newStatus
      };
    } catch (error) {
      console.error('Force sync failed:', error);
      return {
        success: false,
        message: `Sync failed: ${error.message}`
      };
    }
  }
}

// Export both the class and singleton instance
export { AnalysisSyncService };
export const analysisSync = new AnalysisSyncService();
export default analysisSync;
