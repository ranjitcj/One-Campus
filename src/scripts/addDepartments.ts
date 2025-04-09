import mongoose from "mongoose";
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Set up environment variables from .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// Import using dynamic imports to work with ES modules
async function main() {
  try {
    // Dynamically import modules
    const { default: dbConnect } = await import("../lib/dbConnect.js");
    const { default: DepartmentModel } = await import("../model/Department.js");
    const { default: AcademicYearModel } = await import("../model/AcademicYear.js");

    await dbConnect();

    // Get the academic years
    const academicYears = await AcademicYearModel.find({});
    if (academicYears.length === 0) {
      console.log("No academic years found. Please add academic years first.");
      return;
    }

    console.log(`Found ${academicYears.length} academic years.`);
    academicYears.forEach((year, index) => {
      console.log(`${index + 1}. ${year.name} (ID: ${year._id})`);
    });

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
    const existingDepartments = await DepartmentModel.find({});
    if (existingDepartments.length > 0) {
      console.log(`Found ${existingDepartments.length} existing departments.`);
      console.log("Removing existing departments...");
      await DepartmentModel.deleteMany({});
    }
    
    const result = await DepartmentModel.insertMany(departments);
    console.log(`${result.length} departments added successfully!`);
    
    // List added departments
    console.log("Added departments:");
    result.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (Code: ${dept.code})`);
    });
  } catch (error) {
    console.error("Error adding departments:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

main(); 