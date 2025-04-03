import mongoose, { Schema, Document } from "mongoose";

export interface ConnectionRequest extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
}

const ConnectionRequestSchema: Schema<ConnectionRequest> = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ConnectionRequestModel =
  (mongoose.models.ConnectionRequest as mongoose.Model<ConnectionRequest>) ||
  mongoose.model<ConnectionRequest>("User", ConnectionRequestSchema);

export default ConnectionRequestModel;
