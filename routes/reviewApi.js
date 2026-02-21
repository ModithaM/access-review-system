const express = require("express");
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const reviewController = require("../controllers/reviewController");
const { isValidToken } = require("../controllers/authController");

/**
 * @swagger
 * /review/create:
 *   post:
 *     summary: Create a new accessibility review
 *     tags: [Accessibility Reviews]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [spaceId, rating, comment]
 *             properties:
 *               spaceId:
 *                 type: string
 *                 example: 6989804b35343b10f51a800c
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comment:
 *                 type: string
 *                 example: This space has excellent wheelchair ramps and braille signs.
 *               title:
 *                 type: string
 *                 example: Great accessibility features
 *               features:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     featureName:
 *                       type: string
 *                       example: Wheelchair Ramp
 *                     available:
 *                       type: boolean
 *                       example: true
 *                     condition:
 *                       type: string
 *                       enum: [excellent, good, fair, poor, not_available]
 *                       example: good
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/AccessibilityReview'
 *                 message:
 *                   type: string
 *                   example: Accessibility review created successfully.
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/create").post(isValidToken, catchErrors(reviewController.create));

/**
 * @swagger
 * /review/read/{id}:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Accessibility Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 6989804b35343b10f51a800b
 *     responses:
 *       200:
 *         description: Review found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/AccessibilityReview'
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.route("/read/:id").get(catchErrors(reviewController.read));

/**
 * @swagger
 * /review/update/{id}:
 *   patch:
 *     summary: Update a review by ID (owner only)
 *     tags: [Accessibility Reviews]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Updated review comment
 *               title:
 *                 type: string
 *                 example: Updated title
 *               features:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     featureName:
 *                       type: string
 *                     available:
 *                       type: boolean
 *                     condition:
 *                       type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to update this review
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.route("/update/:id").patch(isValidToken, catchErrors(reviewController.update));

/**
 * @swagger
 * /review/delete/{id}:
 *   delete:
 *     summary: Delete a review by ID (owner or admin only)
 *     tags: [Accessibility Reviews]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       403:
 *         description: Not authorized to delete this review
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.route("/delete/:id").delete(isValidToken, catchErrors(reviewController.delete));

/**
 * @swagger
 * /review/list:
 *   get:
 *     summary: List all reviews with pagination and optional filters
 *     tags: [Accessibility Reviews]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: items
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: spaceId
 *         schema:
 *           type: string
 *         description: Filter by public space ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: Reviews found
 *       203:
 *         description: No reviews found
 *       500:
 *         description: Server error
 */
router.route("/list").get(catchErrors(reviewController.list));

/**
 * @swagger
 * /review/search:
 *   get:
 *     summary: Search reviews by keyword
 *     tags: [Accessibility Reviews]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Reviews found
 *       202:
 *         description: No reviews found
 *       500:
 *         description: Server error
 */
router.route("/search").get(isValidToken, catchErrors(reviewController.search));

/**
 * @swagger
 * /review/my-reviews:
 *   get:
 *     summary: Get all reviews by the currently authenticated user
 *     tags: [Accessibility Reviews]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: items
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: User's reviews found
 *       203:
 *         description: No reviews found
 *       500:
 *         description: Server error
 */
router.route("/my-reviews").get(isValidToken, catchErrors(reviewController.myReviews));

module.exports = router;