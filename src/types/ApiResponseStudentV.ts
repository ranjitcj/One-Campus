import { AttendanceData } from "@/lib/attendanceUtils";

export interface ApiResponseStudentV {
  success: boolean;
  message: string;
  attendanceData?: AttendanceData;
}
