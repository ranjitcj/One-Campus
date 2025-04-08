"use client";
import { useEffect, useState } from "react";
import { fetchPosts } from "@/lib/fetch";
import { IPost } from "@/model/Post";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  Smile,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function Page() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const response = await fetchPosts({ postStatus: "published" });
        const publishedPosts = response.posts.filter(post => post.postStatus === "published");
        setPosts(publishedPosts);
      } catch (err) {
        setError("Failed to load posts. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadPosts);
      } else {
        setTimeout(loadPosts, 0);
      }
    }
  }, []);

  function handleAddNew() {
    location.replace("/dashboard/post");
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto">
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[50vh] text-destructive">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
          No published posts available
        </div>
      ) : (
        <div className="w-full space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id?.toString()} post={post} session={session} />
          ))}
        </div>
      )}

      <Button
        onClick={handleAddNew}
        size="icon"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg"
        aria-label="Add new post"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

interface PostCardProps {
  post: IPost;
  session: any;
}

function PostCard({ post, session }: PostCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [commentsCount, setCommentsCount] = useState(post.comments.length);
  const [sharesCount, setSharesCount] = useState(post.shares);
  const [viewsCount, setViewsCount] = useState(post.views);
  const [commentInput, setCommentInput] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const hasMultipleImages = post.images && post.images.length > 1;

  useEffect(() => {
    if (session?.user?._id) {
      const userLiked = post.likes.some(likeId => likeId.toString() === session.user._id.toString());
      setIsLiked(userLiked);
    }
  }, [post.likes, session?.user?._id]);

  const handleInteraction = async (action: string, comment?: string) => {
    if (!session) {
      toast.error("Please login to interact with posts");
      return;
    }

    try {
      const response = await fetch(`/api/post/${post._id}/interact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform action");
      }

      const data = await response.json();
      
      switch (action) {
        case "like":
          setIsLiked(!isLiked);
          setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
          break;
        case "comment":
          setCommentsCount(commentsCount + 1);
          setCommentInput("");
          setShowCommentInput(false);
          break;
        case "share":
          setSharesCount(sharesCount + 1);
          break;
        case "view":
          setViewsCount(viewsCount + 1);
          break;
      }

      toast.success("Action completed successfully");
    } catch (error) {
      console.error("Error performing action:", error);
      toast.error("Failed to perform action");
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.images) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + post.images.length) % post.images.length
      );
    }
  };

  const handleCardClick = () => {
    handleInteraction("view");
    if (post._id) {
      location.href = `/dashboard/singlepost/${post._id}`;
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleInteraction("share");
    if (navigator.share) {
      navigator.share({
        title: "Check out this post!",
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  // Get the latest comment
  const latestComment = post.comments.length > 0 ? post.comments[post.comments.length - 1] : null;

  return (
    <Card className="w-full border-none shadow-none">
      {/* Post Header */}
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {post.authorName.toString().substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold">{post.authorName}</span>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>

      {/* Post Image */}
      <div className="relative aspect-square w-full">
        <img
          src={post.images[currentImageIndex].url}
          alt={post.images[currentImageIndex].altText || "Post image"}
          className="object-cover w-full h-full"
        />
        {hasMultipleImages && (
          <>
            <Button
              onClick={prevImage}
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={nextImage}
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Post Actions */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleInteraction("like")}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCommentInput(!showCommentInput)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={isBookmarked ? "text-primary" : ""}
          >
            <Bookmark className={`h-6 w-6 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Likes Count */}
        <div className="font-semibold mb-2">{likesCount} likes</div>

        {/* Post Content */}
        <div className="mb-2">
          <span className="font-semibold mr-2">{post.authorName}</span>
          {post.content}
        </div>

        {/* Comments Section */}
        {post.comments.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              View all {commentsCount} comments
            </div>
            {latestComment && (
              <div className="text-sm">
                <span className="font-semibold mr-2">
                  {session?.user?._id?.toString() === latestComment.author.toString() 
                    ? session.user.username 
                    : "User"}
                </span>
                {latestComment.content}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mt-2">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </CardContent>

      {/* Comment Input */}
      <CardFooter className="p-4 border-t">
        <div className="flex items-center gap-2 w-full">
          <Smile className="h-6 w-6 text-muted-foreground" />
          <Input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border-none focus-visible:ring-0"
          />
          <Button
            variant="ghost"
            onClick={() => handleInteraction("comment", commentInput)}
            disabled={!commentInput.trim()}
            className="text-primary font-semibold"
          >
            Post
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 