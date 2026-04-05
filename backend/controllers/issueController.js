const mongoose = require('mongoose');
const Issue = require('../models/Issue');

const { Types } = mongoose;

const isValidObjectId = (id) => Types.ObjectId.isValid(id);

const buildPagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.items, 10) || 10, 1), 100);
  const skip = page * limit - limit;
  return { page, limit, skip };
};

const issuePopulate = [{ path: 'userId', select: 'name surname email userType' }];

/**
 * Create a new issue report
 */
exports.create = async (req, res) => {
  try {
    const { title, location, description, category, severity, reporter, reporterEmail } = req.body;

    // Validation
    if (!title || !location || !description || !reporter) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'title, location, description, and reporter are required fields.',
      });
    }

    // Create issue
    const issue = new Issue({
      title,
      location,
      description,
      category: category || 'Other',
      severity: severity || 'Medium',
      reporter,
      reporterEmail: reporterEmail || null,
      userId: req.user ? req.user._id : null,
      status: 'Open',
    });

    await issue.save();

    // Populate before returning
    await issue.populate(issuePopulate);

    res.status(201).json({
      success: true,
      result: issue,
      message: 'Issue report created successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

/**
 * Get all issues (Admin only)
 */
exports.getAll = async (req, res) => {
  try {
    const { page, limit, skip } = buildPagination(req);
    const { status, severity, category, search } = req.query;

    // Build filter
    const filter = { removed: false };

    if (status) {
      filter.status = status;
    }

    if (severity) {
      filter.severity = severity;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reporter: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Issue.countDocuments(filter);

    // Get issues with pagination
    const issues = await Issue.find(filter)
      .populate(issuePopulate)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    res.status(200).json({
      success: true,
      result: {
        data: issues,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: 'Issues retrieved successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

/**
 * Get issue statistics for dashboard
 */
exports.getStats = async (req, res) => {
  try {
    const filter = { removed: false };

    // Get counts by status
    const statusStats = await Issue.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by severity
    const severityStats = await Issue.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get counts by category
    const categoryStats = await Issue.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total count
    const total = await Issue.countDocuments(filter);

    // Get counts by each status
    const openCount = await Issue.countDocuments({ ...filter, status: 'Open' });
    const inProgressCount = await Issue.countDocuments({ ...filter, status: 'In Progress' });
    const resolvedCount = await Issue.countDocuments({ ...filter, status: 'Resolved' });

    // Calculate response time stats (for Critical and High severity)
    const criticalHighIssues = await Issue.aggregate([
      {
        $match: {
          ...filter,
          severity: { $in: ['Critical', 'High'] },
          responseTime: { $exists: true, $ne: null },
        },
      },
      {
        $addFields: {
          responseTimeMs: {
            $subtract: ['$responseTime', '$createdAt'],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTimeMs' },
          minResponseTime: { $min: '$responseTimeMs' },
          maxResponseTime: { $max: '$responseTimeMs' },
        },
      },
    ]);

    const responseTimeStats = criticalHighIssues[0] || {
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
    };

    res.status(200).json({
      success: true,
      result: {
        summary: {
          total,
          open: openCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
        },
        byStatus: statusStats.map((stat) => ({
          status: stat._id,
          count: stat.count,
        })),
        bySeverity: severityStats.map((stat) => ({
          severity: stat._id,
          count: stat.count,
        })),
        byCategory: categoryStats.map((stat) => ({
          category: stat._id,
          count: stat.count,
        })),
        responseTime: {
          avgMs: Math.round(responseTimeStats.avgResponseTime),
          minMs: Math.round(responseTimeStats.minResponseTime),
          maxMs: Math.round(responseTimeStats.maxResponseTime),
        },
      },
      message: 'Statistics retrieved successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

/**
 * Get single issue by ID (Admin only)
 */
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid issue ID.',
      });
    }

    const issue = await Issue.findOne({ _id: id, removed: false }).populate(issuePopulate);

    if (!issue) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Issue not found.',
      });
    }

    res.status(200).json({
      success: true,
      result: issue,
      message: 'Issue retrieved successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

/**
 * Update issue (Admin only)
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, severity, adminNotes } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid issue ID.',
      });
    }

    // Find existing issue
    const issue = await Issue.findOne({ _id: id, removed: false });

    if (!issue) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Issue not found.',
      });
    }

    // Update fields
    if (status) {
      // Set responseTime when moving from Open to In Progress
      if (issue.status === 'Open' && status === 'In Progress' && !issue.responseTime) {
        issue.responseTime = new Date();
      }
      // Set resolutionTime when moving to Resolved
      if (status === 'Resolved' && !issue.resolutionTime) {
        issue.resolutionTime = new Date();
      }
      issue.status = status;
    }

    if (severity) {
      issue.severity = severity;
    }

    if (adminNotes !== undefined) {
      issue.adminNotes = adminNotes;
    }

    await issue.save();
    await issue.populate(issuePopulate);

    res.status(200).json({
      success: true,
      result: issue,
      message: 'Issue updated successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

/**
 * Delete issue (soft delete - mark as removed)
 */
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid issue ID.',
      });
    }

    const issue = await Issue.findOne({ _id: id, removed: false });

    if (!issue) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Issue not found.',
      });
    }

    // Soft delete
    issue.removed = true;
    await issue.save();

    res.status(200).json({
      success: true,
      result: { _id: issue._id },
      message: 'Issue deleted successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

/**
 * Get issues by user (for users to track their reports)
 */
exports.getUserIssues = async (req, res) => {
  try {
    const { page, limit, skip } = buildPagination(req);
    const userId = req.user._id;

    const filter = { userId, removed: false };

    const total = await Issue.countDocuments(filter);

    const issues = await Issue.find(filter)
      .populate(issuePopulate)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    res.status(200).json({
      success: true,
      result: {
        data: issues,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: 'User issues retrieved successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};
