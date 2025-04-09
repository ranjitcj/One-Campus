import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/db";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import { Student } from "@/models/Student";
import Student from "@/model/Student";
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get("divisionId");

    await dbConnect();

    const query = divisionId ? { division: divisionId } : {};
    const students = await Student.find(query)
      .populate("division")
      .sort({ rollNumber: 1 });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, rollNumber, email, phone, division } = body;

    if (!name || !rollNumber || !email || !division) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if student with same roll number exists in the division
    const existingStudent = await Student.findOne({
      rollNumber,
      division,
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student with this roll number already exists in this division" },
        { status: 400 }
      );
    }

    const student = await Student.create({
      name,
      rollNumber,
      email,
      phone,
      division,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
} 