import mongoose from 'mongoose';

const divisionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D', 'E'],
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Year',
    required: true,
  },
  strength: {
    type: Number,
    required: true,
    min: 1,
  },
  startingRoll: {
    type: Number,
    required: true,
    min: 1,
  },
  endingRoll: {
    type: Number,
    required: true,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
divisionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Division || mongoose.model('Division', divisionSchema); 