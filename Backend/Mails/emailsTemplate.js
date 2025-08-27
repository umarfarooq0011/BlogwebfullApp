export const VERIFICATION_EMAIL_TEMPLATE = (verificationCode, userName = "User") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Account</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#ffffff; color:#0f172a;">

  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.1); overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg, #1e40af, #3b82f6); text-align:center; padding:24px 16px;">
      
      <h1 style="color:#ffffff; margin:0; font-size:28px; letter-spacing:1px;">InsightSphere</h1>
    </div>

    <!-- Content -->
    <div style="padding:28px 20px; background-color:#f8fafc; color:#0f172a;">

      <p style="font-size:20px; margin-bottom:18px;">Hello <span style="color:#2563eb; font-weight:600;">${userName}</span>,</p>
      
      <p style="font-size:16px; line-height:1.6; margin-bottom:25px; color:#334155;">
        Thank you for joining <strong>InsightSphere</strong>, your premium blogging platform.
        To complete your registration, please verify your email address using the code below.
      </p>

      <!-- Verification Code Box -->
      <div style="background:#e0f2fe; border:2px dashed #60a5fa; border-radius:12px; padding:24px 16px; text-align:center; margin-bottom:28px;">
        <p style="margin:0 0 12px; font-size:14px; text-transform:uppercase; color:#0284c7; letter-spacing:1px;">Your Verification Code</p>
        <div style="font-size:36px; letter-spacing:10px; font-weight:700; background:linear-gradient(to right, #3b82f6, #6366f1); -webkit-background-clip:text; -webkit-text-fill-color:transparent; padding:12px 0; user-select:all;">
          ${verificationCode}
        </div>
        <p style="margin-top:10px; font-size:13px; color:#64748b; font-style:italic;">This code will expire in 24 hours</p>
      </div>

      <!-- Instructions -->
      <div style="background:#f1f5f9; padding:18px; border-left:4px solid #3b82f6; border-radius:10px; color:#334155; font-size:15px; line-height:1.6;">
        <p style="margin:0;">Enter this code on the verification page to activate your account and unlock all premium features.</p>
        <p style="margin-top:12px;">If you didn't request this email, you can safely ignore it.</p>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:16px; background:#e2e8f0; font-size:13px; color:#475569;">
      InsightSphere — Your premium blogging destination
    </div>

  </div>

</body>
</html>
`;


export const WELCOME_EMAIL_TEMPLATE = (name = "User") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to InsightSphere</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f9fafb; color:#0f172a;">

  <div style="max-width:640px; margin:40px auto; background:#ffffff; border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,0.08); overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg, #1e3a8a, #3b82f6); text-align:center; padding:32px 20px;">
      <img src="cid:logo" alt="InsightSphere Logo" style="width:80px; margin-bottom:16px;" />
      <h1 style="color:#ffffff; margin:0; font-size:32px; letter-spacing:0.5px;">Welcome to InsightSphere</h1>
      <p style="color:#dbeafe; font-size:16px; margin-top:8px;">Where Ideas Become Influence</p>
    </div>

    <!-- Content -->
    <div style="padding:36px 28px; background-color:#f9fafb;">

      <p style="font-size:20px; font-weight:500; margin-bottom:20px;">
        Hi <span style="color:#2563eb;">${name}</span>,
      </p>

      <p style="font-size:16px; line-height:1.6; color:#334155; margin-bottom:24px;">
        We're thrilled to welcome you to <strong>InsightSphere</strong> — a premium space built for writers, thinkers, and innovators. You've taken the first step toward building your digital presence and influence.
      </p>

      <!-- Highlight Box -->
      <div style="background:#e0f2fe; border-left:6px solid #3b82f6; padding:20px 18px; border-radius:12px; margin-bottom:28px; color:#0f172a;">
        <p style="margin:0; font-size:16px;">
          Your email has been successfully verified. You now have full access to your personalized dashboard.
        </p>
      </div>

      <!-- Dashboard Button -->
      <div style="text-align:center; margin-bottom:32px;">
        <a href="${process.env.AUTHOR_URL}" style="background-color:#3b82f6; color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; padding:14px 28px; border-radius:8px; display:inline-block;"></a>
          Go to Dashboard →
        </a>
      </div>

      <p style="font-size:15px; color:#64748b; text-align:center;">
        If you have any questions, reply to this email — we're here to help.
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:18px; background:#f1f5f9; font-size:13px; color:#475569;">
      &copy; ${new Date().getFullYear()} InsightSphere • All Rights Reserved
    </div>

  </div>

</body>
</html>
`;


