const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  locationHistory: [{
    coordinates: {
      type: [Number],
      required: true
    },
    accuracy: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'cancelled', 'resolved', 'en_route', 'on_scene'],
    default: 'active'
  },
  description: {
    type: String,
    trim: true
  },
  responders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  guardiansNotified: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create geospatial index
sosAlertSchema.index({ location: '2dsphere' });

const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);

module.exports = SOSAlert; 