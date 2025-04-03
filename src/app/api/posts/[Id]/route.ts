"use server"

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/model/Post";

export async function GET(
  request: NextRequest, 
  { params }: { params: { Id: string } }
) {
  // Connect to the database
  await dbConnect();
  
  try {
    const userId = params.Id;
    const decodedUserId = decodeURIComponent(userId);
    const user = await Post.find({ _id: decodedUserId });

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