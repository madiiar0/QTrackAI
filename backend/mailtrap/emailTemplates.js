export const VERIFICATION_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;color:#1f1f1f;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f5f5;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:8px;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #eeeeee;">
                <div style="font-size:18px;font-weight:700;color:#111111;">QTrackAI</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <div style="font-size:20px;font-weight:700;margin:0 0 12px 0;color:#111111;">Verify your email</div>
                <div style="font-size:14px;line-height:1.6;color:#333333;margin:0 0 16px 0;">
                  Use the verification code below to finish setting up your account.
                </div>
                <div style="font-size:28px;letter-spacing:4px;font-weight:700;color:#6d28d9;background:#f5f3ff;border:1px solid #e9d5ff;border-radius:6px;padding:12px 16px;text-align:center;">
                  {verificationToken}
                </div>
                <div style="font-size:12px;line-height:1.6;color:#666666;margin:16px 0 0 0;">
                  If you did not request this, you can safely ignore this email.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #eeeeee;font-size:12px;color:#666666;">
                Need help? Contact {supportEmail}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;color:#1f1f1f;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f5f5;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:8px;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #eeeeee;">
                <div style="font-size:18px;font-weight:700;color:#111111;">QTrackAI</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <div style="font-size:20px;font-weight:700;margin:0 0 12px 0;color:#111111;">Reset your password</div>
                <div style="font-size:14px;line-height:1.6;color:#333333;margin:0 0 20px 0;">
                  Click the button below to create a new password.
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td bgcolor="#6d28d9" style="border-radius:6px;">
                      <a href="{resetURL}" style="display:inline-block;padding:12px 18px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                <div style="font-size:12px;line-height:1.6;color:#666666;margin:16px 0 0 0;">
                  If you did not request this, you can safely ignore this email.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #eeeeee;font-size:12px;color:#666666;">
                Need help? Contact {supportEmail}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset Successful</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;color:#1f1f1f;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f5f5;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:8px;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #eeeeee;">
                <div style="font-size:18px;font-weight:700;color:#111111;">QTrackAI</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <div style="font-size:20px;font-weight:700;margin:0 0 12px 0;color:#111111;">Password updated</div>
                <div style="font-size:14px;line-height:1.6;color:#333333;margin:0 0 12px 0;">
                  Your password was reset successfully. You can now sign in with your new password.
                </div>
                <div style="font-size:12px;line-height:1.6;color:#666666;margin:16px 0 0 0;">
                  If this wasn’t you, please contact support immediately.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #eeeeee;font-size:12px;color:#666666;">
                Need help? Contact {supportEmail}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
