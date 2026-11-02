const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null indicates broadcast
    },
    targetRole: {
      type: String,
      enum: ['all', 'citizen', 'volunteer', 'administrator'],
      default: 'all'
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required']
    },
    type: {
      type: String,
      enum: ['Emergency Alert', 'Task Update', 'Resource Allocation', 'Shelter Notice', 'General Announcement'],
      default: 'Emergency Alert'
    },
    severity: {
      type: String,
      enum: ['Info', 'Warning', 'High', 'Critical'],
      default: 'Warning'
    },
    isBroadcast: {
      type: Boolean,
      default: true
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    link: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
