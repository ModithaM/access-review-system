const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');
const issueController = require('../controllers/issueController');
const { isValidToken } = require('../controllers/authController');

/**
 * @swagger
 * /issue/create:
 *   post:
 *     summary: Create a new accessibility issue report
 *     tags: [Issues]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, location, description, reporter]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 example: Wheelchair access blocked
 *               location:
 *                 type: string
 *                 maxLength: 300
 *                 example: City Mall - Main Entrance
 *               description:
 *                 type: string
 *                 minLength: 20
 *                 maxLength: 2000
 *                 example: The main entrance has a broken wheelchair ramp that prevents wheelchair users from accessing the building.
 *               category:
 *                 type: string
 *                 enum: [Mobility Access, Visual Access, Hearing Access, Parking, Restrooms, Signage, Elevators, Other]
 *                 example: Mobility Access
 *               severity:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 example: High
 *               reporter:
 *                 type: string
 *                 maxLength: 100
 *                 example: John Doe
 *               reporterEmail:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       201:
 *         description: Issue report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/Issue'
 *                 message:
 *                   type: string
 *                   example: Issue report created successfully.
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.route('/create').post(catchErrors(issueController.create));

/**
 * @swagger
 * /issue/admin/all:
 *   get:
 *     summary: Get all issues (Admin only)
 *     tags: [Issues]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: items
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Open, In Progress, Resolved]
 *         description: Filter by status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by severity
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, location, description, reporter
 *     responses:
 *       200:
 *         description: Issues retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Issue'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/admin/all').get(isValidToken, catchErrors(issueController.getAll));

/**
 * @swagger
 * /issue/admin/stats:
 *   get:
 *     summary: Get issue statistics for dashboard
 *     tags: [Issues]
 *     security:
 *       - xAuthToken: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         open:
 *                           type: integer
 *                         inProgress:
 *                           type: integer
 *                         resolved:
 *                           type: integer
 *                     byStatus:
 *                       type: array
 *                     bySeverity:
 *                       type: array
 *                     byCategory:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route('/admin/stats').get(isValidToken, catchErrors(issueController.getStats));

/**
 * @swagger
 * /issue/admin/{id}:
 *   get:
 *     summary: Get single issue by ID (Admin only)
 *     tags: [Issues]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue retrieved successfully
 *       400:
 *         description: Invalid issue ID
 *       404:
 *         description: Issue not found
 *       401:
 *         description: Unauthorized
 */
router.route('/admin/:id').get(isValidToken, catchErrors(issueController.getOne));

/**
 * @swagger
 * /issue/admin/{id}:
 *   patch:
 *     summary: Update issue (Admin only)
 *     tags: [Issues]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Open, In Progress, Resolved]
 *                 example: In Progress
 *               severity:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *                 example: High
 *               adminNotes:
 *                 type: string
 *                 maxLength: 2000
 *                 example: Issue is being investigated
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Issue not found
 *       401:
 *         description: Unauthorized
 */
router.route('/admin/:id').patch(isValidToken, catchErrors(issueController.update));

/**
 * @swagger
 * /issue/admin/{id}:
 *   delete:
 *     summary: Delete issue (Admin only)
 *     tags: [Issues]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Issue ID
 *     responses:
 *       200:
 *         description: Issue deleted successfully
 *       400:
 *         description: Invalid issue ID
 *       404:
 *         description: Issue not found
 *       401:
 *         description: Unauthorized
 */
router.route('/admin/:id').delete(isValidToken, catchErrors(issueController.delete));

/**
 * @swagger
 * /issue/user/my-issues:
 *   get:
 *     summary: Get authenticated user's issue reports
 *     tags: [Issues]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: items
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User issues retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.route('/user/my-issues').get(isValidToken, catchErrors(issueController.getUserIssues));

module.exports = router;
