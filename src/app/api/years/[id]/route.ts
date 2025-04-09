import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Year from "@/models/Year";
import dbConnect from "@/lib/dbConnect";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const year = await Year.findById(params.id).populate({
      path: "department",
      select: "name academicYear",
      populate: {
        path: "academicYear",
        select: "name"
      }
    });
    
    if (!year) {
      return new NextResponse("Year not found", { status: 404 });
    }

    return NextResponse.json(year);
  } catch (error) {
    console.error("Error fetching year:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    await dbConnect();

    // Check if year with same name already exists for this department
    const existingYear = await Year.findOne({
      name,
      department: body.department,
      _id: { $ne: params.id }
    });
    
    if (existingYear) {
      return new NextResponse("Year with this name already exists", { status: 400 });
    }

    const year = await Year.findByIdAndUpdate(
      params.id,
      { name },
      { new: true }
    );

    if (!year) {
      return new NextResponse("Year not found", { status: 404 });
    }

    return NextResponse.json(year);
  } catch (error) {
    console.error("Error updating year:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const year = await Year.findByIdAndDelete(params.id);

    if (!year) {
      return new NextResponse("Year not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting year:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 