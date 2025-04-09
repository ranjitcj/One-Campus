import mongoose from 'mongoose';
import StudentModel from '../model/Student';

async function checkStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/one-campus');
    console.log('Connected to MongoDB');

    const departmentId = '67f529feb76bfa7c8f5e961c';
    console.log('Checking students for department:', departmentId);

    const students = await StudentModel.find({
      department: new mongoose.Types.ObjectId(departmentId)
    });

    console.log('Found students:', students);
    console.log('Total students:', students.length);

    if (students.length === 0) {
      console.log('No students found for this department');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStudents(); 