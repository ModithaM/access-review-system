const express = require('express');
const router = express.Router();
const publicSpaceController = require('../controllers/publicSpaceController');
const { isValidToken } = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

/**
 * @swagger
 * tags:
 *   - name: Public Spaces
 *     description: API endpoints for managing public spaces
 */

/**
 * @swagger
 * /public-space/create:
 *   post:
 *     summary: Create a new public space
 *     tags: [Public Spaces]
 *     security:
 *       - xAuthToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Mall, Park, Hospital, Station, Other]
 *               locationDetails:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *               imageUrl:
 *                 type: string
 *                 example: "../public/uploads/publicSpaces/default-space.jpg"
 *               description:
 *                 type: string
 *               accessFeatures:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Selected access feature IDs for this public space
 *     responses:
 *       201:
 *         description: Space created
 */
router.post('/create', isValidToken, catchErrors(publicSpaceController.createPublicSpace));

/**
 * @swagger
 * /public-space/list:
 *   get:
 *     summary: Get all public spaces
 *     tags: [Public Spaces]
 *     responses:
 *       200:
 *         description: List of spaces
 */
router.get('/list', catchErrors(publicSpaceController.getAllPublicSpaces));

/**
 * @swagger
 * /public-space/update/{id}:
 *   patch:
 *     summary: Update an existing public space
 *     tags: [Public Spaces]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Public space ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Fields to update on the public space
 *             properties:
 *               accessFeatures:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Public space not found
 */
router.patch('/update/:id', isValidToken, catchErrors(publicSpaceController.updatePublicSpace));

/**
 * @swagger
 * /public-space/delete/{id}:
 *   delete:
 *     summary: Delete a public space
 *     tags: [Public Spaces]
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
 *         description: Deleted successfully
 *       404:
 *         description: Public space not found
 */
router.delete('/delete/:id', isValidToken, catchErrors(publicSpaceController.deletePublicSpace));

/**
 * @swagger
 * /public-space/search/{name}:
 *   get:
 *     summary: Search public spaces by name (partial, case-insensitive)
 *     tags: [Public Spaces]
 *     # No security: public search
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         example: "park"
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search/:name', catchErrors(publicSpaceController.getPublicSpaceByName));

module.exports = router;
