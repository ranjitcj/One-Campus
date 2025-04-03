// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/option";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get form data with the file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a folder path based on user ID and date
    const userId = session.user._id;
    const date = new Date().toISOString().split("T")[0];
    const folder = `posts/${userId}/${date}`;

    // Upload to Cloudinary
    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          // Optional transformations
          transformation: [
            { width: 1200, crop: "limit" }, // Resize to max width 1200px
            { quality: "auto:good" }, // Optimize quality
          ],
        },
        (error, result) => {
          if (error || !result) {
            console.error("Cloudinary upload error:", error);
            resolve(
              NextResponse.json(
                { message: "Failed to upload image" },
                { status: 500 }
              )
            );
          } else {
            resolve(
              NextResponse.json({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
              })
            );
          }
        }
      );

      uploadStream.write(buffer);
      uploadStream.end();
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: "Failed to upload image", error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Set larger payload size limit for image uploads
export const config = {
  api: {
    bodyParser: false,
    responseLimit: "8mb",
  },
};
