import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  content: string;
  images: {
    url: string;
    caption?: string;
    altText?: string;
  }[];
  authorName: string;
  author: mongoose.Types.ObjectId;
  category?: string;
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  comments: {
    author: mongoose.Types.ObjectId;
    content: string;
    likes: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt?: Date;
  }[];
  shares: number;
  views: number;
  isPrivate: boolean;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      trim: true,
      required: [true, "Post content is required"]
    },
    images: [
      {
        url: {
          type: String,
          required: true
        },
        caption: {
          type: String,
          default: ""
        },
        altText: {
          type: String,
          default: ""
        }
      }
    ],
    authorName: {
      type: String,
      ref: "User",
      required: [true, "Author is required"]
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"]
    },
    category: {
      type: String,
      default: "General"
    },
    tags: [String],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    comments: [
      {
        author: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        content: {
          type: String,
          required: true,
          trim: true
        },
        likes: [
          {
            type: Schema.Types.ObjectId,
            ref: "User"
          }
        ],
        createdAt: {
          type: Date,
          default: Date.now
        },
        updatedAt: {
          type: Date
        }
      }
    ],
    shares: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published"
    }
  },
  { timestamps: true }
);

// Index for faster searching
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Virtual field for comment count
PostSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if user has liked the post
PostSchema.methods.isLikedBy = function(userId: mongoose.Types.ObjectId) {
  return this.likes.some((like: mongoose.Types.ObjectId) => like.toString() === userId.toString());
};

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);