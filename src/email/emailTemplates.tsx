export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff;">
  <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
    <h1 style="color: #fff; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #fff; padding: 20px; border: 1px solid #000;">
    <p>Hello {username},</p>
    <p>Thank you for signing up! Your verification code is:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">{verificationCode}</span>
    </div>
    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <p>Best regards,<br>One Campus</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #000; font-size: 0.8em; border-top: 1px solid #000; padding-top: 10px;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff;">
  <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
    <h1 style="color: #fff; margin: 0;">Password Reset</h1>
  </div>
  <div style="background-color: #fff; padding: 20px; border: 1px solid #000;">
    <p>Hello,</p>
    <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #000; color: #fff; padding: 12px 20px; text-decoration: none; border: 1px solid #000; font-weight: bold;">Reset Password</a>
    </div>
    <p>This link will expire in 1 hour for security reasons.</p>
    <p>Best regards,<br>One Campus</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #000; font-size: 0.8em; border-top: 1px solid #000; padding-top: 10px;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;
