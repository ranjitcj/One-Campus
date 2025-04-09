import mongoose, { Document, Schema } from "mongoose";

export interface Student extends Document {
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
  department?: mongoose.Types.ObjectId;
  subjects: mongoose.Types.ObjectId[];
  attendance: {
    subject: mongoose.Types.ObjectId;
    date: Date;
    status: "present" | "absent" | "late";
  }[];
}

const studentSchema = new Schema<Student>({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  rollNumber: {
    type: String,
    required: [true, "Roll number is required"],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department"
  },
  subjects: [{
    type: Schema.Types.ObjectId,
    ref: "Subject"
  }],
  attendance: [{
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true
    }
  }]
}, {
  timestamps: true
});

const StudentModel = mongoose.models.Student || mongoose.model<Student>("Student", studentSchema);

export default StudentModel;
