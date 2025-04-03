"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Eye, Heart, Share2, MessageCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface PostImage {
  url: string;
  caption: string;
  altText: string;
  _id: {
    $oid: string;
  };
}

interface PostData {
  _id: {
    $oid: string;
  };
  content: string;
  images: PostImage[];
  authorName: string;
  author: {
    $oid: string;
  };
  category: string;
  tags: string[];
  likes: any[];
  shares: number;
  views: number;
  isPrivate: boolean;
  status: string;
  comments: any[];
  createdAt: {
    $date: string;
  };
  updatedAt: {
    $date: string;
  };
  __v: number;
}

interface PostResponse {
  success: boolean;
  user: PostData[];
}

export default function SinglePostPage() {
  const { Id } = useParams();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${Id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }

        const data: PostResponse = await response.json();

        if (!data.success || !data.user || data.user.length === 0) {
          throw new Error("Post not found");
        }

        setPost(data.user[0]);

        // Format date on client side only
        if (data.user[0]?.createdAt?.$date) {
          const date = new Date(data.user[0].createdAt.$date);
          setFormattedDate(formatDate(date));
        }
      } catch (err) {
        setError("Failed to load post");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (Id) {
      fetchPost();
    }
  }, [Id]);

  // Client-side date formatter
  const formatDate = (date: Date): string => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  if (loading) {
    return <PostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Oops!</h2>
          <p className="mt-2 text-gray-600">{error || "Post not found"}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${post.authorName}`}
              />
              <AvatarFallback>
                {post.authorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{post.authorName}</CardTitle>
              <CardDescription>
                {formattedDate} • {post.category}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {post.images && post.images.length > 0 && (
          <div className="relative w-full h-[400px]">
            <img
              src={post.images[0].url}
              alt={post.images[0].altText || "Post image"}
              className="w-full h-full object-cover"
            />
            {post.images[0].caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                {post.images[0].caption}
              </div>
            )}
          </div>
        )}

        <CardContent className="pt-6 pb-4">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <Separator />

        <CardFooter className="py-4">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Heart className="h-5 w-5" />
                <span>{post.likes?.length || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments?.length || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="h-5 w-5" />
                <span>{post.shares || 0}</span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {post.views || 0} views
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </CardHeader>
        <Skeleton className="h-[400px] w-full" />
        <CardContent className="pt-6 pb-4">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardContent>
        <CardFooter className="border-t flex justify-between py-4">
          <div className="flex items-center gap-6">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-4 w-16" />
        </CardFooter>
      </Card>
    </div>
  );
}
