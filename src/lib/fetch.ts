import axios from 'axios';
import { IPost } from '@/model/Post'; // Adjust path as needed

// Base API URL - replace with your actual API URL
const API_URL = '/api';

// Type for post filtering options
export interface PostFilters {
  category?: string;
  tag?: string;
  author?: string;
  status?: 'draft' | 'published' | 'archived';
  limit?: number;
  page?: number;
  searchQuery?: string;
}

// Type for API response
export interface PostsResponse {
  posts: IPost[];
  totalPosts: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Fetch posts with optional filtering
 */
export const fetchPosts = async (filters: PostFilters = {}): Promise<PostsResponse> => {
  try {
    const response = await axios.get(`${API_URL}/post`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

/**
 * Fetch a single post by ID
 */
export const fetchPostById = async (postId: string): Promise<IPost> => {
  try {
    const response = await axios.get(`${API_URL}/post/${postId}`);
    return response.data.post;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }
};

/**
 * Like a post
 */
export const likePost = async (postId: string): Promise<IPost> => {
  try {
    const response = await axios.post(`${API_URL}/post/${postId}/like`, {}, {
      headers: {
        // Add authentication token if required
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    // Return the updated post
    return response.data.post;
  } catch (error) {
    // Detailed error handling
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Like post error response:', error.response.data);
        
        // Handle specific error scenarios
        switch (error.response.status) {
          case 401:
            throw new Error('You must be logged in to like a post');
          case 403:
            throw new Error('You are not authorized to like this post');
          case 404:
            throw new Error('Post not found');
          default:
            throw new Error('Failed to like post');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up like request:', error.message);
        throw new Error('An unexpected error occurred');
      }
    } else {
      // Handle non-axios errors
      console.error('Unexpected error liking post:', error);
      throw error;
    }
  }
};

// Optional: Helper function to check if user has already liked the post
// export const isPostLikedByUser = (post: IPost, userId: string): boolean => {
//   return post.likes.some(like => like.userId === userId);
// };

/**
 * Add a comment to a post
 */
export const addComment = async (postId: string, content: string): Promise<IPost> => {
  try {
    const response = await axios.post(`${API_URL}/post/${postId}/comments`, { content });
    return response.data.post;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

/**
 * Increment post views
 */
export const incrementViews = async (postId: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/post/${postId}/view`);
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};