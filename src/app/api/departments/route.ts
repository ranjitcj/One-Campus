import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DepartmentModel from "@/model/Department";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const department = await DepartmentModel.create(body);
    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const academicYearId = searchParams.get("academicYearId");

    const departments = await DepartmentModel.find({
      academicYear: academicYearId,
    }).populate("academicYear");

    return NextResponse.json(departments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 