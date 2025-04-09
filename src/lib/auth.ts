import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "./mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { compare } from "bcryptjs";
import dbConnect from "./dbConnect";
import { User as AuthUser } from "next-auth";

interface CustomUser extends AuthUser {
  _id: string;
  username: string;
  name?: string;
  email?: string;
  image?: string;
  isVerified: boolean;
  role: string;
  rollno?: string;
  college_id?: string;
  attendanceData?: any;
}

interface CustomToken {
  _id: string;
  username: string;
  name?: string;
  email?: string;
  picture?: string;
  isVerified: boolean;
  role: string;
  rollno?: string;
  college_id?: string;
  attendanceData?: any;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        await dbConnect();

        const user = await User.findOne({ username: credentials.username });
        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          _id: user._id.toString(),
          username: user.username,
          name: user.name,
          email: user.email,
          image: user.image,
          isVerified: user.isVerified,
          role: user.role,
          rollno: user.rollno,
          college_id: user.college_id,
          attendanceData: user.attendanceData,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token._id = customUser._id;
        token.username = customUser.username;
        token.isVerified = customUser.isVerified;
        token.role = customUser.role;
        token.rollno = customUser.rollno;
        token.college_id = customUser.college_id;
        token.attendanceData = customUser.attendanceData;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        const customToken = token as unknown as CustomToken;
        session.user._id = customToken._id;
        session.user.username = customToken.username;
        session.user.name = customToken.name;
        session.user.email = customToken.email;
        session.user.image = customToken.picture;
        session.user.isVerified = customToken.isVerified;
        session.user.role = customToken.role;
        session.user.rollno = customToken.rollno;
        session.user.college_id = customToken.college_id;
        session.user.attendanceData = customToken.attendanceData;
      }
      return session;
    },
  },
}; 