const express = require('express');
const router = express.Router();
const User = require('~/models/User');
const { Transaction } = require('~/models/Transaction');

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
    
    const [dailyStats, totalUsers, tokenStats] = await Promise.all([
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
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
            createdAt: { $gte: startDate }
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
      ])
    ]);

    res.json({
      dailyStats,
      totalUsers,
      tokenStats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 