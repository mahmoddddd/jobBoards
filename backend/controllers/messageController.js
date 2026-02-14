const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User'); // Assuming you have a User model
const { sendToUser } = require('../config/socket');

// @desc    Start/Get conversation with a user
// @route   POST /api/messages/conversations
// @access  Private
exports.startConversation = async (req, res) => {
  try {
    const { recipientId, projectId } = req.body;
    const senderId = req.user.id;

    if (!recipientId) return res.status(400).json({ success: false, message: 'مستلم غير محدد' });
    if (recipientId === senderId) return res.status(400).json({ success: false, message: 'لا يمكنك مراسلة نفسك' });

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
      ...(projectId ? { projectId } : {}) // Optional: scope by project if needed
    }).populate('participants', 'name email role avatar'); // Use 'avatar' or whatever profile pic field you have

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        projectId: projectId || undefined
      });
      // Re-populate for response
      conversation = await conversation.populate('participants', 'name email role avatar');
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'حدث خطأ في بدء المحادثة', error: error.message });
  }
};

// @desc    Get my conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name email role avatar')
    .populate('projectId', 'title')
    .sort({ 'lastMessage.createdAt': -1 });

    res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب المحادثات', error: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Authorization check: User must be participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'المحادثة غير موجودة' });

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بدخول هذه المحادثة' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name role avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب الرسائل', error: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, attachments } = req.body;
    const senderId = req.user.id;

    if (!content && (!attachments || attachments.length === 0)) {
       return res.status(400).json({ success: false, message: 'المحتوى مطلوب' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'المحادثة غير موجودة' });

    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    const newMessage = await Message.create({
      conversationId,
      sender: senderId,
      content,
      attachments
    });

    // Populate sender info immediately for socket broadcast efficiency
    await newMessage.populate('sender', 'name role avatar');

    // Update conversation's last message
    conversation.lastMessage = {
      content: content.substring(0, 100) + (content.length > 100 ? '...' : ''), // truncate for preview
      sender: senderId,
      isRead: false,
      createdAt: newMessage.createdAt
    };
    await conversation.save();

    // Notify recipient via Socket.io
    const recipientId = conversation.participants.find(p => p.toString() !== senderId);
    if (recipientId) {
      sendToUser(recipientId.toString(), 'new-message', {
        message: newMessage,
        conversationId
      });

      // Update unread count or notify new message arrival
      sendToUser(recipientId.toString(), 'notification', {
        type: 'MESSAGE',
        title: 'رسالة جديدة',
        message: `${req.user.name}: ${content.substring(0, 50)}`,
        link: `/messages/${conversationId}`
      });
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'فشل إرسال الرسالة', error: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:conversationId
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify participation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'المحادثة غير موجودة' });
    if (!conversation.participants.includes(userId)) {
        return res.status(403).json({ success: false, message: 'غير مصرح' });
    }

    // Update all unread messages where sender IS NOT me (i.e. I am the recipient)
    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // If last message was sent by other, mark it read in conversation summary too
    if (conversation.lastMessage && conversation.lastMessage.sender && conversation.lastMessage.sender.toString() !== userId) {
        conversation.lastMessage.isRead = true;
        await conversation.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث حالة القراءة', error: error.message });
  }
};
