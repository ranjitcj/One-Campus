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

// Define Department Schema for this script
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

// Define Subject Schema for this script
const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subject name is required"],
    trim: true,
  },
  code: {
    type: String,
    required: [true, "Subject code is required"],
    trim: true,
    unique: true,
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

// Main function to add subjects
async function addSubjects() {
  try {
    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      console.log("Failed to connect to database. Exiting...");
      return;
    }

    // Get the departments
    const departments = await Department.find({});
    if (departments.length === 0) {
      console.log("No departments found. Please add departments first.");
      return;
    }

    console.log(`Found ${departments.length} departments.`);
    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (ID: ${dept._id})`);
    });

    // Sample subjects for Computer Science department
    const computerScienceDept = departments.find(d => d.name === "Computer Science");
    if (computerScienceDept) {
      const subjects = [
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
        },
      ];

      // Add subjects for Computer Science department
      console.log("Adding subjects for Computer Science department...");
      
      // Check for existing subjects
      const existingSubjects = await Subject.find({ department: computerScienceDept._id });
      console.log(`Found ${existingSubjects.length} existing subjects for this department.`);
      
      // Log the type of existing subject codes
      console.log("\nExisting subjects and their code types:");
      existingSubjects.forEach((subj, index) => {
        console.log(`${index + 1}. ${subj.name} (Code: ${subj.code}, Type: ${typeof subj.code})`);
      });
      
      // Filter out subjects that already exist
      const existingCodes = new Set(existingSubjects.map(s => s.code));
      const newSubjects = subjects.filter(s => !existingCodes.has(s.code));
      
      if (newSubjects.length === 0) {
        console.log("\nAll subjects already exist. No new subjects to add.");
        return;
      }
      
      // Insert new subjects
      const result = await Subject.insertMany(newSubjects);
      console.log(`\n${result.length} new subjects added successfully!`);
      
      // List added subjects
      console.log("\nAdded subjects:");
      result.forEach((subj, index) => {
        console.log(`${index + 1}. ${subj.name} (Code: ${subj.code}, Type: ${typeof subj.code})`);
      });
    } else {
      console.log("Computer Science department not found.");
    }
  } catch (error) {
    console.error("Error adding subjects:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// Execute the function
addSubjects(); 