const mongoose = require('mongoose');
const PublicSpace = require('../models/PublicSpace');
const AccessFeature = require('../models/AccessFeatures');

const ACCESS_FEATURE_POPULATE = {
  path: 'accessFeatures',
  select: 'name category description isActive',
};

const normalizeAccessFeatures = async (accessFeatures) => {
  if (accessFeatures === undefined) {
    return undefined;
  }

  if (!Array.isArray(accessFeatures)) {
    throw new Error('Access features must be provided as an array.');
  }

  const normalizedIds = [...new Set(accessFeatures)]
    .filter(Boolean)
    .map((featureId) => {
      if (!mongoose.Types.ObjectId.isValid(featureId)) {
        throw new Error(`Invalid access feature id: ${featureId}`);
      }

      return featureId;
    });

  if (normalizedIds.length === 0) {
    return [];
  }

  const existingFeatures = await AccessFeature.find({
    _id: { $in: normalizedIds },
  }).select('_id');

  if (existingFeatures.length !== normalizedIds.length) {
    throw new Error('One or more selected access features do not exist.');
  }

  return normalizedIds;
};

// Create a new public space
exports.createPublicSpace = async (req, res) => {
  try {
    // Extract data from request body
    const { name, category, locationDetails, imageUrl, description, accessFeatures } = req.body;
    const normalizedAccessFeatures = await normalizeAccessFeatures(accessFeatures);

    const newSpace = new PublicSpace({
      name,
      category,
      locationDetails,
      imageUrl,
      description,
      accessFeatures: normalizedAccessFeatures ?? [],
    });
    const savedSpace = await newSpace.save();
    await savedSpace.populate(ACCESS_FEATURE_POPULATE);

    //response with status code and data
    res.status(201).json({
      success: true,
      data: savedSpace,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all public spaces from DB
exports.getAllPublicSpaces = async (req, res) => {
  try {
    const spaces = await PublicSpace.find().populate(ACCESS_FEATURE_POPULATE);

    res.status(200).json({
      success: true,
      count: spaces.length,
      data: spaces,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update a public space by ID
exports.updatePublicSpace = async (req, res) => {
  try {
    const {
      name,
      category,
      locationDetails,
      imageUrl,
      description,
      accessFeatures,
    } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (locationDetails !== undefined) updateData.locationDetails = locationDetails;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (description !== undefined) updateData.description = description;
    if (accessFeatures !== undefined) {
      updateData.accessFeatures = await normalizeAccessFeatures(accessFeatures);
    }

    const updatedSpace = await PublicSpace.findByIdAndUpdate(req.params.id, updateData, {
      new: true, // return the updated document
      runValidators: true, // run schema validators on update
    }).populate(ACCESS_FEATURE_POPULATE);

    // if public space not found with id
    if (!updatedSpace) {
      return res.status(404).json({
        success: false,
        message: 'Public space not found',
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSpace,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// delete a public space by ID
exports.deletePublicSpace = async (req, res) => {
  try {
    const deletedSpace = await PublicSpace.findByIdAndDelete(req.params.id);

    // if public space not found with id
    if (!deletedSpace) {
      return res.status(404).json({
        success: false,
        message: 'Public space not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Public space deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Find space by name (Partial match, Case insensitive)
exports.getPublicSpaceByName = async (req, res) => {
  try {
    const nameQuery = req.params.name;

    const spaces = await PublicSpace.find({
      name: { $regex: nameQuery, $options: 'i' }, // 'i' for case insensitive
    }).populate(ACCESS_FEATURE_POPULATE);

    res.status(200).json({
      success: true,
      count: spaces.length,
      data: spaces,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
