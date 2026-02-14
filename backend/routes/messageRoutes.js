const express = require('express');
const router = express.Router();
const {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes protected

router.post('/conversations', startConversation); // Start or get existing
router.get('/conversations', getMyConversations); // List my chats
router.get('/:conversationId', getMessages); // Get messages in a chat
router.post('/', sendMessage); // Send a message
router.put('/read/:conversationId', markAsRead); // Mark messages as read

module.exports = router;
