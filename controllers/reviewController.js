const mongoose = require('mongoose');
const https = require('https');
const AccessibilityReview = require('../models/AccessibilityReview');
const PublicSpace = require('../models/PublicSpace');

const { Types } = mongoose;

const isValidObjectId = (id) => Types.ObjectId.isValid(id);

const buildPagination = (req) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.items, 10) || 10, 1);
  const skip = page * limit - limit;
  return { page, limit, skip };
};

const reviewPopulate = [
  { path: 'userId', select: 'name surname email userType' },
  { path: 'spaceId', select: 'name category locationDetails imageUrl description' },
];

const REQUEST_TIMEOUT_MS = 5000; // 5 seconds
const MAX_RESPONSE_SIZE_BYTES = 1024 * 1024; // 1 MB

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    const req = https.get(url, (response) => {
      let rawData = '';
      let aborted = false;

      response.on('data', (chunk) => {
        if (aborted) {
          return;
        }
        rawData += chunk;
        if (rawData.length > MAX_RESPONSE_SIZE_BYTES) {
          aborted = true;
          req.destroy();
          reject(
            new Error(
              `Response too large (>${MAX_RESPONSE_SIZE_BYTES} bytes) from ${url}`
            )
          );
        }
      });

      response.on('end', () => {
        if (aborted) {
          return;
        }
        const statusCode = response.statusCode || 0;
        const isJsonLike =
          (response.headers && response.headers['content-type']) ?
            response.headers['content-type'].includes('application/json') :
            false;

        if (statusCode < 200 || statusCode >= 300) {
          const error = new Error(
            `Request to ${url} failed with status ${statusCode}${
              rawData ? ` and body: ${rawData}` : ''
            }`
          );
          reject(error);
          return;
        }

        try {
          const parsed = isJsonLike ? JSON.parse(rawData || '{}') : JSON.parse(rawData || '{}');
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Request to ${url} timed out after ${REQUEST_TIMEOUT_MS}ms`));
    });
  });

/**
 *  Create a new accessibility review
 *  Only authenticated users can create reviews
 *  userId is automatically set from the JWT token (req.user)
 */
exports.create = async (req, res) => {
  try {
    const { spaceId, rating, comment, features, title } = req.body;

    if (!spaceId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'spaceId, rating, and comment are required fields.',
      });
    }

    if (!isValidObjectId(spaceId)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid spaceId.',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Rating must be between 1 and 5.',
      });
    }

    const existingSpace = await PublicSpace.findById(spaceId).select('_id');

    if (!existingSpace) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No public space found by this id: ' + spaceId,
      });
    }

    const newReview = new AccessibilityReview({
      spaceId,
      userId: req.user._id,
      rating,
      comment,
      features: features || [],
      title: title || '',
    });

    const result = await newReview.save();

    const populatedResult = await AccessibilityReview.findById(result._id)
      .populate(reviewPopulate)
      .exec();

    return res.status(201).json({
      success: true,
      result: populatedResult,
      message: 'Accessibility review created successfully.',
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        result: null,
        message: err.message,
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        result: null,
        message: 'You have already submitted an active review for this public space.',
      });
    }

    return res.status(500).json({
      success: false,
      result: null,
      message: 'Oops there is an Error: ' + err.message,
    });
  }
};

/**
 *  Get a single review by ID
 */
exports.read = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid review id.',
      });
    }

    const result = await AccessibilityReview.findOne({
      _id: req.params.id,
      removed: false,
    })
      .populate(reviewPopulate)
      .exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No review found by this id: ' + req.params.id,
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'Review found by this id: ' + req.params.id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Oops there is an Error',
    });
  }
};

/**
 *  Update a review by ID
 *  Only the user who created the review can update it
 */
exports.update = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid review id.',
      });
    }

    const existingReview = await AccessibilityReview.findOne({
      _id: req.params.id,
      removed: false,
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No review found by this id: ' + req.params.id,
      });
    }

    if (existingReview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        result: null,
        message: 'You are not authorized to update this review.',
      });
    }

    const allowedUpdates = {};
    if (req.body.rating !== undefined) allowedUpdates.rating = req.body.rating;
    if (req.body.comment !== undefined) allowedUpdates.comment = req.body.comment;
    if (req.body.features !== undefined) allowedUpdates.features = req.body.features;
    if (req.body.title !== undefined) allowedUpdates.title = req.body.title;

    const result = await AccessibilityReview.findOneAndUpdate(
      { _id: req.params.id },
      allowedUpdates,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(reviewPopulate)
      .exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'Review updated successfully by id: ' + req.params.id,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        result: null,
        message: err.message,
      });
    }
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Oops there is an Error',
    });
  }
};

/**
 *  Delete a review by ID (soft delete)
 *  Only the owner or an admin can delete
 */
exports.delete = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid review id.',
      });
    }

    const existingReview = await AccessibilityReview.findOne({
      _id: req.params.id,
      removed: false,
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No review found by this id: ' + req.params.id,
      });
    }

    const isOwner = existingReview.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        result: null,
        message: 'You are not authorized to delete this review.',
      });
    }

    const result = await AccessibilityReview.findOneAndUpdate(
      { _id: req.params.id },
      { removed: true },
      { new: true },
    ).exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'Review successfully deleted by id: ' + req.params.id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Oops there is an Error',
    });
  }
};

/**
 *  List all reviews with pagination
 *  Supports filtering by spaceId via query parameter
 */
exports.list = async (req, res) => {
  const { page, limit, skip } = buildPagination(req);

  try {
    const filter = { removed: false };

    if (req.query.spaceId) {
      if (!isValidObjectId(req.query.spaceId)) {
        return res.status(400).json({
          success: false,
          result: [],
          message: 'Invalid spaceId filter.',
        });
      }
      filter.spaceId = req.query.spaceId;
    }

    if (req.query.userId) {
      if (!isValidObjectId(req.query.userId)) {
        return res.status(400).json({
          success: false,
          result: [],
          message: 'Invalid userId filter.',
        });
      }
      filter.userId = req.query.userId;
    }

    if (req.query.minRating) {
      const minRating = parseFloat(req.query.minRating);
      if (!Number.isNaN(minRating)) {
        filter.rating = { ...(filter.rating || {}), $gte: minRating };
      }
    }

    if (req.query.maxRating) {
      const maxRating = parseFloat(req.query.maxRating);
      if (!Number.isNaN(maxRating)) {
        filter.rating = { ...(filter.rating || {}), $lte: maxRating };
      }
    }

    const resultsPromise = AccessibilityReview.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' })
      .populate(reviewPopulate)
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
        message: 'Successfully found all reviews',
      });
    } else {
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: 'No reviews found',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: 'Oops there is an Error',
    });
  }
};

/**
 *  Search reviews by keyword in comment or title
 */
exports.search = async (req, res) => {
  if (req.query.q === undefined || req.query.q === '' || req.query.q === ' ') {
    return res.status(202).json({
      success: false,
      result: [],
      message: 'No document found by this request',
    });
  }

  try {
    const searchRegex = new RegExp(req.query.q, 'i');

    const query = {
      removed: false,
      $or: [{ comment: { $regex: searchRegex } }, { title: { $regex: searchRegex } }],
    };

    if (req.query.spaceId) {
      if (!isValidObjectId(req.query.spaceId)) {
        return res.status(400).json({
          success: false,
          result: [],
          message: 'Invalid spaceId filter.',
        });
      }
      query.spaceId = req.query.spaceId;
    }

    const results = await AccessibilityReview.find(query)
      .sort({ createdAt: 'desc' })
      .limit(10)
      .populate(reviewPopulate)
      .exec();

    if (results.length >= 1) {
      return res.status(200).json({
        success: true,
        result: results,
        message: 'Successfully found matching reviews',
      });
    } else {
      return res.status(202).json({
        success: false,
        result: [],
        message: 'No reviews found matching your search',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Oops there is an Error',
    });
  }
};

/**
 *  Get all reviews by the currently authenticated user
 */
exports.myReviews = async (req, res) => {
  const { page, limit, skip } = buildPagination(req);

  try {
    const filter = { userId: req.user._id, removed: false };

    const resultsPromise = AccessibilityReview.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' })
      .populate(reviewPopulate)
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
        message: 'Successfully found your reviews',
      });
    } else {
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: 'You have no reviews yet',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: 'Oops there is an Error',
    });
  }
};

exports.listBySpace = async (req, res) => {
  const { spaceId } = req.params;
  const { page, limit, skip } = buildPagination(req);

  try {
    if (!isValidObjectId(spaceId)) {
      return res.status(400).json({
        success: false,
        result: [],
        message: 'Invalid space id.',
      });
    }

    const existingSpace = await PublicSpace.findById(spaceId).select('_id');

    if (!existingSpace) {
      return res.status(404).json({
        success: false,
        result: [],
        message: 'No public space found by this id: ' + spaceId,
      });
    }

    const filter = { removed: false, spaceId };

    const [result, count] = await Promise.all([
      AccessibilityReview.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: 'desc' })
        .populate(reviewPopulate)
        .exec(),
      AccessibilityReview.countDocuments(filter),
    ]);

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count };

    return res.status(200).json({
      success: true,
      result,
      pagination,
      message: 'Successfully found reviews for the public space',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: 'Oops there is an Error',
    });
  }
};

exports.spaceSummary = async (req, res) => {
  const { spaceId } = req.params;

  try {
    if (!isValidObjectId(spaceId)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid space id.',
      });
    }

    const existingSpace = await PublicSpace.findById(spaceId).select('_id name category');

    if (!existingSpace) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No public space found by this id: ' + spaceId,
      });
    }

    const [summaryResult, ratingBreakdown] = await Promise.all([
      AccessibilityReview.aggregate([
        { $match: { spaceId: new Types.ObjectId(spaceId), removed: false } },
        {
          $group: {
            _id: '$spaceId',
            reviewsCount: { $sum: 1 },
            averageRating: { $avg: '$rating' },
          },
        },
      ]),
      AccessibilityReview.aggregate([
        { $match: { spaceId: new Types.ObjectId(spaceId), removed: false } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const summary = summaryResult[0] || {
      _id: new Types.ObjectId(spaceId),
      reviewsCount: 0,
      averageRating: 0,
    };

    return res.status(200).json({
      success: true,
      result: {
        space: existingSpace,
        reviewsCount: summary.reviewsCount,
        averageRating: Number(summary.averageRating || 0).toFixed(2),
        ratingBreakdown,
      },
      message: 'Successfully generated review summary for the public space',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Oops there is an Error',
    });
  }
};

exports.spaceWeather = async (req, res) => {
  const { spaceId } = req.params;

  try {
    if (!isValidObjectId(spaceId)) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid space id.',
      });
    }

    const existingSpace = await PublicSpace.findById(spaceId).select(
      '_id name locationDetails.coordinates category',
    );

    if (!existingSpace) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'No public space found by this id: ' + spaceId,
      });
    }

    const lat = existingSpace.locationDetails?.coordinates?.lat;
    const lng = existingSpace.locationDetails?.coordinates?.lng;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Public space coordinates are not available for weather lookup.',
      });
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;

    const weatherPayload = await fetchJson(weatherUrl);

    return res.status(200).json({
      success: true,
      result: {
        source: 'open-meteo',
        space: {
          _id: existingSpace._id,
          name: existingSpace.name,
          category: existingSpace.category,
          coordinates: existingSpace.locationDetails.coordinates,
        },
        weather: weatherPayload.current || null,
        units: weatherPayload.current_units || null,
      },
      message: 'Successfully fetched weather details for this public space.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Oops there is an Error while fetching weather details.',
    });
  }
};
