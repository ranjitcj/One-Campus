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

// Main function to reset subjects
async function resetSubjects() {
  try {
    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      console.log("Failed to connect to database. Exiting...");
      return;
    }

    // Delete all existing subjects
    console.log("\nDeleting all existing subjects...");
    await Subject.deleteMany({});
    console.log("All subjects deleted successfully.");

    // Get Computer Science department
    const computerScienceDept = await Department.findOne({ name: "Computer Science" });
    if (!computerScienceDept) {
      console.log("\nComputer Science department not found.");
      return;
    }

    // Define all subjects with proper numeric codes
    const allSubjects = [
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
      },
      {
        name: "Computer Networks",
        code: 104,
        description: "Introduction to computer networks and protocols",
        credits: 4,
        semester: 5,
        department: computerScienceDept._id,
      },
      {
        name: "Software Engineering",
        code: 105,
        description: "Software development lifecycle and methodologies",
        credits: 4,
        semester: 5,
        department: computerScienceDept._id,
      },
      {
        name: "Web Development",
        code: 106,
        description: "Modern web development technologies and practices",
        credits: 4,
        semester: 6,
        department: computerScienceDept._id,
      }
    ];

    // Add all subjects
    console.log("\nAdding subjects with numeric codes...");
    const result = await Subject.insertMany(allSubjects);
    console.log(`Added ${result.length} subjects successfully.`);

    // List all subjects
    console.log("\nFinal list of subjects:");
    const finalSubjects = await Subject.find({}).sort({ code: 1 });
    finalSubjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name} (Code: ${subject.code}, Type: ${typeof subject.code})`);
    });

  } catch (error) {
    console.error("Error resetting subjects:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
  }
}

// Execute the function
resetSubjects(); 