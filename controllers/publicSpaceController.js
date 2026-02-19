const PublicSpace = require('../models/PublicSpace');

// Create a new public space
exports.createPublicSpace = async (req, res) => {
    try {
        // Extract data from request body
        const {name, category, locationDetails, imageUrl, description} = req.body;
        
        const newSpace = new PublicSpace({name, category, locationDetails, imageUrl, description});
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

// update a public space by ID
exports.updatePublicSpace = async (req, res) => {
    try {
        const updatedSpace = await PublicSpace.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, // return the updated document
                runValidators: true // run schema validators on update
            }
        );

        // if public space not found with id
        if(!updatedSpace) {
            return res.status(404).json({
                success: false,
                message: 'Public space not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedSpace
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// delete a public space by ID
exports.deletePublicSpace = async (req, res) => {
    try {
        const deletedSpace = await PublicSpace.findByIdAndDelete(req.params.id);

        // if public space not found with id
        if(!deletedSpace) {
            return res.status(404).json({
                success: false,
                message: 'Public space not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Public space deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Find space by name (Partial match, Case insensitive)
exports.getPublicSpaceByName = async (req, res) => {
    try {
        const nameQuery = req.params.name;

        const spaces = await PublicSpace.find({
            name: { $regex: nameQuery, $options: 'i' } // 'i' for case insensitive
        });

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