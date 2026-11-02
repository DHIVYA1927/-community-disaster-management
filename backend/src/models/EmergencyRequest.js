const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema(
  {
    disasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disaster',
      default: null
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestType: {
      type: String,
      required: [true, 'Request type is required'],
      enum: ['Rescue', 'Medical', 'Food', 'Drinking Water', 'Shelter', 'Clothes', 'Other'],
      default: 'Rescue'
    },
    urgencyLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'High'
    },
    description: {
      type: String,
      required: [true, 'Request details/description is required']
    },
    peopleCount: {
      type: Number,
      default: 1,
      min: 1
    },
    location: {
      address: {
        type: String,
        required: [true, 'Location is required']
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.2090, 28.6139]
      }
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required']
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In-Progress', 'Fulfilled', 'Cancelled'],
      default: 'Pending'
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    fulfillmentNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
