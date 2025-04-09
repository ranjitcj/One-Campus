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

// Define Academic Year Schema for this script
const academicYearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Academic year name is required"],
    unique: true,
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

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

// Create models
const AcademicYear = mongoose.models.AcademicYear || mongoose.model('AcademicYear', academicYearSchema);
const Department = mongoose.models.Department || mongoose.model('Department', departmentSchema);

// Main function to add departments
async function addDepartments() {
  try {
    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      console.log("Failed to connect to database. Exiting...");
      return;
    }

    // Get the academic years
    const academicYears = await AcademicYear.find({});
    if (academicYears.length === 0) {
      console.log("No academic years found. Please add academic years first.");
      return;
    }

    console.log(`Found ${academicYears.length} academic years.`);
    academicYears.forEach((year, index) => {
      console.log(`${index + 1}. ${year.name} (ID: ${year._id})`);
    });

    // Departments for the first academic year
    const departments = [
      {
        name: "Computer Science",
        code: "CS-2023",
        description: "Department of Computer Science and Engineering",
        academicYear: academicYears[0]._id,
      },
      {
        name: "Mechanical Engineering",
        code: "ME-2023",
        description: "Department of Mechanical Engineering",
        academicYear: academicYears[0]._id,
      },
      {
        name: "Electrical Engineering",
        code: "EE-2023",
        description: "Department of Electrical Engineering",
        academicYear: academicYears[0]._id,
      },
      {
        name: "Civil Engineering",
        code: "CE-2023",
        description: "Department of Civil Engineering",
        academicYear: academicYears[0]._id,
      },
    ];

    // Add departments for the first academic year
    console.log("Adding departments...");
    
    // Check if departments already exist
    const existingDepartments = await Department.find({ academicYear: academicYears[0]._id });
    if (existingDepartments.length > 0) {
      console.log(`Found ${existingDepartments.length} existing departments for this academic year.`);
      console.log("These departments already exist:");
      existingDepartments.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.name} (Code: ${dept.code})`);
      });
      
      // Ask for confirmation to continue and overwrite (for simplicity, always proceeding)
      console.log("Proceeding to add departments...");
    }
    
    // Insert departments
    const result = await Department.insertMany(departments);
    console.log(`${result.length} departments added successfully!`);
    
    // List added departments
    console.log("Added departments:");
    result.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (Code: ${dept.code})`);
    });
  } catch (error) {
    console.error("Error adding departments:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// Execute the function
addDepartments(); 