import mongoose, { Schema, Document } from "mongoose";

export interface AcademicYear extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const AcademicYearSchema: Schema<AcademicYear> = new Schema({
  name: {
    type: String,
    required: [true, "Academic year name is required"],
    unique: true,
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const AcademicYearModel =
  (mongoose.models.AcademicYear as mongoose.Model<AcademicYear>) ||
  mongoose.model<AcademicYear>("AcademicYear", AcademicYearSchema);

export default AcademicYearModel; 