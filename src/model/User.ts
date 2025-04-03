//src/model/User.ts

import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  name: string;
  username: string;
  role: "Student" | "App-user" | "Admin" | "Teacher";
  email: string;
  rollno: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  college_id: string;
  profilePicture: string;
  bannerImg: string;
  headline: string;
  location: string;
  about: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    startDate: Date;
    endDate: Date;
    description: string;
  }[];
  education: {
    school: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }[];
  connections: mongoose.Types.ObjectId[];
}

const UserSchema: Schema<User> = new Schema(
  {
    name: {
      type: String,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["Student", "App-user", "Admin", "Teacher"],
      default: "App-user",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    rollno: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    verifyCode: {
      type: String,
      required: [true, "Verify code is required"],
    },
    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verify code Expiry is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    college_id: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    bannerImg: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "App User",
    },
    location: {
      type: String,
      default: "Earth",
    },
    about: {
      type: String,
      default: "",
    },
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