export const PASSWORD_RESET_REQUEST_TEMPLATE = (resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#0f172a;">

  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg, #1e3a8a, #3b82f6); text-align:center; padding:32px 24px;">
      <img src="cid:logo" alt="InsightSphere Logo" style="width:64px; margin-bottom:16px;" />
      <h1 style="color:#ffffff; margin:0; font-size:26px; letter-spacing:0.5px;">Reset Your Password</h1>
    </div>

    <!-- Content -->
    <div style="padding:32px 24px;">
      <p style="font-size:18px; margin-bottom:12px;">Hi there,</p>

      <p style="font-size:16px; line-height:1.6; color:#334155; margin-bottom:24px;">
        We received a request to reset your password. Click the button below to continue. If you didn't make this request, you can safely ignore this message.
      </p>

      <!-- Reset Button -->
      <div style="text-align:center; margin:28px 0;">
        <a href="${resetLink}" style="display:inline-block; background-color:#3b82f6; color:#ffffff; padding:14px 32px; border-radius:8px; text-decoration:none; font-size:16px; font-weight:600;">
          Reset Password
        </a>
      </div>

      <p style="font-size:14px; color:#64748b; margin-top:16px;">
        This link will remain valid for 30 minutes. Please do not share it with anyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#f1f5f9; padding:20px; text-align:center; font-size:13px; color:#64748b;">
      Need help? Just reply to this email. <br/>
      — InsightSphere Security Team
    </div>

  </div>

</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = (name = "User") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset Successful</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#0f172a;">

  <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:16px; box-shadow:0 4px 16px rgba(0,0,0,0.08); overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg, #1e3a8a, #3b82f6); text-align:center; padding:32px 24px;">
      <img src="cid:logo" alt="InsightSphere Logo" style="width:64px; margin-bottom:16px;" />
      <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing:0.5px;">Password Reset Successful</h1>
    </div>

    <!-- Content -->
    <div style="padding:32px 24px;">
      <p style="font-size:18px; margin-bottom:12px;">Hi <strong style="color:#2563eb;">${name}</strong>,</p>

      <p style="font-size:16px; color:#334155; line-height:1.6; margin-bottom:24px;">
        Your password has been successfully updated. You can now sign in using your new credentials. Please keep your password secure and do not share it with anyone.
      </p>

      <!-- Login Button -->
      <div style="text-align:center; margin:30px 0;">
        <a href="${process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173'}/login" style="display:inline-block; background-color:#3b82f6; color:#ffffff; padding:14px 32px; border-radius:8px; text-decoration:none; font-size:16px; font-weight:600;">
          Go to Login
        </a>
      </div>

      <p style="font-size:14px; color:#64748b;">
        If you did not request this change, please contact our support team immediately.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#f1f5f9; padding:20px; text-align:center; font-size:13px; color:#64748b;">
      InsightSphere — Your premium blogging destination
    </div>

  </div>

</body>
</html>
`;

// Template for newsletter subscription confirmation
export const getSubscriptionTemplate = () => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; }
        .header { color: #8a2be2; font-size: 24px; text-align: center; margin-bottom: 20px; }
        .content { color: #333; text-align: center; }
        .footer { margin-top: 20px; font-size: 0.8em; text-align: center; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="header">Subscription Confirmed!</h2>
        <div class="content">
          <p>Thank you for subscribing to the <strong>Bookify</strong> newsletter.</p>
          <p>You're all set to receive the latest news, articles, and updates directly to your inbox.</p>
        </div>
        <div class="button-container">
          <a href="${process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173'}" class="button">Visit Website</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Bookify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Template for new post notification
export const getNewPostTemplate = (post) => {
  const postUrl = `${process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173'}/blog/${post._id}`; 
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { color: #333; }
        .thumbnail { max-width: 100%; border-radius: 8px; margin-bottom: 15px; }
        .content { color: #555; }
        .button-container { text-align: center; margin-top: 20px; }
        .button { background-color: #fff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { margin-top: 25px; font-size: 0.8em; text-align: center; color: #777; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Post: ${post.title}</h2>
        </div>
        <img src="${post.thumbnail}" alt="${post.title}" class="thumbnail" />
        <div class="content">
          <p>${post.description}</p>
          <p style="margin-top: 15px; font-style: italic; text-align: center;">Visit our website to read the full article.</p>
        </div>
        <div class="footer">
          <p>You are receiving this email because you subscribed to our newsletter.</p>
          <p>&copy; ${new Date().getFullYear()} Bookify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
