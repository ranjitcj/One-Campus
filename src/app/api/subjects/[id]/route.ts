import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SubjectModel } from "@/model/Subject";

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

    const subject = await SubjectModel.findById(id).populate("division");
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject" },
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
    const { name, code, credits } = body;

    if (!name || !code || !credits) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const subject = await SubjectModel.findById(id);
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if code is being changed and if it already exists in the division
    if (code !== subject.code) {
      const existingSubject = await SubjectModel.findOne({
        code,
        division: subject.division,
      });

      if (existingSubject) {
        return NextResponse.json(
          { error: "Subject with this code already exists in this division" },
          { status: 400 }
        );
      }
    }

    subject.name = name;
    subject.code = code;
    subject.credits = credits;

    await subject.save();

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
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

    const subject = await SubjectModel.findByIdAndDelete(id);
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
} 