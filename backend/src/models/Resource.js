const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    resourceName: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Resource category is required'],
      enum: [
        'Food packets',
        'Drinking water',
        'Medicines',
        'Clothes',
        'Blankets',
        'First aid kits',
        'Rescue equipment'
      ]
    },
    unit: {
      type: String,
      default: 'Units'
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    requiredQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    allocatedQuantity: {
      type: Number,
      default: 0,
      min: 0
    },
    storageLocation: {
      type: String,
      required: [true, 'Storage location is required'],
      trim: true
    },
    distributionStatus: {
      type: String,
      enum: ['In-Stock', 'Low-Stock', 'Out-of-Stock'],
      default: 'In-Stock'
    },
    minimumThreshold: {
      type: Number,
      default: 20
    }
  },
  { timestamps: true }
);

// Auto-update distribution status based on available quantity
resourceSchema.pre('save', function () {
  if (this.availableQuantity <= 0) {
    this.distributionStatus = 'Out-of-Stock';
  } else if (this.availableQuantity <= this.minimumThreshold) {
    this.distributionStatus = 'Low-Stock';
  } else {
    this.distributionStatus = 'In-Stock';
  }
});

module.exports = mongoose.model('Resource', resourceSchema);
