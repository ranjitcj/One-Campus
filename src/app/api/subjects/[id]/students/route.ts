import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/model/Student";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    console.log("Fetching students for subject ID:", params.id);

    // Validate subject ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid subject ID" },
        { status: 400 }
      );
    }

    // Convert the ID to ObjectId
    const subjectId = new mongoose.Types.ObjectId(params.id);
    console.log("Subject ID as ObjectId:", subjectId.toString());

    // Find all students who have this subject in their subjects array
    // Handle both string and ObjectId types
    const students = await StudentModel.find({
      subjects: { $in: [params.id, subjectId] }
    }).select("_id name rollNumber email phone");

    console.log(`Found ${students.length} students for subject ${params.id}`);
    
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
} 