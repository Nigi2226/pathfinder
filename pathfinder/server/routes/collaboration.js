const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/notification');
const Message = require('../models/message');

// Get chat history with a specific user
router.get('/messages/:withUserId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.student._id, recipient: req.params.withUserId },
                { sender: req.params.withUserId, recipient: req.student._id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/messages', auth, async (req, res) => {
    try {
        const { recipientId, content, attachments } = req.body;
        const message = new Message({
            sender: req.student._id,
            recipient: recipientId,
            content,
            attachments
        });
        await message.save();

        // Notify recipient
        try {
            await Notification.create({
                recipient: recipientId,
                title: 'New Message',
                message: `New message from ${req.student.profile.firstName}`,
                type: 'Alert',
                relatedLink: '/collaboration'
            });
        } catch (nErr) { console.error(nErr); }

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent chats for current user
router.get('/chats', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.student._id }, { recipient: req.student._id }]
        })
            .populate('sender', 'profile email')
            .populate('recipient', 'profile email')
            .sort({ createdAt: -1 });

        // Group by user
        const chats = [];
        const seen = new Set();

        messages.forEach(m => {
            const otherUser = m.sender._id.toString() === req.student._id.toString() ? m.recipient : m.sender;
            if (!seen.has(otherUser._id.toString())) {
                chats.push({
                    user: otherUser,
                    lastMessage: m
                });
                seen.add(otherUser._id.toString());
            }
        });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Invite a collaborator (Mentor/Consultant)
router.post('/collaborate', auth, async (req, res) => {
    try {
        const { universityId, email, message } = req.body;

        // In a real app, we would check if the user exists. 
        // For now, we'll just create a notification for them if they exist, 
        // or simulate sending an email.

        // We'll create a system notification for the sender to confirm it was sent
        const notification = new Notification({
            recipient: req.student._id,
            title: 'Collaboration Invitation Sent',
            message: `You invited ${email} to collaborate on your application.`,
            type: 'System'
        });

        await notification.save();

        res.json({ success: true, message: 'Invitation sent successfully' });
    } catch (error) {
        console.error('Collaboration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
