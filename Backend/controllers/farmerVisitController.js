import FarmerVisit from '../models/FarmerVisit.js';
import Farmer from '../models/Farmer.js';
import Expert from '../models/Expert.js';
import mongoose from 'mongoose';
import asyncHandler from '../middleware/async.js';

// @desc    Get all farmer visits for an expert
// @route   GET /api/farmer-visits
// @access  Private (Expert only)
const getFarmerVisits = asyncHandler(async (req, res) => {
    const expertId = req.user.id;
    const { page = 1, limit = 10, status, priority } = req.query;

    // Build query
    let query = { expert: expertId };
    if (status) query.followUpStatus = status;
    if (priority) query.priority = priority;    const visits = await FarmerVisit.find(query)
        .sort({ visitDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await FarmerVisit.countDocuments(query);

    res.status(200).json({
        success: true,
        data: visits,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// @desc    Get a specific farmer visit
// @route   GET /api/farmer-visits/:id
// @access  Private (Expert only)
const getFarmerVisit = asyncHandler(async (req, res) => {
    const visit = await FarmerVisit.findById(req.params.id)
        .populate('farmer', 'name phone email profileImage farmDetails')
        .populate('expert', 'name email');

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: 'Visit not found'
        });
    }

    // Check if the visit belongs to the requesting expert
    if (visit.expert._id.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this visit'
        });
    }

    res.status(200).json({
        success: true,
        data: visit
    });
});

// @desc    Create a new farmer visit
// @route   POST /api/farmer-visits
// @access  Private (Expert only)
const createFarmerVisit = asyncHandler(async (req, res) => {
    console.log('=== CREATE FARMER VISIT CALLED ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const {
        farmerName,
        farmerPhone,
        farmName,
        farmLocation,
        visitDate,
        problemDescription,
        expertNotes,
        priority,
        visitType,
        visitDuration,
        treatmentRecommendations,
        nextVisitDate
    } = req.body;

    // Validate required fields
    if (!farmerName || !farmName || !farmLocation || !problemDescription) {
        console.log('Missing required fields');
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: farmerName, farmName, farmLocation, problemDescription'
        });
    }

    console.log('Creating visit with farmer name:', farmerName);

    const visit = await FarmerVisit.create({
        expert: req.user.id,
        farmerName,
        farmerPhone: farmerPhone || '',
        farmName,
        farmLocation,
        visitDate: visitDate || new Date(),
        problemDescription,
        expertNotes: expertNotes || '',        priority: priority || 'medium',
        visitType: visitType || 'initial',
        visitDuration: visitDuration || 0,
        treatmentRecommendations: treatmentRecommendations || [],
        nextVisitDate
    });

    console.log('Visit created successfully:', visit);

    res.status(201).json({
        success: true,
        data: visit
    });
});

// @desc    Update a farmer visit
// @route   PUT /api/farmer-visits/:id
// @access  Private (Expert only)
const updateFarmerVisit = asyncHandler(async (req, res) => {
    let visit = await FarmerVisit.findById(req.params.id);

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: 'Visit not found'
        });
    }

    // Check if the visit belongs to the requesting expert
    if (visit.expert.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this visit'
        });
    }

    // Update last visit date if this is a follow-up
    if (req.body.visitType === 'followup') {
        req.body.lastVisitDate = visit.visitDate;
    }    visit = await FarmerVisit.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        data: visit
    });
});

// @desc    Delete a farmer visit
// @route   DELETE /api/farmer-visits/:id
// @access  Private (Expert only)
const deleteFarmerVisit = asyncHandler(async (req, res) => {
    const visit = await FarmerVisit.findById(req.params.id);

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: 'Visit not found'
        });
    }

    // Check if the visit belongs to the requesting expert
    if (visit.expert.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this visit'
        });
    }

    await visit.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Update visit follow-up status
