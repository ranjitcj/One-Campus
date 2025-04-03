"use server"

import {NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/model/Post";

export async function GET() {
  // Connect to the database
  await dbConnect();
  
  try {
    const user = await Post.find({});

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