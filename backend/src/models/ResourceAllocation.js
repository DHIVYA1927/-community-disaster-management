const mongoose = require('mongoose');

const resourceAllocationSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    disaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disaster',
      default: null
    },
    emergencyRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyRequest',
      default: null
    },
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter',
      default: null
    },
    allocatedQuantity: {
      type: Number,
      required: [true, 'Allocated quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    purpose: {
      type: String,
      required: [true, 'Allocation purpose or target beneficiary is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'High'
    },
    status: {
      type: String,
      enum: ['Allocated', 'Dispatched', 'In-Transit', 'Delivered', 'Cancelled'],
      default: 'Allocated'
    },
    dispatchDate: {
      type: Date,
      default: Date.now
    },
    deliveryDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResourceAllocation', resourceAllocationSchema);
