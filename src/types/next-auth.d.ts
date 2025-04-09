// import { DefaultSession } from "next-auth";

// declare module "next-auth" {
//   interface User {
//     _id?: string;
//     isVerified?: boolean;
//     username?: string;
//     role?: string;
//     rollno?: string;
//   }
//   interface Session {
//     user: {
//       _id?: string;
//       isVerified?: boolean;
//       username?: string;
//       role?: string;
//       rollno?: string;
//     } & DefaultSession["user"];
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//     isVerified?: boolean;
//     username?: string;
//     role?: string;
//     rollno?: string;

//   }
// }
// @/types/next-auth.d.ts
import "next-auth";
import { DefaultSession } from "next-auth";
import { AttendanceData } from "@/lib/attendanceUtils";

declare module "next-auth" {
  interface User {
    _id?: string;
    username: string;
    isVerified: boolean;
    role: string;
    rollno?: string;
    college_id?: string;
    attendanceData?: AttendanceData;
  }

  interface Session {
    user: DefaultSession["user"] & {
      _id: string;
      username: string;
      isVerified: boolean;
      role: string;
      rollno?: string;
      college_id?: string;
      attendanceData?: AttendanceData;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    isVerified: boolean;
    role: string;
    rollno?: string;
    college_id?: string;
    attendanceData?: AttendanceData;
  }
}
