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

// Define Subject Schema for this script
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

// Create model
const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);

// Function to convert string code to number
function convertCodeToNumber(code) {
  // Remove any non-numeric characters
  const numericCode = code.replace(/\D/g, '');
  return parseInt(numericCode, 10);
}

// Main function to update subject codes
async function updateSubjectCodes() {
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

    // Log all subjects and their current codes
    console.log("\nCurrent subjects and their codes:");
    subjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name} (Code: ${subject.code}, Type: ${typeof subject.code})`);
    });

    // Update each subject's code
    for (const subject of subjects) {
      if (typeof subject.code === 'string') {
        const newCode = convertCodeToNumber(subject.code);
        console.log(`\nUpdating ${subject.name}: ${subject.code} -> ${newCode}`);
        
        try {
          await Subject.updateOne(
            { _id: subject._id },
            { $set: { code: newCode } }
          );
          console.log(`Successfully updated ${subject.name}`);
        } catch (error) {
          console.error(`Error updating ${subject.name}:`, error.message);
        }
      } else {
        console.log(`\nSkipping ${subject.name} - already has numeric code: ${subject.code}`);
      }
    }

    console.log("\nUpdate process completed.");
  } catch (error) {
    console.error("Error updating subject codes:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// Execute the function
updateSubjectCodes(); 