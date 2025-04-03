"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ImageUpload = {
  file: File;
  preview: string;
  caption: string;
  altText: string;
};

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState<"draft" | "published" | "archived">("published");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle redirect after successful post creation
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    
    if (showConfirmation) {
      redirectTimer = setTimeout(() => {
        router.push('/post');
      }, 3000); // Redirect after 3 seconds
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [showConfirmation, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files);
    const newUploads: ImageUpload[] = [];
    
    newFiles.forEach(file => {
      // Only process image files
      if (!file.type.startsWith("image/")) return;
      
      newUploads.push({
        file,
        preview: URL.createObjectURL(file),
        caption: "",
        altText: ""
      });
    });
    
    setImages([...images, ...newUploads]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    // Release object URL to prevent memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const updateImageData = (index: number, field: "caption" | "altText", value: string) => {
    const newImages = [...images];
    newImages[index][field] = value;
    setImages(newImages);
  };

  const addTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Post content is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      // Upload images first
      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          const formData = new FormData();
          formData.append("file", img.file);
          
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error("Failed to upload image");
          }
          
          const uploadData = await uploadResponse.json();
          return {
            url: uploadData.url,
            caption: img.caption,
            altText: img.altText
          };
        })
      );
      
      // Create post with uploaded image URLs
      const postData = {
        content,
        images: uploadedImages,
        category,
        tags,
        isPrivate,
        status
      };
      
      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }
      

      
      // Show success confirmation
      setSuccessMessage(`Post created successfully! ${status === "published" ? "Your post is now live." : `It has been saved as ${status}.`}`);
      setShowConfirmation(true);
      
      // Redirect will happen via the useEffect above
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If showing confirmation, render a different view
  if (showConfirmation) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="mb-4 text-green-600">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Success!</h2>
          <p className="text-lg text-green-600 mb-4">{successMessage}</p>
          <p className="text-sm text-gray-500">Redirecting you to posts in a few seconds...</p>
          <button 
            onClick={() => router.push('/')} 
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Go to Posts Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows={5}
            className="w-full border border-gray-300 rounded-md shadow-sm p-3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            required
          />
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Add Images
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              multiple
            />
            <p className="text-sm text-gray-500">
              You can upload multiple images
            </p>
          </div>
          
          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((img, index) => (
                <div key={index} className="border rounded-md p-3 space-y-2">
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={img.preview}
                      alt={img.altText || "Preview"}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Caption"
                      className="w-full border rounded p-2 text-sm"
                      value={img.caption}
                      onChange={(e) => updateImageData(index, "caption", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Alt text for accessibility"
                      className="w-full border rounded p-2 text-sm"
                      value={img.altText}
                      onChange={(e) => updateImageData(index, "altText", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="General">General</option>
            <option value="Technology">Technology</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Health">Health</option>
            <option value="Education">Education</option>
            <option value="Business">Business</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex">
            <input
              type="text"
              id="tags"
              className="flex-grow border border-gray-300 rounded-md shadow-sm p-2"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyPress}
              placeholder="Add tags and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="ml-2 px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-800 hover:text-blue-900"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Privacy and Status */}
        <div className="flex flex-wrap gap-8">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
              Private Post
            </label>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex space-x-4">
              {(["draft", "published", "archived"] as const).map((option) => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4"
                    checked={status === option}
                    onChange={() => setStatus(option)}
                  />
                  <span className="ml-2 text-sm capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Creating Post..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}