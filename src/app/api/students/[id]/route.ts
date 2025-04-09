import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/db";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StudentModel from "@/model/Student";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const student = await StudentModel.findById(id).populate("division");
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, rollNumber, email, phone } = body;

    if (!name || !rollNumber || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const student = await StudentModel.findById(id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if roll number is being changed and if it already exists in the division
    if (rollNumber !== student.rollNumber) {
      const existingStudent = await StudentModel.findOne({
        rollNumber,
        division: student.division,
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: "Student with this roll number already exists in this division" },
          { status: 400 }
        );
      }
    }

    student.name = name;
    student.rollNumber = rollNumber;
    student.email = email;
    student.phone = phone;

    await student.save();

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const student = await StudentModel.findByIdAndDelete(id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
} 