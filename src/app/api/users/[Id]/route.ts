"use server"

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Connect to the database
  await dbConnect();
  
  try {
    // Get the Id from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1];
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "No user ID provided" },
        { status: 400 }
      );
    }

    const decodedUserId = decodeURIComponent(userId);
    const user = await UserModel.findOne({ _id: decodedUserId });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying user" },
      { status: 500 }
    );
  }
}