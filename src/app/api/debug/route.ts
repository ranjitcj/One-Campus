import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/model/Student";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get the subject ID from the query parameters
    const url = new URL(request.url);
    const subjectId = url.searchParams.get("subjectId");
    
    if (!subjectId) {
      return NextResponse.json(
        { error: "Subject ID is required" },
        { status: 400 }
      );
    }
    
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return NextResponse.json(
        { error: "Invalid subject ID format" },
        { status: 400 }
      );
    }
    
    // Get all students with raw data for debugging
    const allStudents = await StudentModel.find({}).lean();
    
    // Find students with this subject ID
    const studentsWithSubject = await StudentModel.find({
      subjects: subjectId
    }).lean();
    
    // Find students with this subject as string
    const studentsWithSubjectAsString = await StudentModel.find({
      subjects: { $in: [subjectId, new mongoose.Types.ObjectId(subjectId)] }
    }).lean();
    
    return NextResponse.json({
      totalStudents: allStudents.length,
      studentsWithSubject: studentsWithSubject.length,
      studentsWithSubjectAsString: studentsWithSubjectAsString.length,
      sampleStudent: allStudents[0] || null,
      studentsWithSubjectDetail: studentsWithSubject,
      debug: {
        subjectId,
        subjectIdAsObjectId: new mongoose.Types.ObjectId(subjectId).toString()
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug API failed" },
      { status: 500 }
    );
  }
} 