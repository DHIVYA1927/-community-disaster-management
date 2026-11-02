const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Task description is required']
    },
    emergencyRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyRequest',
      default: null
    },
    disaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disaster',
      default: null
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'High'
    },
    status: {
      type: String,
      enum: ['Assigned', 'In-Progress', 'Completed', 'Cancelled'],
      default: 'Assigned'
    },
    location: {
      address: {
        type: String,
        default: ''
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [77.2090, 28.6139]
      }
    },
    progressUpdates: [
      {
        updateText: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],
    notes: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
