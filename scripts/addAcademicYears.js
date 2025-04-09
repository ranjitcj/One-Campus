require('dotenv').config();
const mongoose = require('mongoose');

const academicYears = [
  {
    name: '2023-2024',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-05-31'),
    isActive: true
  },
  {
    name: '2024-2025',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2025-05-31'),
    isActive: false
  }
];

async function addAcademicYears() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/users_details');
    console.log('Connected to MongoDB');

    const AcademicYear = mongoose.model('AcademicYear', new mongoose.Schema({
      name: String,
      startDate: Date,
      endDate: Date,
      isActive: Boolean
    }));

    // Clear existing academic years
    await AcademicYear.deleteMany({});
    console.log('Cleared existing academic years');

    // Add new academic years
    await AcademicYear.insertMany(academicYears);
    console.log('Added academic years successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addAcademicYears(); 