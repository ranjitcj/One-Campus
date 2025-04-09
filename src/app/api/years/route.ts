import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import Year from "@/models/Year";
import dbConnect from "@/lib/dbConnect";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    await dbConnect();

    const years = await Year.find({ department: departmentId }).sort({ name: 1 });
    return NextResponse.json(years);
  } catch (error) {
    console.error("Error fetching years:", error);
    return NextResponse.json(
      { error: "Failed to fetch years" },
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
    const { name, department } = body;

    if (!name || !department) {
      return NextResponse.json(
        { error: "Name and department are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if year already exists for this department
    const existingYear = await Year.findOne({
      name,
      department,
    });

    if (existingYear) {
      return NextResponse.json(
        { error: "Year already exists for this department" },
        { status: 400 }
      );
    }

    const year = await Year.create({
      name,
      department,
    });

    return NextResponse.json(year, { status: 201 });
  } catch (error) {
    console.error("Error creating year:", error);
    return NextResponse.json(
      { error: "Failed to create year" },
      { status: 500 }
    );
  }
} 