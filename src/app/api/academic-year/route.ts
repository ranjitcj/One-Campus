import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import AcademicYearModel from "@/model/AcademicYear";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, startDate, endDate } = await req.json();

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check for overlapping academic years
    const overlappingYear = await AcademicYearModel.findOne({
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
    });

    if (overlappingYear) {
      return NextResponse.json(
        { error: "Academic year dates overlap with an existing year" },
        { status: 400 }
      );
    }

    const academicYear = await AcademicYearModel.create({
      name,
      startDate: start,
      endDate: end,
    });

    return NextResponse.json(academicYear, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const academicYears = await AcademicYearModel.find().sort({ startDate: -1 });
    return NextResponse.json(academicYears);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 