import mongoose, { Schema, Document } from "mongoose";

export interface Student extends Document {
  rollno: string;
  email: string;
  college_id: string;
}
const StudentSchema: Schema<Student> = new Schema({
  rollno: {
    type: String,
    required: [true, "Rollno is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
  },
  college_id: {
    type: String,
    required: [true, "College id is required"],
    unique: true,
  },
});

const StudentModel =
  (mongoose.models.Student as mongoose.Model<Student>) ||
  mongoose.model<Student>("Student", StudentSchema);
export default StudentModel;
