const express = require('express');
const router = express.Router();
const News = require('../../models/News');
const NewsViewed = require('../../models/NewsViewed');

// Middleware to check dashboard password
const checkDashboardAuth = (req, res, next) => {
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;
  const providedPassword = req.headers['x-dashboard-password'];

  console.log('Dashboard auth check:', { 
    hasEnvPassword: !!dashboardPassword,
    envPasswordLength: dashboardPassword?.length,
    hasProvidedPassword: !!providedPassword,
    providedPasswordLength: providedPassword?.length,
    passwordsMatch: dashboardPassword === providedPassword,
    headers: req.headers
  });

  if (!dashboardPassword || providedPassword !== dashboardPassword) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Get latest active news for a user
router.get('/latest/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    // Find the latest active news that hasn't been viewed by the user
    const latestNews = await News.findOne({
      active: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gt: now } }
      ]
    })
    .sort({ priority: -1, createdAt: -1 })
    .lean();

    if (!latestNews) {
      return res.json(null);
    }

    // Check if user has already viewed this news
    const viewed = await NewsViewed.findOne({
      userId,
      newsId: latestNews._id
    });

    if (viewed) {
      return res.json(null);
    }

    res.json(latestNews);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark news as viewed
router.post('/viewed', async (req, res) => {
  try {
    const { userId, newsId } = req.body;

    if (!userId || !newsId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await NewsViewed.create({ userId, newsId });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.json({ success: true }); // Already viewed is fine
    }
    console.error('Error marking news as viewed:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes
// Get all news
router.get('/all', checkDashboardAuth, async (req, res) => {
  try {
    const news = await News.find().sort({ priority: -1, createdAt: -1 });
    res.json(news);
  } catch (error) {
    console.error('Error fetching all news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create news
router.post('/', checkDashboardAuth, async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update news
router.put('/:id', checkDashboardAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByIdAndUpdate(id, req.body, { new: true });
    res.json(news);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete news
router.delete('/:id', checkDashboardAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await News.findByIdAndDelete(id);
    await NewsViewed.deleteMany({ newsId: id });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 