const express = require('express');
const router = express.Router();
const Resource = require('../models/resource');

// Get all resources with filtering
router.get('/', async (req, res) => {
    try {
        const { category, type, search } = req.query;
        let query = {};

        if (category && category !== 'All') {
            query.category = category;
        }
        if (type && type !== 'All') {
            query.type = type;
        }
        if (search) {
            query.$text = { $search: search };
        }

        const resources = await Resource.find(query).sort({ createdAt: -1 });
        res.json(resources);
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a resource (For admin or seeding)
router.post('/', async (req, res) => {
    try {
        const resource = new Resource(req.body);
        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
