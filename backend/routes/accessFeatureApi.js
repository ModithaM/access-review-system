const express = require('express');
const router = express.Router();
const accessFeatureController = require('../controllers/accessFeatureController');
const { isValidToken } = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

/**
 * @swagger
 * tags:
 *   - name: Access Features
 *     description: API for managing accessibility criteria (source of truth for reviews)
 */

/**
 * @swagger
 * /access-features:
 *   post:
 *     summary: Create a new access feature (accessibility criterion)
 *     tags: [Access Features]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tactile Paving"
 *               description:
 *                 type: string
 *                 example: "Textured ground surface indicators to assist pedestrians who are visually impaired."
 *               category:
 *                 type: string
 *                 enum: [Mobility, Visual, Auditory, Cognitive, Other]
 *                 default: Mobility
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Access feature created
 *       400:
 *         description: Validation error or duplicate name
 */
router.post('/', isValidToken, catchErrors(accessFeatureController.createAccessFeature));

/**
 * @swagger
 * /access-features:
 *   get:
 *     summary: Get all access features (for reviewers to select from)
 *     tags: [Access Features]
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: If "true", returns only active features
 *     responses:
 *       200:
 *         description: List of access features
 */
router.get('/', catchErrors(accessFeatureController.getAllAccessFeatures));

/**
 * @swagger
 * /access-features/{id}:
 *   get:
 *     summary: Get a single access feature by ID
 *     tags: [Access Features]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Access feature ID
 *     responses:
 *       200:
 *         description: Access feature details
 *       404:
 *         description: Access feature not found
 */
router.get('/:id', catchErrors(accessFeatureController.getAccessFeatureById));

/**
 * @swagger
 * /access-features/{id}:
 *   put:
 *     summary: Update an existing access feature
 *     tags: [Access Features]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Access feature ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Mobility, Visual, Auditory, Cognitive, Other]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Access feature not found
 *       400:
 *         description: Validation error or duplicate name
 */
router.put('/:id', isValidToken, catchErrors(accessFeatureController.updateAccessFeature));

/**
 * @swagger
 * /access-features/{id}:
 *   delete:
 *     summary: Permanently delete an access feature
 *     description: Removes the feature from the database. This action cannot be undone.
 *     tags: [Access Features]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Access feature ID
 *     responses:
 *       200:
 *         description: Feature deleted successfully
 *       404:
 *         description: Access feature not found
 */
router.delete('/:id', isValidToken, catchErrors(accessFeatureController.deleteAccessFeature));

module.exports = router;
