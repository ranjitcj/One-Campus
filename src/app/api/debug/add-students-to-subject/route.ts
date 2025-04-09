import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/model/Student";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { subjectId, departmentId } = body;
    
    if (!subjectId || !departmentId) {
      return NextResponse.json(
        { error: "Subject ID and Department ID are required" },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(subjectId) || !mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    // Get all students in this department
    const students = await StudentModel.find({ department: departmentId });
    
    if (students.length === 0) {
      return NextResponse.json(
        { message: "No students found in this department" },
        { status: 200 }
      );
    }
    
    // Add the subject to all students
    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);
    
    const updateResult = await StudentModel.updateMany(
      { department: departmentId },
      { $addToSet: { subjects: subjectObjectId } }
    );
    
    return NextResponse.json({
      message: "Students updated successfully",
      studentsInDepartment: students.length,
      updateResult
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Failed to add students to subject" },
      { status: 500 }
    );
  }
} 