const express = require('express');
const router = express.Router();
const University = require('../models/university');
const Student = require('../models/student');
const auth = require('../middleware/auth');
const { calculateFitScore } = require('../utils/fitScoreCalculator');

// Get All Universities with Filters
router.get('/', async (req, res) => {
  try {
    const {
      country,
      major,
      minRanking,
      maxRanking,
      minTuition,
      maxTuition,
      search,
      page = 1,
      limit = 12
    } = req.query;

    let query = {};

    if (country) {
      query.country = new RegExp(country, 'i');
    }

    if (major) {
      query['academics.majorsOffered'] = new RegExp(major, 'i');
    }

    if (minRanking || maxRanking) {
      query['ranking.global'] = {};
      if (minRanking) query['ranking.global'].$gte = parseInt(minRanking);
      if (maxRanking) query['ranking.global'].$lte = parseInt(maxRanking);
    }

    if (minTuition || maxTuition) {
      query['financials.tuitionFee.international.min'] = {};
      if (minTuition) query['financials.tuitionFee.international.min'].$gte = parseInt(minTuition);
      if (maxTuition) query['financials.tuitionFee.international.min'].$lte = parseInt(maxTuition);
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { 'academics.majorsOffered': new RegExp(search, 'i') },
        { country: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const universities = await University.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'ranking.global': 1 });

    const total = await University.countDocuments(query);

    res.json({
      universities,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get University by ID
router.get('/:id', async (req, res) => {
  try {
    const university = await University.findById(req.params.id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    res.json(university);
  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate Fit Score for a University (requires authentication)
router.get('/:id/fit-score', auth, async (req, res) => {
  try {
    const university = await University.findById(req.params.id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    const student = await Student.findById(req.student._id);
    const fitScore = calculateFitScore(student, university);

    res.json({ fitScore, university: university.name });
  } catch (error) {
    console.error('Calculate fit score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Universities with Fit Scores (requires authentication)
router.get('/search/with-fit-scores', auth, async (req, res) => {
  try {
    const {
      country,
      major,
      minRanking,
      maxRanking,
      minTuition,
      maxTuition,
      limit = 12
    } = req.query;

    let query = {};

    if (country) query.country = new RegExp(country, 'i');
    if (major) query['academics.majorsOffered'] = new RegExp(major, 'i');
    if (minRanking || maxRanking) {
      query['ranking.global'] = {};
      if (minRanking) query['ranking.global'].$gte = parseInt(minRanking);
      if (maxRanking) query['ranking.global'].$lte = parseInt(maxRanking);
    }

    const universities = await University.find(query).limit(parseInt(limit));
    const student = await Student.findById(req.student._id);

    const universitiesWithScores = universities.map(uni => ({
      ...uni.toObject(),
      fitScore: calculateFitScore(student, uni)
    }));

    // Sort by fit score
    universitiesWithScores.sort((a, b) => b.fitScore - a.fitScore);

    res.json(universitiesWithScores);
  } catch (error) {
    console.error('Get universities with fit scores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;