// @route   PUT /api/farmer-visits/:id/status
// @access  Private (Expert only)
const updateVisitStatus = asyncHandler(async (req, res) => {
    console.log('=== UPDATE VISIT STATUS CALLED ===');
    console.log('Visit ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    const { status } = req.body;    if (!status) {
        console.log('No status provided in request body');
        return res.status(400).json({
            success: false,
            message: 'Status is required'
        });
    }

    // Validate status value
    const validStatuses = ['pending', 'in_progress', 'completed', 'needs_followup'];
    if (!validStatuses.includes(status)) {
        console.log('Invalid status provided:', status);
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
    }

    const visit = await FarmerVisit.findById(req.params.id);
    console.log('Found visit:', visit ? 'Yes' : 'No');

    if (!visit) {
        return res.status(404).json({
            success: false,
            message: 'Visit not found'
        });
    }

    console.log('Visit expert ID:', visit.expert.toString());
    console.log('Request user ID:', req.user.id);

    // Check if the visit belongs to the requesting expert
    if (visit.expert.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this visit'
        });
    }    visit.followUpStatus = status;
    if (status === 'completed') {
        visit.isCompleted = true;
    } else {
        visit.isCompleted = false;
    }

    await visit.save();
    console.log('Visit updated successfully');

    res.status(200).json({
        success: true,
        data: visit
    });
});

// @desc    Get farmer visits statistics for expert
// @route   GET /api/farmer-visits/stats
// @access  Private (Expert only)
const getVisitStats = asyncHandler(async (req, res) => {
    const expertId = new mongoose.Types.ObjectId(req.user.id);

    const stats = await FarmerVisit.aggregate([
        { $match: { expert: expertId } },
        {
            $group: {
                _id: null,
                totalVisits: { $sum: 1 },
                pendingVisits: {
                    $sum: { $cond: [{ $eq: ['$followUpStatus', 'pending'] }, 1, 0] }
                },
                inProgressVisits: {
                    $sum: { $cond: [{ $eq: ['$followUpStatus', 'in_progress'] }, 1, 0] }
                },
                completedVisits: {
                    $sum: { $cond: [{ $eq: ['$followUpStatus', 'completed'] }, 1, 0] }
                },
                needsFollowUp: {
                    $sum: { $cond: [{ $eq: ['$followUpStatus', 'needs_followup'] }, 1, 0] }
                },
                urgentVisits: {
                    $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
                },
                highPriorityVisits: {
                    $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
                }
            }
        }
    ]);

    const result = stats[0] || {
        totalVisits: 0,
        pendingVisits: 0,
        inProgressVisits: 0,
        completedVisits: 0,
        needsFollowUp: 0,
        urgentVisits: 0,
        highPriorityVisits: 0
    };

    res.status(200).json({
        success: true,
        data: result
    });
});

// @desc    Get farmers with their last visit info
// @route   GET /api/farmer-visits/farmers-summary
// @access  Private (Expert only)
const getFarmersSummary = asyncHandler(async (req, res) => {
    const expertId = new mongoose.Types.ObjectId(req.user.id);    const farmersSummary = await FarmerVisit.aggregate([
        { $match: { expert: expertId } },
        { $sort: { visitDate: -1 } },
        {
            $group: {
                _id: '$farmerName', // Group by farmer name instead of ID
                lastVisitId: { $first: '$_id' }, // Get the last visit ID
                farmerPhone: { $first: '$farmerPhone' },
                farmName: { $first: '$farmName' },
                farmLocation: { $first: '$farmLocation' },
                lastVisitDate: { $first: '$visitDate' },
                lastProblem: { $first: '$problemDescription' },
                lastStatus: { $first: '$followUpStatus' },
                lastExpertNotes: { $first: '$expertNotes' },
                lastPriority: { $first: '$priority' },
                totalVisits: { $sum: 1 },
                needsFollowUp: {
                    $sum: { $cond: [{ $eq: ['$followUpStatus', 'needs_followup'] }, 1, 0] }
                }
            }
        },
        {
            $project: {
                _id: 1,
                lastVisitId: 1,
                farmerName: '$_id',
                farmerPhone: 1,
                farmName: 1,
                farmLocation: 1,
                lastVisitDate: 1,
                lastProblem: 1,
                lastStatus: 1,
                lastExpertNotes: 1,
                lastPriority: 1,
                totalVisits: 1,
                needsFollowUp: 1
            }
        },        { $sort: { lastVisitDate: -1 } }
    ]);

    console.log('Farmers summary result:', JSON.stringify(farmersSummary, null, 2));

    res.status(200).json({
        success: true,
        data: farmersSummary
    });
});

export {
    getFarmerVisits,
    getFarmerVisit,
    createFarmerVisit,
    updateFarmerVisit,
    deleteFarmerVisit,
    updateVisitStatus,
    getVisitStats,
    getFarmersSummary
};
