const express = require('express');
const router = express.Router();
const User = require('~/models/User');
const { Transaction } = require('~/models/Transaction');
const { Message } = require('~/models/Message');
const Balance = require('~/models/Balance');

const authenticateDashboard = (req, res, next) => {
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;
  const providedPassword = req.headers['x-dashboard-password'];

  if (!dashboardPassword || providedPassword !== dashboardPassword) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.get('/user-stats', authenticateDashboard, async (req, res) => {
  try {
    const startDate = new Date('2025-01-27');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Use the later of startDate or thirtyDaysAgo
    const effectiveStartDate = startDate > thirtyDaysAgo ? startDate : thirtyDaysAgo;

    const period = req.query.period || '30d';
    const periodStartDate = period === '24h' ? last24Hours : 
                          period === '7d' ? sevenDaysAgo : 
                          effectiveStartDate;
    
    const [dailyStats, totalUsers, tokenStats, last24hUsers, topUsers, lastMessages] = await Promise.all([
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: effectiveStartDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]),
      User.countDocuments(),
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: effectiveStartDate }
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              },
              model: '$model'
            },
            totalTokens: { 
              $sum: { $abs: '$tokenValue' }
            }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ]),
      User.countDocuments({
        createdAt: { $gte: yesterday }
      }),
      Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: periodStartDate }
          }
        },
        {
          $group: {
            _id: '$user',
            transactionCount: { $sum: 1 },
            totalTokens: { $sum: { $abs: '$tokenValue' } }
          }
        },
        {
          $sort: { transactionCount: -1 }
        },
        {
          $limit: 50
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: '$userDetails'
        },
        {
          $lookup: {
            from: 'balances',
            localField: '_id',
            foreignField: 'user',
            as: 'balanceDetails'
          }
        },
        {
          $unwind: {
            path: '$balanceDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            email: '$userDetails.email',
            tier: '$userDetails.subscriptionTier',
            transactionCount: 1,
            totalTokens: 1,
            balance: { $ifNull: ['$balanceDetails.tokenCredits', 0] }
          }
        }
      ]),
      Message.find({
        sender: 'User',
        createdAt: { $gte: effectiveStartDate }
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean()
    ]);

    // Process token stats into a table format
    const models = [...new Set(tokenStats.map(stat => stat._id.model))].sort();
    const dates = [...new Set(tokenStats.map(stat => stat._id.date))].sort();
    
    const tokenTable = dates.map(date => {
      const row = { date };
      let rowTotal = 0;
      
      models.forEach(model => {
        const stat = tokenStats.find(s => s._id.date === date && s._id.model === model);
        const value = stat ? Math.round(stat.totalTokens) : 0;
        row[model] = value;
        rowTotal += value;
      });
      
      row.total = rowTotal;
      return row;
    });

    // Calculate totals for each model
    const modelTotals = { date: 'Total' };
    let grandTotal = 0;
    
    models.forEach(model => {
      const total = tokenStats
        .filter(stat => stat._id.model === model)
        .reduce((sum, stat) => sum + stat.totalTokens, 0);
      modelTotals[model] = Math.round(total);
      grandTotal += total;
    });
    modelTotals.total = Math.round(grandTotal);
    tokenTable.push(modelTotals);

    // Format the messages data
    const formattedMessages = lastMessages.map(msg => ({
      messageId: msg.messageId,
      text: msg.text,
      createdAt: msg.createdAt,
      conversationId: msg.conversationId,
      tokenCount: msg.tokenCount || 0
    }));

    res.json({
      dailyStats,
      totalUsers,
      last24hUsers,
      tokenTable,
      models,
      topUsers,
      lastMessages: formattedMessages
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/user-lookup', authenticateDashboard, async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const balance = await Balance.findOne({ user: user._id }).lean();

    // Get user's last 10 messages
    const messages = await Message.find({ 
      sender: 'User',
      user: user._id 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Format messages
    const formattedMessages = messages.map(msg => ({
      messageId: msg.messageId,
      text: msg.text,
      createdAt: msg.createdAt,
      conversationId: msg.conversationId,
      model: msg.model,
      tokenCount: msg.tokenCount || 0
    }));

    res.json({
      email: user.email,
      tier: user.subscriptionTier,
      balance: balance?.tokenCredits || 0,
      messages: formattedMessages
    });
  } catch (error) {
    console.error('Error looking up user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/update-user', authenticateDashboard, async (req, res) => {
  try {
    const { email, tier, balance } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user tier
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          subscriptionTier: tier,
          subscriptionStatus: tier === 'FREE' ? 'EXPIRED' : 'ACTIVE'
        } 
      }
    );

    // Update or create balance
    await Balance.findOneAndUpdate(
      { user: user._id },
      { $set: { tokenCredits: balance } },
      { upsert: true }
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 