const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticateToken } = require('./users');

// Create a new report (any authenticated user)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { contentType, contentId, reason, description } = req.body;

        if (!contentType || !contentId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Content type, content ID, and reason are required'
            });
        }

        // Check if user already reported this content
        const existingReport = await Report.findOne({
            contentType,
            contentId,
            reportedBy: req.user.id,
            status: { $in: ['pending', 'reviewed'] }
        });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'You have already reported this content'
            });
        }

        // Get the owner of the reported content
        let reportedUser = null;
        if (contentType === 'post') {
            const post = await Post.findById(contentId);
            if (post) reportedUser = post.user;
        } else if (contentType === 'user') {
            reportedUser = contentId;
        }

        const report = new Report({
            contentType,
            contentId,
            reportedBy: req.user.id,
            reportedUser,
            reason,
            description: description || ''
        });

        await report.save();

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            report: {
                id: report._id,
                contentType: report.contentType,
                reason: report.reason,
                status: report.status
            }
        });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit report'
        });
    }
});

// Get all reports (admin only)
router.get('/admin/all', authenticateToken, async (req, res) => {
    try {
        const { status, contentType, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status && status !== 'all') query.status = status;
        if (contentType && contentType !== 'all') query.contentType = contentType;

        const reports = await Report.find(query)
            .populate('reportedBy', 'username fullName avatar')
            .populate('reportedUser', 'username fullName avatar')
            .populate('reviewedBy', 'username fullName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Report.countDocuments(query);

        // Get content preview for each report
        const enrichedReports = await Promise.all(reports.map(async (report) => {
            let contentPreview = '';

            if (report.contentType === 'post') {
                const post = await Post.findById(report.contentId).select('caption image');
                if (post) {
                    contentPreview = post.caption?.substring(0, 100) || 'No caption';
                }
            } else if (report.contentType === 'user') {
                const user = await User.findById(report.contentId).select('username');
                if (user) {
                    contentPreview = `@${user.username}`;
                }
            }

            return {
                ...report.toObject(),
                contentPreview
            };
        }));

        res.json({
            success: true,
            reports: enrichedReports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reports'
        });
    }
});

// Get report statistics (admin only)
router.get('/admin/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await Report.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statsObject = {
            total: 0,
            pending: 0,
            reviewed: 0,
            resolved: 0,
            dismissed: 0
        };

        stats.forEach(stat => {
            statsObject[stat._id] = stat.count;
            statsObject.total += stat.count;
        });

        // Get recent reports count (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const recentCount = await Report.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        res.json({
            success: true,
            stats: {
                ...statsObject,
                thisWeek: recentCount
            }
        });
    } catch (error) {
        console.error('Error fetching report stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report statistics'
        });
    }
});

// Update report status (admin only)
router.put('/admin/:reportId', authenticateToken, async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, adminAction, adminNote } = req.body;

        const report = await Report.findByIdAndUpdate(
            reportId,
            {
                status,
                adminAction: adminAction || 'none',
                adminNote: adminNote || '',
                reviewedBy: req.user.id,
                reviewedAt: new Date()
            },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // If content was removed, actually delete it
        if (adminAction === 'content_removed' && report.contentType === 'post') {
            await Post.findByIdAndDelete(report.contentId);
        }

        // If user was suspended/banned, update their status
        if (['user_suspended', 'user_banned'].includes(adminAction) && report.reportedUser) {
            await User.findByIdAndUpdate(report.reportedUser, {
                accountStatus: adminAction === 'user_banned' ? 'banned' : 'suspended'
            });
        }

        res.json({
            success: true,
            message: 'Report updated successfully',
            report
        });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update report'
        });
    }
});

module.exports = router;
