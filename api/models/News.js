const mongoose = require('mongoose');

const newsSchema = mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      ru: { type: String, required: true }
    },
    content: {
      en: { type: String, required: true },
      ru: { type: String, required: true }
    },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 }, // Higher number = higher priority
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // Optional end date
  },
  { timestamps: true }
);

// Add indexes
newsSchema.index({ active: 1, startDate: 1, endDate: 1 });
newsSchema.index({ priority: -1 }); // Descending index for priority

const News = mongoose.model('News', newsSchema);

module.exports = News; 