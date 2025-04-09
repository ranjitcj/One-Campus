import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/model/Student";
import * as XLSX from "xlsx";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    console.log("Starting student import process...");
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const departmentId = formData.get("departmentId") as string;

    console.log("Received departmentId:", departmentId);

    if (!file || !departmentId) {
      console.error("Missing file or departmentId");
      return NextResponse.json(
        { error: "File and department ID are required" },
        { status: 400 }
      );
    }

    // Validate departmentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      console.error("Invalid department ID format:", departmentId);
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    console.log("Reading Excel file...");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log("Excel data rows:", data.length);

    if (data.length === 0) {
      console.error("Empty Excel file");
      return NextResponse.json(
        { error: "The Excel file is empty or contains no valid data" },
        { status: 400 }
      );
    }

    // Validate required columns
    const requiredColumns = ["RollNo", "Name", "Email"];
    const firstRow = data[0] as any;
    const missingColumns = requiredColumns.filter(
      (col) => !Object.keys(firstRow).includes(col)
    );

    if (missingColumns.length > 0) {
      console.error("Missing required columns:", missingColumns);
      return NextResponse.json(
        { error: `Missing required columns: ${missingColumns.join(", ")}` },
        { status: 400 }
      );
    }

    console.log("Processing student data...");
    // Process and validate student data
    const students = data.map((row: any) => {
      const rollNumber = String(row.RollNo).trim();
      const name = String(row.Name).trim();
      const email = String(row.Email).trim().toLowerCase();

      if (!rollNumber || !name || !email) {
        throw new Error("RollNo, Name, and Email are required fields");
      }

      return {
        rollNumber,
        name,
        email,
        department: new mongoose.Types.ObjectId(departmentId),
        semester: 1, // Default semester
        subjects: [], // Empty subjects array
      };
    });

    console.log("Attempting to insert", students.length, "students...");
    
    // Insert students into database
    const result = await StudentModel.insertMany(students, { ordered: false });
    console.log("Successfully inserted", result.length, "students");

    return NextResponse.json({
      message: "Students imported successfully",
      count: result.length,
    });
  } catch (error: any) {
    console.error("Error in import process:", error);
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          error: "Some students could not be imported due to duplicate roll numbers or emails",
          details: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to import students" },
      { status: 500 }
    );
  }
} 