import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { SubjectModel } from "@/model/Subject";
import StudentModel from "@/model/Student";
import mongoose from "mongoose";

// GET attendance records for a subject
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Validate subject ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid subject ID" },
        { status: 400 }
      );
    }

    // Find the subject
    const subject = await SubjectModel.findById(params.id);
    if (!subject) {
      return NextResponse.json(
        { error: "Subject not found" },
        { status: 404 }
      );
    }

    // Get all attendance records for this subject
    const attendance = await StudentModel.aggregate([
      { $match: { subjects: new mongoose.Types.ObjectId(params.id) } },
      { $unwind: "$attendance" },
      { $match: { "attendance.subject": params.id } },
      {
        $project: {
          _id: "$attendance._id",
          student: "$_id",
          date: "$attendance.date",
          status: "$attendance.status"
        }
      }
    ]);

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST new attendance record
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Validate subject ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid subject ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { studentId, date, status } = body;

    // Validate required fields
    if (!studentId || !date || !status) {
      return NextResponse.json(
        { error: "Student ID, date, and status are required" },
        { status: 400 }
      );
    }

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { error: "Invalid student ID" },
        { status: 400 }
      );
    }

    // Validate status
    if (!["present", "absent", "late"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid attendance status" },
        { status: 400 }
      );
    }

    // Update or create attendance record
    const student = await StudentModel.findOne({
      _id: studentId,
      subjects: params.id
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found or not enrolled in this subject" },
        { status: 404 }
      );
    }

    const existingAttendanceIndex = student.attendance.findIndex(
      (a: { subject: mongoose.Types.ObjectId; date: Date; status: string }) => 
        a.subject.toString() === params.id && new Date(a.date).toISOString() === new Date(date).toISOString()
    );

    if (existingAttendanceIndex !== -1) {
      // Update existing attendance record
      student.attendance[existingAttendanceIndex].status = status;
    } else {
      // Add new attendance record
      student.attendance.push({
        subject: new mongoose.Types.ObjectId(params.id),
        date: new Date(date),
        status
      });
    }

    await student.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
} 