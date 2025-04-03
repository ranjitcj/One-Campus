// // src/api/auth/[...nextauth]/option.ts

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { username: credentials.identifier },
              { email: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error("No user found");
          }
          if (!user.isVerified) {
            throw new Error("User not verified");
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error: any) {
          throw new Error(`${error.message} - Invalid credentials`);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, session }) {
      // Initial token setup when user logs in
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.username = user.username;
        token.role = user.role;
        token.rollno = user.rollno;
        token.college_id = user.college_id;
      }

      // Handle attendance data update
      if (session?.attendanceData) {
        token.attendanceData = session.attendanceData;
      }

      return token;
    },
    async session({ session, token }) {
      // Always fetch the latest user data from the database
      await dbConnect();
      const user = await UserModel.findById(token._id);

      if (user) {
        // Update session with the latest data from UserModel
        session.user._id = token._id ? token._id.toString() : "";
        session.user.isVerified = user.isVerified;
        session.user.username = user.username;
        session.user.role = user.role || "user"; // Fallback in case role is undefined
        session.user.rollno = user.rollno || undefined;
        session.user.college_id = user.college_id || undefined;

        // Add attendance data if available in token
        if (token.attendanceData) {
          session.user.attendanceData = token.attendanceData;
        }
      } else {
        // If user is not found, invalidate the session
        throw new Error("Invalid session: user not found");
      }

      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import dbConnect from "@/lib/dbConnect";
// import bcrypt from "bcryptjs";
// import UserModel from "@/model/User";
// import { fetchAttendanceData } from "@/lib/attendanceUtils";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials: any): Promise<any> {
//         await dbConnect();
//         try {
//           const user = await UserModel.findOne({
//             $or: [
//               { username: credentials.identifier },
//               { email: credentials.identifier },
//             ],
//           });

//           if (!user) {
//             throw new Error("No user found");
//           }

//           if (!user.isVerified) {
//             throw new Error("User not verified");
//           }

//           const isPasswordCorrect = await bcrypt.compare(
//             credentials.password,
//             user.password
//           );

//           if (isPasswordCorrect) {
//             return user;
//           } else {
//             throw new Error("Invalid credentials");
//           }
//         } catch (error: any) {
//           throw new Error(`${error.message} - Invalid credentials`);
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user, session }) {
//       // Initial token setup when user logs in
//       if (user) {
//         token._id = user._id?.toString();
//         token.isVerified = user.isVerified;
//         token.username = user.username;
//         token.role = user.role;
//         token.rollno = user.rollno;
//         token.college_id = user.college_id;
//       }

//       // Handle attendance data updates from session
//       if (session?.attendanceData) {
//         token.attendanceData = session.attendanceData;
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       // Always fetch the latest user data from the database
//       await dbConnect();
//       const user = await UserModel.findById(token._id);

//       if (user) {
//         // Update session with the latest data from UserModel
//         session.user._id = token._id ? token._id.toString() : "";
//         session.user.isVerified = user.isVerified;
//         session.user.username = user.username;
//         session.user.role = user.role || "user"; // Fallback for undefined role
//         session.user.rollno = user.rollno || undefined;
//         session.user.college_id = user.college_id || undefined;

//         // If attendance data exists in token, add it to session
//         if (token.attendanceData) {
//           session.user.attendanceData = token.attendanceData;
//         } else if (user.rollno) {
//           // If not in token but user has a roll number, try to fetch it
//           try {
//             const attendanceData = await fetchAttendanceData(user.rollno);
//             if (attendanceData) {
//               session.user.attendanceData = attendanceData;
//             }
//           } catch (error) {
//             console.error(
//               "Error fetching attendance data in session callback:",
//               error
//             );
//             // Continue without attendance data if there's an error
//           }
//         }
//       } else {
//         // If user is not found, invalidate the session
//         throw new Error("Invalid session: user not found");
//       }

//       return session;
//     },
//   },
//   pages: {
//     signIn: "/signin",
//   },
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };
