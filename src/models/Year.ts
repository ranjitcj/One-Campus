import mongoose from 'mongoose';

const yearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
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
yearSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Year || mongoose.model('Year', yearSchema); 