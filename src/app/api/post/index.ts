// // file: /pages/api/posts/index.ts (for Next.js API routes)
// import type { NextApiRequest, NextApiResponse } from 'next';
// import dbConnect from '@/lib/dbConnect'; // You'll need to create this
// import Post from '@/model/Post';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { method } = req;

//   await dbConnect();

//   switch (method) {
//     case 'GET':
//       try {
//         const { 
//           page = 1, 
//           limit = 10, 
//           category, 
//           tag, 
//           author, 
//           status = 'published',
//           searchQuery 
//         } = req.query;

//         const skip = (Number(page) - 1) * Number(limit);
        
//         // Build filter object
//         const filter: any = { status };
        
//         if (category) filter.category = category;
//         if (author) filter.author = author;
//         if (tag) filter.tags = tag;
        
//         // Text search if searchQuery provided
//         if (searchQuery) {
//           filter.$text = { $search: searchQuery };
//         }

//         // Get posts with pagination
//         const posts = await Post.find(filter)
//           .sort({ createdAt: -1 })
//           .skip(skip)
//           .limit(Number(limit))
//           .populate('author', 'name avatar')
//           .lean();
        
//         // Get total posts count for pagination
//         const totalPosts = await Post.countDocuments(filter);
        
//         return res.status(200).json({
//           posts,
//           totalPosts,
//           totalPages: Math.ceil(totalPosts / Number(limit)),
//           currentPage: Number(page)
//         });
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Error fetching posts' });
//       }
//       break;
    
//     case 'POST':
//       // Handle post creation (not implemented here)
//       break;
      
//     default:
//       return res.status(405).json({ message: 'Method not allowed' });
//   }
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Post from '@/model/Post';

// Define an interface for the filter object to provide type safety
interface PostFilter {
  status: string;
  category?: string;
  author?: string;
  tags?: string;
  $text?: { $search: string };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  await dbConnect();
  
  switch (method) {
    case 'GET':
      try {
        const {
          page = 1,
          limit = 10,
          category,
          tag,
          author,
          status = 'published',
          searchQuery
        } = req.query;
        
        const skip = (Number(page) - 1) * Number(limit);
       
        // Create filter with type safety
        const filter: PostFilter = { status };
       
        if (category) filter.category = String(category);
        if (author) filter.author = String(author);
        if (tag) filter.tags = String(tag);
       
        // Text search if searchQuery provided
        if (searchQuery) {
          filter.$text = { $search: String(searchQuery) };
        }
        
        // Get posts with pagination
        const posts = await Post.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate('author', 'name avatar')
          .lean();
       
        // Get total posts count for pagination
        const totalPosts = await Post.countDocuments(filter);
       
        return res.status(200).json({
          posts,
          totalPosts,
          totalPages: Math.ceil(totalPosts / Number(limit)),
          currentPage: Number(page)
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching posts' });
      }
   
    case 'POST':
      // Handle post creation (not implemented here)
      break;
     
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}