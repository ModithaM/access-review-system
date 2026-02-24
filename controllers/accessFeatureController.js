const AccessFeature = require('../models/AccessFeatures');

/**
 * Create a new access feature (accessibility criterion)
 */
exports.createAccessFeature = async (req, res) => {
  try {
    const { name, description, category, is_active } = req.body;

    // Check for duplicate name
    const existingFeature = await AccessFeature.findOne({ name: name?.trim() });
    if (existingFeature) {
      return res.status(400).json({
        success: false,
        message: 'An access feature with this name already exists.',
      });
    }

    const newFeature = new AccessFeature({
      name: name?.trim(),
      description,
      category: category || 'Mobility',
      isActive: is_active !== undefined ? is_active : true,
      createdBy: req.user._id,
    });

    const savedFeature = await newFeature.save();

    res.status(201).json({
      success: true,
      data: savedFeature,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all access features (for reviewers to select from)
 * Optional query: ?activeOnly=true returns only active features
 */
exports.getAllAccessFeatures = async (req, res) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const filter = activeOnly ? { isActive: true } : {};

    const features = await AccessFeature.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: features.length,
      data: features,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get a single access feature by ID
 */
exports.getAccessFeatureById = async (req, res) => {
  try {
    const feature = await AccessFeature.findById(req.params.id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Access feature not found',
      });
    }

    res.status(200).json({
      success: true,
      data: feature,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update an existing access feature
 */
exports.updateAccessFeature = async (req, res) => {
  try {
    const { name, description, category, is_active } = req.body;

    // If name is being updated, check for duplicate
    if (name) {
      const existingFeature = await AccessFeature.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });
      if (existingFeature) {
        return res.status(400).json({
          success: false,
          message: 'An access feature with this name already exists.',
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (is_active !== undefined) updateData.isActive = is_active;

    const updatedFeature = await AccessFeature.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedFeature) {
      return res.status(404).json({
        success: false,
        message: 'Access feature not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedFeature,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Soft delete: set is_active to false (preserves old reviews)
 */
exports.deleteAccessFeature = async (req, res) => {
  try {
    const feature = await AccessFeature.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Access feature not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Access feature deactivated successfully',
      data: feature,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
