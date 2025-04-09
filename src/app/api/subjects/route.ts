import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SubjectModel } from "@/model/Subject";
import StudentModel from "@/model/Student";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get("divisionId");

    if (!divisionId) {
      return NextResponse.json(
        { error: "Division ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const subjects = await SubjectModel.find({ division: divisionId });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
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
    const { name, code, credits, division } = body;

    if (!name || !code || !credits || !division) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if subject with same code already exists in the division
    const existingSubject = await SubjectModel.findOne({
      code,
      division,
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "Subject with this code already exists in this division" },
        { status: 400 }
      );
    }

    const subject = await SubjectModel.create({
      name,
      code,
      credits,
      division,
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
} 