import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import StudentModel from "@/model/Student";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    await dbConnect();

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(params.id) || !mongoose.Types.ObjectId.isValid(params.studentId)) {
      return NextResponse.json(
        { error: "Invalid subject or student ID" },
        { status: 400 }
      );
    }

    // Remove the subject from the student's subjects array
    const result = await StudentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(params.studentId) },
      { $pull: { subjects: new mongoose.Types.ObjectId(params.id) } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Student not found or already removed from subject" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Student removed from subject successfully" });
  } catch (error: any) {
    console.error("Error removing student from subject:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove student from subject" },
      { status: 500 }
    );
  }
} 