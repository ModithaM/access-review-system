const PublicSpace = require('../models/PublicSpace');

// Create a new public space
exports.createPublicSpace = async (req, res) => {
    try {
        const newSpace = new PublicSpace(req.body);
        const savedSpace = await newSpace.save();

        //response with status code and data
        res.status(201).json({
            success: true,
            data: savedSpace
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all public spaces from DB
exports.getAllPublicSpaces = async (req, res) => {
    try {
        const spaces = await PublicSpace.find();

        res.status(200).json({
            success: true,
            count: spaces.length,
            data: spaces
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};