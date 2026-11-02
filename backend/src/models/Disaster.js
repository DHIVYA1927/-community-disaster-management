const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Disaster title is required'],
      trim: true
    },
    disasterType: {
      type: String,
      required: [true, 'Disaster type is required'],
      enum: ['Flood', 'Earthquake', 'Cyclone', 'Fire', 'Landslide', 'Tsunami', 'Other'],
      default: 'Flood'
    },
    incidentDescription: {
      type: String,
      required: [true, 'Description is required']
    },
    location: {
      address: {
        type: String,
        required: [true, 'Location address is required']
      },
      city: {
        type: String,
        default: ''
      },
      state: {
        type: String,
        default: ''
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        default: [77.2090, 28.6139]
      }
    },
    affectedPeople: {
      type: Number,
      default: 0,
      min: 0
    },
    severityLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'In-Progress', 'Resolved', 'Rejected'],
      default: 'Pending'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    reportDateTime: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disaster', disasterSchema);
