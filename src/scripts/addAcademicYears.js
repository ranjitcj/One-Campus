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

// Create model
const AcademicYear = mongoose.models.AcademicYear || mongoose.model('AcademicYear', academicYearSchema);

// Main function to add academic years
async function addAcademicYears() {
  try {
    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      console.log("Failed to connect to database. Exiting...");
      return;
    }

    // Sample academic years
    const academicYears = [
      {
        name: "2023-2024",
        startDate: new Date("2023-07-01"),
        endDate: new Date("2024-06-30"),
        isActive: true,
      },
      {
        name: "2024-2025",
        startDate: new Date("2024-07-01"),
        endDate: new Date("2025-06-30"),
        isActive: false,
      },
    ];

    // Check if academic years already exist
    const existingYears = await AcademicYear.find({});
    console.log(`Found ${existingYears.length} existing academic years.`);
    
    if (existingYears.length > 0) {
      console.log("These academic years already exist:");
      existingYears.forEach((year, index) => {
        console.log(`${index + 1}. ${year.name} (ID: ${year._id})`);
      });
      
      // Delete existing years for clean state
      console.log("Removing existing academic years for clean state...");
      await AcademicYear.deleteMany({});
    }
    
    console.log("Adding academic years...");
    const result = await AcademicYear.insertMany(academicYears);
    console.log(`${result.length} academic years added successfully!`);
    
    // List added academic years
    console.log("Added academic years:");
    result.forEach((year, index) => {
      console.log(`${index + 1}. ${year.name} (${year.isActive ? 'Active' : 'Inactive'}) - ID: ${year._id}`);
    });
  } catch (error) {
    console.error("Error adding academic years:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// Execute the function
addAcademicYears(); 