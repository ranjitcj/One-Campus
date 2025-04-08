import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/model/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const postStatus = searchParams.get("status") || "pending";

    // Find posts with the selected status
    const posts = await Post.find({ postStatus })
      .sort({ createdAt: -1 })
      .select("content images authorName category tags likes shares views postStatus comments createdAt updatedAt")
      .lean();
    
    // Transform posts to make images viewable
    const transformedPosts = posts.map(post => ({
      ...post,
      images: post.images.map((image: { url: string; publicId: string; type?: string }) => ({
        url: image.url,
        publicId: image.publicId,
        type: image.type || 'image'
      }))
    }));

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch posts" },
      { status: 500 }
    );
  }
} 