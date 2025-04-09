import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/model/Student";
import * as XLSX from "xlsx";
import mongoose from "mongoose";

export async function POST(request: Request) {
  console.log("Starting student import process");
  try {
    console.log("Connecting to database");
    await dbConnect();
    console.log("Database connected");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const subjectId = formData.get("subjectId") as string;

    console.log("Received form data", { 
      fileExists: !!file, 
      fileSize: file ? file.size : 0,
      fileType: file ? file.type : 'none',
      subjectId 
    });

    if (!file || !subjectId) {
      return NextResponse.json(
        { error: "File and subject ID are required" },
        { status: 400 }
      );
    }

    // Validate subjectId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      console.log("Invalid subject ID format", subjectId);
      return NextResponse.json(
        { error: "Invalid subject ID format" },
        { status: 400 }
      );
    }

    // Read the Excel file
    console.log("Reading Excel file");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      console.log("Invalid Excel file structure");
      return NextResponse.json(
        { error: "Invalid Excel file structure" },
        { status: 400 }
      );
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log("Excel data parsed", { 
      sheetNames: workbook.SheetNames,
      dataLength: data.length,
      firstRowSample: data.length > 0 ? data[0] : null
    });

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No data found in the Excel file" },
        { status: 400 }
      );
    }

    // Validate required columns
    const requiredColumns = ["RollNo", "Name", "Email"];
    const headers = Object.keys(data[0] || {});
    console.log("Excel headers", headers);
    
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      console.log("Missing required columns", missingColumns);
      return NextResponse.json(
        { error: `Missing required columns: ${missingColumns.join(", ")}` },
        { status: 400 }
      );
    }

    // Process and validate data
    console.log("Processing student data");
    const students = data.map((row: any) => {
      // Validate required fields
      if (!row.RollNo || !row.Name || !row.Email) {
        throw new Error("All fields (RollNo, Name, Email) are required for each student");
      }

      return {
        rollNumber: String(row.RollNo).trim(),
        name: String(row.Name).trim(),
        email: String(row.Email).trim().toLowerCase(),
        department: "", // Default empty department
        semester: 1, // Default semester to 1
        subjects: [new mongoose.Types.ObjectId(subjectId)]
      };
    });

    console.log(`Processed ${students.length} students`);

    // Use updateMany with upsert to handle both inserts and updates
    const bulkOps = students.map(student => ({
      updateOne: {
        filter: { rollNumber: student.rollNumber },
        update: {
          $set: {
            name: student.name,
            email: student.email,
            department: student.department,
            semester: student.semester
          },
          $addToSet: { subjects: new mongoose.Types.ObjectId(subjectId) }
        },
        upsert: true
      }
    }));

    console.log("Executing bulk operations");
    const result = await StudentModel.bulkWrite(bulkOps);
    console.log("Bulk write result", result);

    return NextResponse.json({
      message: "Students imported successfully",
      count: result.upsertedCount + result.modifiedCount,
      result: {
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error: any) {
    console.error("Error importing students:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate roll number or email found in the data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to import students" },
      { status: 500 }
    );
  }
} 