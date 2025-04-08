"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Post from "@/model/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/option";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { action, comment } = await request.json();
    const postId = params.postId;
    const userId = new mongoose.Types.ObjectId(session.user._id);

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { message: "Post not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "like":
        const isLiked = post.likes.some((likeId: mongoose.Types.ObjectId) => likeId.toString() === userId.toString());
        if (isLiked) {
          post.likes = post.likes.filter((likeId: mongoose.Types.ObjectId) => likeId.toString() !== userId.toString());
        } else {
          post.likes.push(userId);
        }
        break;

      case "comment":
        if (!comment) {
          return NextResponse.json(
            { message: "Comment content is required" },
            { status: 400 }
          );
        }
        post.comments.push({
          author: userId,
          content: comment,
          createdAt: new Date()
        });
        break;

      case "share":
        post.shares += 1;
        break;

      case "view":
        post.views += 1;
        break;

      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }

    await post.save();
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Error in post interaction:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
} 