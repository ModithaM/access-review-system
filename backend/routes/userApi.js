const express = require('express');
const router = express.Router();
const { catchErrors } = require('../handlers/errorHandlers');
const userController = require('../controllers/userController');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6989804b35343b10f51a800b
 *         removed:
 *           type: boolean
 *           example: false
 *         enabled:
 *           type: boolean
 *           example: true
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         userType:
 *           type: string
 *           enum: [admin, user, guest]
 *           example: user
 *         name:
 *           type: string
 *           example: John
 *         surname:
 *           type: string
 *           example: Doe
 *         photo:
 *           type: string
 *           example: https://example.com/photo.jpg
 *         isLoggedIn:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-01T00:00:00.000Z
 *
 *     AccessibilityReview:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6989804b35343b10f51a800b
 *         spaceId:
 *           type: string
 *           example: 6989804b35343b10f51a800c
 *         userId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             surname:
 *               type: string
 *             email:
 *               type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         comment:
 *           type: string
 *           example: This space has excellent wheelchair ramps
 *         title:
 *           type: string
 *           example: Great accessibility
 *         features:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               featureName:
 *                 type: string
 *                 example: Wheelchair Ramp
 *               available:
 *                 type: boolean
 *                 example: true
 *               condition:
 *                 type: string
 *                 enum: [excellent, good, fair, poor, not_available]
 *                 example: good
 *         removed:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         result:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 6989804b35343b10f51a800b
 *                 name:
 *                   type: string
 *                   example: John
 *                 isLoggedIn:
 *                   type: boolean
 *                   example: true
 *                 userType:
 *                   type: string
 *                   enum: [admin, user, guest]
 *                   example: user
 *         message:
 *           type: string
 *           example: Successfully logged-in user.
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         result:
 *           nullable: true
 *           example: null
 *         message:
 *           type: string
 *           example: Oops there is an Error
 */

//_______________________________ User management_______________________________

/**
 * @swagger
 * /user/read/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 6989804b35343b10f51a800b
 *         description: User document ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: we found this document by this id
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.route('/read/:id').get(catchErrors(userController.read));

/**
 * @swagger
 * /user/update/{id}:
 *   patch:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 6989804b35343b10f51a800b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: we update this document by this id
 *       400:
 *         description: Email already exists
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.route('/update/:id').patch(catchErrors(userController.update));

/**
 * @swagger
 * /user/delete/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 6989804b35343b10f51a800b
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Successfully Deleted the document by id
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.route('/delete/:id').delete(catchErrors(userController.delete));

/**
 * @swagger
 * /user/search:
 *   get:
 *     summary: Search users by fields
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: john
 *         description: Search keyword
 *       - in: query
 *         name: fields
 *         required: true
 *         schema:
 *           type: string
 *           example: name,surname,email
 *         description: Comma-separated list of fields to search in
 *     responses:
 *       200:
 *         description: Users found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Successfully found all documents
 *       202:
 *         description: No documents found
 *       500:
 *         description: Server error
 */
router.route('/search').get(catchErrors(userController.search));

/**
 * @swagger
 * /user/list:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number
 *       - in: query
 *         name: items
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully found all documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pages:
 *                       type: integer
 *                       example: 5
 *                     count:
 *                       type: integer
 *                       example: 50
 *                 message:
 *                   type: string
 *                   example: Successfully found all documents
 *       203:
 *         description: Collection is empty
 *       500:
 *         description: Server error
 */
router.route('/list').get(catchErrors(userController.list));

/**
 * @swagger
 * /user/password-update/{id}:
 *   patch:
 *     summary: Update a user's password by ID
 *     tags: [Users]
 *     security:
 *       - xAuthToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 6989804b35343b10f51a800b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: password123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: we update the password by this id
 *       400:
 *         description: Password too short or missing
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.route('/password-update/:id').patch(catchErrors(userController.updatePassword));
//list of users ends here

module.exports = router;
