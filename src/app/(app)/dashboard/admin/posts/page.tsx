"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Post {
  _id: string;
  content: string;
  images: {
    url: string;
    caption?: string;
    altText?: string;
  }[];
  authorName: string;
  author: {
    $oid: string;
  };
  category: string;
  tags: string[];
  likes: any[];
  shares: number;
  views: number;
  postStatus: "pending" | "disapproved" | "published";
  comments: any[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"pending" | "disapproved" | "published">("pending");

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");
      const response = await fetch(`/api/admin/posts?status=${statusFilter}`);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to fetch posts");
      }
      
      const data = await response.json();
      console.log("Fetched posts:", data.posts);
      
      if (!data.posts) {
        throw new Error("No posts data received");
      }
      
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (postId: string, newStatus: "published" | "disapproved") => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update post status");

      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, postStatus: newStatus }
          : post
      ));

      toast.success(`Post ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating post status:", error);
      toast.error("Failed to update post status");
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Posts Management</h1>
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value: "pending" | "disapproved" | "published") => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="disapproved">Disapproved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post._id} className="mb-4">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-semibold">Post by {post.authorName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Status: {post.postStatus}
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={post.postStatus === "published"}
                      onCheckedChange={(checked: boolean) => 
                        handleStatusChange(
                          post._id, 
                          checked ? "published" : "disapproved"
                        )
                      }
                    />
                    <span className="text-sm">
                      {post.postStatus === "published" ? "Published" : "Disapproved"}
                    </span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Post Content */}
                <div>
                  <h3 className="font-medium mb-2">Content:</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Images:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {post.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.url}
                            alt={image.altText || `Post image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {image.caption && (
                            <p className="text-sm text-gray-500 mt-1">{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Category:</span> {post.category}
                  </div>
                  <div>
                    <span className="font-medium">Tags:</span> {post.tags.join(", ")}
                  </div>
                  <div>
                    <span className="font-medium">Likes:</span> {post.likes.length}
                  </div>
                  <div>
                    <span className="font-medium">Shares:</span> {post.shares}
                  </div>
                  <div>
                    <span className="font-medium">Views:</span> {post.views}
                  </div>
                  <div>
                    <span className="font-medium">Comments:</span> {post.comments.length}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex gap-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(post.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>{" "}
                    {new Date(post.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {posts.length === 0 && (
          <div className="text-center text-gray-500">
            No posts to review
          </div>
        )}
      </div>
    </div>
  );
} 