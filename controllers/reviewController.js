const mongoose = require("mongoose");

// Helper to get the model safely (avoids OverwriteModelError)
const getModel = () => mongoose.model("AccessibilityReview");

/**
 *  Create a new accessibility review
 *  Only authenticated users can create reviews
 *  userId is automatically set from the JWT token (req.user)
 */
exports.create = async (req, res) => {
  try {
    const AccessibilityReview = getModel();
    const { spaceId, rating, comment, features, title } = req.body;

    // Validate required fields
    if (!spaceId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "spaceId, rating, and comment are required fields.",
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Create the review with the authenticated user's ID
    const newReview = new AccessibilityReview({
      spaceId,
      userId: req.user._id, // Set from JWT middleware
      rating,
      comment,
      features: features || [],
      title: title || "",
    });

    const result = await newReview.save();

    // Populate user info before returning
    const populatedResult = await AccessibilityReview.findById(result._id)
      .populate("userId", "name surname email")
      .exec();

    return res.status(201).json({
      success: true,
      result: populatedResult,
      message: "Accessibility review created successfully.",
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        result: null,
        message: err.message,
      });
    }
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error: " + err.message,
    });
  }
};

/**
 *  Get a single review by ID
 */
exports.read = async (req, res) => {
  try {
    const AccessibilityReview = getModel();
    const result = await AccessibilityReview.findOne({
      _id: req.params.id,
      removed: false,
    })
      .populate("userId", "name surname email")
      .exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "No review found by this id: " + req.params.id,
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: "Review found by this id: " + req.params.id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
    });
  }
};

/**
 *  Update a review by ID
 *  Only the user who created the review can update it
 */
exports.update = async (req, res) => {
  try {
    const AccessibilityReview = getModel();
    // First, find the review to check ownership
    const existingReview = await AccessibilityReview.findOne({
      _id: req.params.id,
      removed: false,
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "No review found by this id: " + req.params.id,
      });
    }

    // Check if the authenticated user is the owner of the review
    if (existingReview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        result: null,
        message: "You are not authorized to update this review.",
      });
    }

    // Only allow updating specific fields (not userId or spaceId)
    const allowedUpdates = {};
    if (req.body.rating !== undefined) allowedUpdates.rating = req.body.rating;
    if (req.body.comment !== undefined)
      allowedUpdates.comment = req.body.comment;
    if (req.body.features !== undefined)
      allowedUpdates.features = req.body.features;
    if (req.body.title !== undefined) allowedUpdates.title = req.body.title;

    const result = await AccessibilityReview.findOneAndUpdate(
      { _id: req.params.id },
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("userId", "name surname email")
      .exec();

    return res.status(200).json({
      success: true,
      result,
      message: "Review updated successfully by id: " + req.params.id,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        result: null,
        message: err.message,
      });
    }
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
    });
  }
};

/**
 *  Delete a review by ID (soft delete)
 *  Only the owner or an admin can delete
 */
exports.delete = async (req, res) => {
  try {
    const AccessibilityReview = getModel();
    const existingReview = await AccessibilityReview.findOne({
      _id: req.params.id,
      removed: false,
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "No review found by this id: " + req.params.id,
      });
    }

    // Check if the user is the owner OR an admin
    const isOwner =
      existingReview.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        result: null,
        message: "You are not authorized to delete this review.",
      });
    }

    // Soft delete
    const result = await AccessibilityReview.findOneAndUpdate(
      { _id: req.params.id },
      { removed: true },
      { new: true }
    ).exec();

    return res.status(200).json({
      success: true,
      result,
      message: "Review successfully deleted by id: " + req.params.id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
    });
  }
};

/**
 *  List all reviews with pagination
 *  Supports filtering by spaceId via query parameter
 */
exports.list = async (req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  try {
    const AccessibilityReview = getModel();
    // Build filter - always exclude soft-deleted reviews
    const filter = { removed: false };

    // Optional: filter by spaceId
    if (req.query.spaceId) {
      filter.spaceId = req.query.spaceId;
    }

    // Optional: filter by userId
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    const resultsPromise = AccessibilityReview.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: "desc" })
      .populate("userId", "name surname email")
      .exec();

    const countPromise = AccessibilityReview.countDocuments(filter);

    const [result, count] = await Promise.all([resultsPromise, countPromise]);
    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result,
        pagination,
        message: "Successfully found all reviews",
      });
    } else {
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: "No reviews found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is an Error",
    });
  }
};

/**
 *  Search reviews by keyword in comment or title
 */
exports.search = async (req, res) => {
  if (
    req.query.q === undefined ||
    req.query.q === "" ||
    req.query.q === " "
  ) {
    return res.status(202).json({
      success: false,
      result: [],
      message: "No document found by this request",
    });
  }

  try {
    const AccessibilityReview = getModel();
    const searchRegex = new RegExp(req.query.q, "i");

    const results = await AccessibilityReview.find({
      removed: false,
      $or: [
        { comment: { $regex: searchRegex } },
        { title: { $regex: searchRegex } },
      ],
    })
      .sort({ createdAt: "desc" })
      .limit(10)
      .populate("userId", "name surname email")
      .exec();

    if (results.length >= 1) {
      return res.status(200).json({
        success: true,
        result: results,
        message: "Successfully found matching reviews",
      });
    } else {
      return res.status(202).json({
        success: false,
        result: [],
        message: "No reviews found matching your search",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Oops there is an Error",
    });
  }
};

/**
 *  Get all reviews by the currently authenticated user
 */
exports.myReviews = async (req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  try {
    const AccessibilityReview = getModel();
    const filter = { userId: req.user._id, removed: false };

    const resultsPromise = AccessibilityReview.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: "desc" })
      .populate("userId", "name surname email")
      .exec();

    const countPromise = AccessibilityReview.countDocuments(filter);

    const [result, count] = await Promise.all([resultsPromise, countPromise]);
    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result,
        pagination,
        message: "Successfully found your reviews",
      });
    } else {
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: "You have no reviews yet",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Oops there is an Error",
    });
  }
};