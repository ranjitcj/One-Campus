// src/app/api/verify-student/route.ts

import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/option";

// Import attendance fetching function (create a shared utility)
import { fetchAttendanceData } from "@/lib/attendanceUtils";

export async function POST(request: Request) {
  try {
    // Get session server-side
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    const { rollno } = await request.json();
    const userEmail = session.user.email;

    // Find existing user
    const existingUser = await UserModel.findOne({ email: userEmail });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Updated aggregation to match your actual database structure
    const studentMatch = await UserModel.aggregate([
      {
        $lookup: {
          from: "student",
          localField: "email",
          foreignField: "email",
          as: "result",
        },
      },
      {
        $match: {
          email: userEmail,
        },
      },
    ]);

    if (
      !studentMatch ||
      studentMatch.length === 0 ||
      !studentMatch[0].result ||
      studentMatch[0].result.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "No student record found" },
        { status: 404 }
      );
    }

    // Find the student record that matches both email and roll number
    const foundStudent = studentMatch[0].result.find(
      (student: any) =>
        student.rollno.toString() === rollno.toString() &&
        student.email === userEmail
    );

    if (!foundStudent) {
      return NextResponse.json(
        { success: false, message: "Invalid roll number" },
        { status: 404 }
      );
    }

    // Update the user in the database
    const updatedUser = await UserModel.findByIdAndUpdate(
      existingUser._id,
      {
        role: "Student",
        rollno: rollno,
        college_id: foundStudent.college_id,
      },
      { new: true }
    );

    // Fetch attendance data for the student
    let attendanceData = null;
    try {
      attendanceData = await fetchAttendanceData(rollno);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      // Continue even if attendance fetch fails
    }

    // Return the attendance data along with the success message
    return NextResponse.json(
      {
        success: true,
        message: "Account verified successfully",
        attendanceData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying user" },
      { status: 500 }
    );
  }
}
