const mongoose = require('mongoose');

const newsViewedSchema = mongoose.Schema(
  {
    userId: { type: String, required: true },
    newsId: { type: mongoose.Schema.Types.ObjectId, ref: 'News', required: true },
    viewedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Add compound index for userId and newsId
newsViewedSchema.index({ userId: 1, newsId: 1 }, { unique: true });

const NewsViewed = mongoose.model('NewsViewed', newsViewedSchema);

module.exports = NewsViewed; 