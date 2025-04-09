import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/db";
import dbConnect from "@/lib/dbConnect";
import Division from "@/models/Division";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const division = await Division.findById(params.id);
    
    if (!division) {
      return new NextResponse("Division not found", { status: 404 });
    }

    return NextResponse.json(division);
  } catch (error) {
    console.error("Error fetching division:", error);
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
    const { name, strength, startingRoll, endingRoll } = body;

    if (!name || !strength || !startingRoll || !endingRoll) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await dbConnect();

    // Check if division with same name already exists for this year
    const existingDivision = await Division.findOne({
      name,
      year: body.year,
      _id: { $ne: params.id }
    });
    
    if (existingDivision) {
      return new NextResponse("Division with this name already exists", { status: 400 });
    }

    const division = await Division.findByIdAndUpdate(
      params.id,
      { name, strength, startingRoll, endingRoll },
      { new: true }
    );

    if (!division) {
      return new NextResponse("Division not found", { status: 404 });
    }

    return NextResponse.json(division);
  } catch (error) {
    console.error("Error updating division:", error);
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
    const division = await Division.findByIdAndDelete(params.id);

    if (!division) {
      return new NextResponse("Division not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting division:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 