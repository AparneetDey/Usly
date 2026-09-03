/**
 * Email template for verifying a new email address change
 * @param {Object} params
 * @param {string} params.userName - Name of the user requesting the email change
 * @param {string} params.newEmail - The new email address
 * @param {string} params.verificationUrl - Direct URL to verify the change
 * @returns {Object} { subject, html, text }
 */
export const getEmailChangeVerificationTemplate = ({ userName, newEmail, verificationUrl }) => {
  const subject = `Verify your new Usly email address 💌`;

  const text = `Hi ${userName || 'there'},\n\nYou requested to change the email address associated with your Usly account to ${newEmail}.\n\nClick the link below to verify your new email address:\n${verificationUrl}\n\nThis link expires in 30 minutes.\nIf you did not request this change, you can safely ignore this email.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F3FF; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #24132F;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F7F3FF; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #FFFFFF; border: 1px solid #D8CCEA; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(109, 40, 217, 0.06);">
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <span style="font-size: 40px;">✉️</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #6D28D9;">Verify your new email address</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px; color: #5F5268; font-size: 15px; line-height: 1.6;">
              Hi <strong>${userName || 'Love'}</strong>,<br/>
              You requested to update your Usly account email address to <strong>${newEmail}</strong>.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${verificationUrl}" target="_blank" style="display: inline-block; background-color: #6D28D9; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);">
                Verify Email Address 💜
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 20px; font-size: 13px; color: #7C6F85;">
              This verification link expires in 30 minutes.<br/>
              If you did not request this change, you can safely ignore this email.
            </td>
          </tr>
          <tr>
            <td align="center" style="border-top: 1px solid #EDE9FE; padding-top: 20px; font-size: 12px; color: #7C6F85;">
              Usly • Our Private Space ❤️
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return { subject, html, text };
};
