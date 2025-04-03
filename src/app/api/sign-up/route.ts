import { sendVerificationEmail } from "@/email/emails";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digit random number
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exits Email already exists",
          },
          {
            status: 400,
          }
        );
      } else {
        const newUserName = username;
        const hasedPassword = await bcrypt.hash(password, 10); // Hash password
        existingUserByEmail.username = newUserName;
        existingUserByEmail.password = hasedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // Set expiry date to 1 hour from now
        await existingUserByEmail.save();
      }
    } else {
      const newUserName = username;
      const hasedPassword = await bcrypt.hash(password, 10); // Hash password
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry date to 1 hour from now
      const newUser = new UserModel({
        username: newUserName,
        email,
        password: hasedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });
      await newUser.save();
    }
    //TODO:
    sendVerificationEmail(email, username, verifyCode);

    return Response.json(
      {
        success: true,
        message: "User registered successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error uploading", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: 500,
      }
    );
  }
}
