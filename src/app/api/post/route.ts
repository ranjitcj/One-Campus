// // src/app/api/post/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Post from "@/model/Post";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]/option";

// export async function POST(req: NextRequest) {
//   try {
//     // Connect to database
//     await dbConnect();

//     // Authenticate user
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user) {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // Parse request body
//     const { content, images, category, tags, isPrivate, status } = await req.json();
    
//     // Validate required fields
//     if (!content || content.trim() === "") {
//       return NextResponse.json(
//         { message: "Post content is required" },
//         { status: 400 }
//       );
//     }

//     // Create post document
//     const post = new Post({
//       authorName: session.user.username, // Assuming user ID is stored in session
//       content,
//       images: images || [],
//       author: session.user._id, // Assuming user ID is stored in session
//       category: category || "General",
//       tags: tags || [],
//       isPrivate: !!isPrivate,
//       status: status || "published",
//     });

//     // Save post to database
//     await post.save();

//     // Return success response
//     return NextResponse.json(
//       { 
//         message: "Post created successfully", 
//         post: {
//           _id: post._id,
//           content: post.content,
//           images: post.images,
//           authorName: post.authorName,
//           author: post.author,
//           category: post.category,
//           tags: post.tags,
//           isPrivate: post.isPrivate,
//           status: post.status,
//           createdAt: post.createdAt
//         }
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating post:", error);
//     return NextResponse.json(
//       { message: "Failed to create post", error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     // Connect to database
//     await dbConnect();
    
//     const { searchParams } = new URL(req.url);
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const page = parseInt(searchParams.get("page") || "1");
//     const category = searchParams.get("category");
//     const tag = searchParams.get("tag");
//     const status = searchParams.get("status");
//     const authorId = searchParams.get("author");
    
//     // Base query
//     const query: any = { status: "published" };
    
//     // Add filters if provided
//     if (category) query.category = category;
//     if (tag) query.tags = tag;
//     if (status) query.status = status;
//     if (authorId) query.author = authorId;
    
//     // Get authenticated user for private posts
//     const session = await getServerSession(authOptions);
    
//     // If not logged in, only show public posts
//     if (!session || !session.user) {
//       query.isPrivate = false;
//     } else {
//       // If logged in, show public posts and their own private posts
//       query.$or = [
//         { isPrivate: false },
//         { isPrivate: true, author: session.user._id }
//       ];
//     }
    
//     // Calculate pagination
//     const skip = (page - 1) * limit;
    
//     // Get posts with pagination
//     const posts = await Post.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate("author", "name username profileImage")
//       .lean();
    
//     // Get total count for pagination
//     const total = await Post.countDocuments(query);
    
//     return NextResponse.json({
//       posts,
//       pagination: {
//         total,
//         page,
//         limit,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching posts:", error);
//     return NextResponse.json(
//       { message: "Failed to fetch posts", error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/model/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/option";

// Define an interface for the query object to replace 'any'
interface PostQuery {
  status: string;
  category?: string;
  tags?: string;
  author?: string;
  isPrivate?: boolean;
  $or?: Array<{ isPrivate: boolean; author?: string }>;
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
    const { content, images, category, tags, isPrivate, status } = await req.json();
    
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
      isPrivate: !!isPrivate,
      status: status || "published",
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
          isPrivate: post.isPrivate,
          status: post.status,
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

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const status = searchParams.get("status");
    const authorId = searchParams.get("author");
    
    // Base query with type safety
    const query: PostQuery = { status: "published" };
    
    // Add filters if provided
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (status) query.status = status;
    if (authorId) query.author = authorId;
    
    // Get authenticated user for private posts
    const session = await getServerSession(authOptions);
    
    // If not logged in, only show public posts
    if (!session || !session.user) {
      query.isPrivate = false;
    } else {
      // If logged in, show public posts and their own private posts
      query.$or = [
        { isPrivate: false },
        { isPrivate: true, author: session.user._id }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get posts with pagination
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name username profileImage")
      .lean();
    
    // Get total count for pagination
    const total = await Post.countDocuments(query);
    
    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { message: "Failed to fetch posts", error: (error as Error).message },
      { status: 500 }
    );
  }
}