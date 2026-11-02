const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    skills: {
      type: [String],
      default: ['First Aid', 'Emergency Evacuation']
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Busy', 'On-Mission', 'Inactive'],
      default: 'Available'
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'O+'
    },
    contactNumber: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    location: {
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.2090, 28.6139]
      },
      address: {
        type: String,
        default: ''
      }
    },
    totalTasksCompleted: {
      type: Number,
      default: 0
    },
    badge: {
      type: String,
      default: 'First Responder'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
