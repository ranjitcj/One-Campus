import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/model/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/option";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await dbConnect();

    // Check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: "No session found" },
        { status: 401 }
      );
    }

    if (!session.user) {
      return NextResponse.json(
        { message: "No user in session" },
        { status: 401 }
      );
    }

    if (session.user.role.toLowerCase() !== "admin") {
      return NextResponse.json(
        { message: "User is not admin" },
        { status: 401 }
      );
    }

    const { status } = await req.json();
    const { postId } = params;

    // Validate status
    if (!["published", "disapproved"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { postStatus: status },
      { new: true }
    );

    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update post status" },
      { status: 500 }
    );
  }
} 