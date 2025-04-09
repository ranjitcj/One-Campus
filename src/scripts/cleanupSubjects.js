import mongoose from "mongoose";
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Set up environment variables from .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/one-campus";

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
}

// Define Department Schema
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Department name is required"],
  },
  code: {
    type: String,
    required: [true, "Department code is required"],
    unique: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

// Define Subject Schema
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subject name is required"],
    trim: true,
  },
  code: {
    type: Number,
    required: [true, "Subject code is required"],
    unique: true,
    min: [1, "Subject code must be at least 1"],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: [true, "Department is required"],
  },
  description: {
    type: String,
    trim: true,
  },
  credits: {
    type: Number,
    required: [true, "Credits are required"],
    min: [1, "Credits must be at least 1"],
  },
  semester: {
    type: Number,
    required: [true, "Semester is required"],
    min: [1, "Semester must be at least 1"],
  },
}, { timestamps: true });

// Create models
const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);
const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

// Main function to clean up subjects
async function cleanupSubjects() {
  try {
    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      console.log("Failed to connect to database. Exiting...");
      return;
    }

    // Get all subjects
    const subjects = await Subject.find({});
    console.log(`Found ${subjects.length} subjects.`);

    // Log all subjects before cleanup
    console.log("\nCurrent subjects before cleanup:");
    subjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name} (Code: ${subject.code}, Type: ${typeof subject.code})`);
    });

    // Delete subjects with undefined codes
    const deleteResult = await Subject.deleteMany({
      $or: [
        { code: { $exists: false } },
        { code: null },
        { code: undefined }
      ]
    });
    console.log(`\nDeleted ${deleteResult.deletedCount} subjects with undefined codes.`);

    // Get remaining subjects
    const remainingSubjects = await Subject.find({}).sort({ code: 1 });
    console.log("\nRemaining subjects after cleanup:");
    remainingSubjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name} (Code: ${subject.code})`);
    });

    // Add back the core subjects with proper numeric codes
    const computerScienceDept = await Department.findOne({ name: "Computer Science" });
    if (computerScienceDept) {
      const coreSubjects = [
        {
          name: "Data Structures and Algorithms",
          code: 101,
          description: "Introduction to data structures and algorithms",
          credits: 4,
          semester: 2,
          department: computerScienceDept._id,
        },
        {
          name: "Database Management Systems",
          code: 102,
          description: "Fundamentals of database systems",
          credits: 4,
          semester: 3,
          department: computerScienceDept._id,
        },
        {
          name: "Operating Systems",
          code: 103,
          description: "Principles of operating systems",
          credits: 4,
          semester: 4,
          department: computerScienceDept._id,
        }
      ];

      // Add core subjects
      try {
        const result = await Subject.insertMany(coreSubjects);
        console.log(`\nAdded ${result.length} core subjects with proper numeric codes.`);
        
        // List all subjects after adding core subjects
        const finalSubjects = await Subject.find({}).sort({ code: 1 });
        console.log("\nFinal list of subjects:");
        finalSubjects.forEach((subject, index) => {
          console.log(`${index + 1}. ${subject.name} (Code: ${subject.code})`);
        });
      } catch (error) {
        console.error("Error adding core subjects:", error.message);
      }
    } else {
      console.log("\nComputer Science department not found.");
    }

  } catch (error) {
    console.error("Error cleaning up subjects:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
}

// Execute the function
cleanupSubjects(); 