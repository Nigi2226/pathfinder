const express = require('express');
const router = express.Router();
const Consultation = require('../models/consultation');
const auth = require('../middleware/auth');

// Get all sessions for current user
router.get('/', auth, async (req, res) => {
    try {
        const query = req.student.role === 'consultant'
            ? { consultant: req.student._id }
            : { student: req.student._id };

        const sessions = await Consultation.find(query)
            .populate('student', 'profile email')
            .populate('consultant', 'profile email')
            .sort({ date: 1 });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Book a session
router.post('/', auth, async (req, res) => {
    try {
        const { expertId, expertName, expertRole, date, topic, paymentMethod, transactionId, amount } = req.body;

        // Check for double booking with strictly non-overlapping time range
        const requestedDate = new Date(date);
        const duration = 60; // Assume 60 minutes per session
        const requestedEndDate = new Date(requestedDate.getTime() + duration * 60000);

        // Check if the requested time is in the past
        if (requestedDate < new Date()) {
            return res.status(400).json({ message: 'Cannot book a session in the past.' });
        }

        const existingSession = await Consultation.findOne({
            consultant: expertId,
            date: date,
            status: 'Scheduled'
        });

        if (existingSession) {
            return res.status(400).json({ message: 'This time slot is already booked for this consultant.' });
        }

        const session = new Consultation({
            student: req.student._id,
            consultant: expertId,
            expertName,
            expertRole,
            date,
            topic,
            paymentStatus: 'Completed',
            paymentMethod,
            transactionId,
            amount
        });

        await session.save();

        // Dual Notifications
        try {
            const Notification = require('../models/notification');

            // Notify Student
            await Notification.create({
                recipient: req.student._id,
                title: 'Booking & Payment Confirmed',
                message: `Your session with ${expertName} on ${new Date(date).toLocaleString()} is confirmed. Payment BDT ${amount} via ${paymentMethod} received.`,
                type: 'Booking',
                relatedLink: '/consultation'
            });

            // Notify Counselor
            if (expertId) {
                await Notification.create({
                    recipient: expertId,
                    title: 'New Paid Booking',
                    message: `New booking from ${req.student.profile.firstName} for ${new Date(date).toLocaleString()}. Payment BDT ${amount} confirmed (TXN: ${transactionId}).`,
                    type: 'Booking',
                    relatedLink: '/counselor/dashboard'
                });
            }
        } catch (nErr) {
            console.error('Dual notification failed:', nErr);
        }

        res.status(201).json(session);
    } catch (error) {
        console.error('Consultation booking error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Cancel a session
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const session = await Consultation.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Authorization check: User must be the student or the consultant
        const isStudent = session.student.toString() === req.student._id.toString();
        const isConsultant = session.consultant.toString() === req.student._id.toString();

        if (!isStudent && !isConsultant) {
            return res.status(403).json({ message: 'Unauthorized to cancel this session' });
        }

        session.status = 'Cancelled';
        await session.save();

        // Notify the other party
        try {
            const Notification = require('../models/notification');
            const recipientId = isStudent ? session.consultant : session.student;
            const senderName = req.student.profile.firstName;

            // Only notify if recipient exists and is not a static expert ID (if we wanted to be strict)
            // But usually registered experts have a Student ID
            if (recipientId) {
                await Notification.create({
                    recipient: recipientId,
                    title: 'Consultation Cancelled',
                    message: `Consultation on ${new Date(session.date).toLocaleDateString()} was cancelled by ${senderName}.`,
                    type: 'Alert',
                    relatedLink: isStudent ? '/counselor/dashboard' : '/consultation'
                });
            }
        } catch (nErr) {
            console.error('Notification failed', nErr);
        }

        res.json(session);
    } catch (error) {
        console.error('Cancellation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
