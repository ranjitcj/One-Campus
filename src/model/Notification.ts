import mongoose, { Schema, Document } from "mongoose";

export interface Notification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: "like" | "comment" | "connectionAccepted";
  relatedUser?: mongoose.Types.ObjectId;
  relatedPost?: mongoose.Types.ObjectId;
  read: boolean;
}

const NotificationSchema: Schema<Notification> = new Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["like", "comment", "connectionAccepted"],
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const NotificationModel =
  (mongoose.models.User as mongoose.Model<Notification>) ||
  mongoose.model<Notification>("User", NotificationSchema);

export default NotificationModel;
