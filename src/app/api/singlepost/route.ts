"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/model/Post";

export async function GET(request: NextRequest) {
  // Connect to the database
  await dbConnect();

  try {
    // Get the Id from the URL
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "No user ID provided" },
        { status: 400 }
      );
    }

    const decodedUserId = decodeURIComponent(userId);
    const user = await Post.find({ _id: decodedUserId });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      { success: false, message: "Error verifying user" },
      { status: 500 }
    );
  }
}
