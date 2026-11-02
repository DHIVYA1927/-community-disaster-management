const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Shelter name is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      default: ''
    },
    location: {
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        default: [77.2090, 28.6139]
      }
    },
    capacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: 1
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required']
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone number is required']
    },
    facilities: {
      type: [String],
      default: ['Clean Drinking Water', 'Emergency Medical Camp', 'Hot Meals', 'Sanitation', 'Power Backup']
    },
    status: {
      type: String,
      enum: ['Active', 'Near Full', 'Full', 'Inactive'],
      default: 'Active'
    }
  },
  { timestamps: true }
);

// Auto compute status based on occupancy and capacity
shelterSchema.pre('save', function () {
  if (this.currentOccupancy >= this.capacity) {
    this.status = 'Full';
  } else if (this.currentOccupancy >= this.capacity * 0.85) {
    this.status = 'Near Full';
  } else {
    this.status = 'Active';
  }
});

module.exports = mongoose.model('Shelter', shelterSchema);
