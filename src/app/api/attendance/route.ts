// src/app/api/attendance/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/option";
import { fetchAttendanceData } from "@/lib/attendanceUtils";

export async function GET(request: NextRequest) {
  try {
    // First check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get roll number from query params or from session
    const searchParams = request.nextUrl.searchParams;
    const rollNoFromQuery = searchParams.get("roll");
    const rollNo = rollNoFromQuery || session.user.rollno;

    // Validate roll number
    if (!rollNo) {
      return NextResponse.json(
        { error: "Roll number is required" },
        { status: 400 }
      );
    }

    // Validate roll number format and range
    const parsedRollno = Number(rollNo);
    if (isNaN(parsedRollno) || parsedRollno < 1 || parsedRollno > 223) {
      return NextResponse.json(
        { error: "Invalid roll number" },
        { status: 400 }
      );
    }

    // Check if attendance data is already in session
    if (session.user.attendanceData && !rollNoFromQuery) {
      // If we have cached data and no explicit roll number requested, return cached data
      return NextResponse.json(session.user.attendanceData);
    }

    const attendanceData = await fetchAttendanceData(rollNo);
    return NextResponse.json(attendanceData);
  } catch (error) {
    console.error("Attendance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve attendance data" },
      { status: 500 }
    );
  }
}
