import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AcademicYearModel from "@/model/AcademicYear";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const academicYear = await AcademicYearModel.findById(params.id);

    if (!academicYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(academicYear);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();

    const academicYear = await AcademicYearModel.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    );

    if (!academicYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(academicYear);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const academicYear = await AcademicYearModel.findByIdAndDelete(params.id);

    if (!academicYear) {
      return NextResponse.json(
        { error: "Academic year not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Academic year deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 