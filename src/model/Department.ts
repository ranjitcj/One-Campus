import mongoose, { Schema, Document } from "mongoose";

export interface Department extends Document {
  name: string;
  code: string;
  academicYear: mongoose.Types.ObjectId;
  description?: string;
}

const DepartmentSchema: Schema<Department> = new Schema({
  name: {
    type: String,
    required: [true, "Department name is required"],
  },
  code: {
    type: String,
    required: [true, "Department code is required"],
    unique: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

const DepartmentModel =
  (mongoose.models.Department as mongoose.Model<Department>) ||
  mongoose.model<Department>("Department", DepartmentSchema);

export default DepartmentModel; 