"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/model/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/option";

// Define an interface for the query object to replace 'any'
interface PostQuery {
  postStatus: string;
  category?: string;
  tags?: string;
  author?: string;
  isPrivate?: boolean;
  $or?: Array<{ isPrivate: boolean; author?: string }>;
}

// Define an interface for the filter object to provide type safety
interface PostFilter {
  postStatus: string;
  category?: string;
  author?: string;
  tags?: string;
  $text?: { $search: string };
}

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const { content, images, category, tags } = await req.json();
    
    // Validate required fields
    if (!content || content.trim() === "") {
      return NextResponse.json(
        { message: "Post content is required" },
        { status: 400 }
      );
    }

    // Create post document
    const post = new Post({
      authorName: session.user.username,
      content,
      images: images || [],
      author: session.user._id,
      category: category || "General",
      tags: tags || [],
      postStatus: "pending"
    });

    // Save post to database
    await post.save();

    // Return success response
    return NextResponse.json(
      { 
        message: "Post created successfully", 
        post: {
          _id: post._id,
          content: post.content,
          images: post.images,
          authorName: post.authorName,
          author: post.author,
          category: post.category,
          tags: post.tags,
          postStatus: post.postStatus,
          createdAt: post.createdAt
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Failed to create post", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const author = searchParams.get("author");
    const postStatus = searchParams.get("status") || "published";
    const searchQuery = searchParams.get("searchQuery");

    // Create filter with type safety
    const filter: PostFilter = { postStatus };

    if (category) filter.category = category;
    if (author) filter.author = author;
    if (tag) filter.tags = tag;

    // Text search if searchQuery provided
    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }

    // Get posts with optimized query
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("author", "name avatar")
      .lean();

    return NextResponse.json({
      posts,
      totalPosts: posts.length,
      totalPages: 1,
      currentPage: 1,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching posts" },
      { status: 500 }
    );
  }
}