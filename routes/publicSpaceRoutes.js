const express = require('express');
const router = express.Router();
const publicSpaceController = require('../controllers/publicSpaceController');

// Route to create a new public space
router.post('/', publicSpaceController.createPublicSpace);

// Route to get all public spaces
router.get('/', publicSpaceController.getAllPublicSpaces);

module.exports = router;