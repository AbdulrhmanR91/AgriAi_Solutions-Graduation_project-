import express from 'express';
import { auth } from '../middleware/auth.js';
import { protect as adminAuth } from '../middleware/adminAuth.js'; // Add this import
import PlantAnalysis from '../models/PlantAnalysis.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    // Check both possible user ID locations for compatibility
    const userId = req.user?.id || req.user?._id;
    console.log('GET /plant-analyses - User ID:', userId);
    console.log('GET /plant-analyses - Full user object:', req.user);
    
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ 
        success: false,
        message: 'User ID not found in request' 
      });
    }

    const analyses = await PlantAnalysis.find({ userId: userId })
      .sort({ date: -1 });

    console.log(`Found ${analyses.length} analyses for user ${userId}`);
    return res.json(analyses);
      
  } catch (error) {
    console.error('GET analyses error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch analyses',
      error: error.message 
    });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    // Check both possible user ID locations for compatibility
    const userId = req.user?.id || req.user?._id;
    
    // Debug logging
    console.log('POST /plant-analyses - Request headers:', req.headers.authorization ? 'Token present' : 'No token');
    console.log('POST /plant-analyses - Request body fields:', Object.keys(req.body));
    console.log('POST /plant-analyses - User from auth:', userId);
    console.log('POST /plant-analyses - Full user object:', req.user);

    if (!userId) {
      console.log('User authentication failed - no user ID');
      return res.status(401).json({
        success: false,
        message: 'User authentication failed'
      });
    }

    const { condition, severity, treatment, imageBase64, originalPrediction } = req.body;

    // Validate all required fields
    if (!condition || !severity || !treatment || !imageBase64) {
      console.log('Missing required fields:', {
        condition: !!condition,
        severity: !!severity, 
        treatment: !!treatment,
        imageBase64: !!imageBase64
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Ensure treatment is always an array
    const treatmentArray = Array.isArray(treatment) ? treatment : [treatment];

    const analysisData = {
      userId: userId,
      condition: condition.trim(),
      severity: severity.trim(),
      treatment: treatmentArray,
      imageBase64,
      date: new Date()
    };

    // Add originalPrediction if provided
    if (originalPrediction) {
      analysisData.originalPrediction = originalPrediction;
    }

    console.log('Creating plant analysis for user:', userId);
    const newAnalysis = new PlantAnalysis(analysisData);
    const savedAnalysis = await newAnalysis.save();
    
    // Log successful save
    console.log('Analysis saved successfully with ID:', savedAnalysis._id);

    return res.status(201).json({
      success: true,
      data: savedAnalysis,
      message: 'Analysis saved successfully'
    });
  } catch (error) {
    console.error('Plant analysis save error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save analysis',
      error: error.message
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('DELETE /plant-analyses/:id - User ID:', req.user?.id, 'Analysis ID:', req.params.id);
    
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false,
        message: 'User authentication failed' 
      });
    }

    const analysis = await PlantAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!analysis) {
      console.log('Analysis not found or user not authorized');
      return res.status(404).json({ 
        success: false,
        message: 'Analysis not found or you are not authorized to delete it' 
      });
    }
    
    console.log('Analysis deleted successfully:', req.params.id);
    res.json({ 
      success: true,
      message: 'Analysis deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update statistics route to use adminAuth middleware
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    // Verify admin exists and has required permissions
    if (!req.admin) {
      return res.status(403).json({ 
        success: false,
        message: 'Admin authentication required' 
      });
    }

    const stats = await PlantAnalysis.aggregate([
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          byCondition: [
            { $group: { _id: '$condition', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          bySeverity: [
            { $group: { _id: '$severity', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          dailyTrends: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
          ]
        }
      }
    ]);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;