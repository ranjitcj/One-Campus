import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/db";
import dbConnect from "@/lib/dbConnect";
import Division from "@/models/Division";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearId = searchParams.get("yearId");

    if (!yearId) {
      return new NextResponse("Year ID is required", { status: 400 });
    }

    await dbConnect();
    const divisions = await Division.find({ year: yearId }).sort({ name: 1 });
    return NextResponse.json(divisions);
  } catch (error) {
    console.error("Error fetching divisions:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, strength, startingRoll, endingRoll, year } = body;

    if (!name || !strength || !startingRoll || !endingRoll || !year) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await dbConnect();

    // Check if division with same name already exists for this year
    const existingDivision = await Division.findOne({ name, year });
    if (existingDivision) {
      return new NextResponse("Division with this name already exists", { status: 400 });
    }

    const division = await Division.create({
      name,
      strength,
      startingRoll,
      endingRoll,
      year,
    });

    return NextResponse.json(division);
  } catch (error) {
    console.error("Error creating division:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 