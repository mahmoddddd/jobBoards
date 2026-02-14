const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// @desc    Get wallet balance and transactions
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('balance');
    const transactions = await WalletTransaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        balance: user.balance || 0,
        transactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate deposit (Top up)
// @route   POST /api/wallet/deposit
// @access  Private
exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'المبلغ غير صالح' });
    }

    // In a real app, this would integrate with Stripe/PayPal
    // Here we simulate a successful deposit

    const user = await User.findById(req.user.id);
    user.balance = (user.balance || 0) + parseFloat(amount);
    await user.save();

    await WalletTransaction.create({
      userId: req.user.id,
      type: 'DEPOSIT',
      amount: amount,
      status: 'COMPLETED',
      description: 'شحن رصيد (تجريبي)',
      paymentMethod: 'CARD'
    });

    res.status(200).json({
      success: true,
      message: 'تم شحن الرصيد بنجاح',
      balance: user.balance
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
exports.withdraw = async (req, res) => {
  try {
    const { amount, method, details } = req.body; // method: 'PAYPAL', 'BANK'

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'المبلغ غير صالح' });
    }

    const user = await User.findById(req.user.id);

    if ((user.balance || 0) < amount) {
      return res.status(400).json({ success: false, message: 'رصيدك غير كافي' });
    }

    // Deduct from balance immediately (or hold it)
    user.balance -= parseFloat(amount);
    await user.save();

    await WalletTransaction.create({
      userId: req.user.id,
      type: 'WITHDRAWAL',
      amount: amount,
      status: 'PENDING', // Needs admin approval
      description: `طلب سحب عبر ${method || 'Generic'} - ${details || ''}`,
      paymentMethod: method
    });

    res.status(200).json({
      success: true,
      message: 'تم استلام طلب السحب وسوف تتم معالجته قريباً',
      balance: user.balance
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
