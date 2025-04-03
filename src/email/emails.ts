import axios from "axios";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./emailTemplates";

export const sendVerificationEmail = async (
  email: string,
  username: string,
  verificationToken: string
) => {
  const API_KEY = process.env.EMAIL_API;
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "One Campus",
          email: "teamvikram4u@gmail.com",
        },
        to: [{ email }],
        subject: "Verification",
        htmlContent: VERIFICATION_EMAIL_TEMPLATE.replace(
          "{verificationCode}",
          verificationToken
        ).replace("{username}", username),
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": API_KEY,
        },
      }
    );
    console.log("Email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error sending email:",
        error.response ? error.response.data : error.message
      );
    } else {
      console.error("Error sending email:", error);
    }
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetURL: string
) => {
  const API_KEY = process.env.EMAIL_API;

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "One Campus",
          email: "teamvikram4u@gmail.com",
        },
        to: [{ email }],
        subject: "Reset your password",
        htmlContent: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
          "{resetURL}",
          resetURL
        ),
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "api-key": API_KEY,
        },
      }
    );
    console.log("Email sent successfully:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error sending email:",
        error.response ? error.response.data : error.message
      );
    } else {
      console.error("Error sending email:", error);
    }
    throw error;
  }
};
