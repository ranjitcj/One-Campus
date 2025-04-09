import { Document, Schema, model, models } from "mongoose";

export interface Subject extends Document {
  name: string;
  code: number;
  department: Schema.Types.ObjectId;
  description?: string;
  credits: number;
  semester: number;
}

const SubjectSchema = new Schema<Subject>(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    code: {
      type: Number,
      required: [true, "Subject code is required"],
      unique: true,
      min: [1, "Subject code must be at least 1"],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: [1, "Credits must be at least 1"],
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: [1, "Semester must be at least 1"],
    },
  },
  {
    timestamps: true,
  }
);

export const SubjectModel = models.Subject || model<Subject>("Subject", SubjectSchema); 