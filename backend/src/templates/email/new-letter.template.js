/**
 * Template for New Letter Delivered email notification
 * @param {Object} params
 * @param {string} params.senderName - Name of the partner who sent the letter
 * @param {string} params.letterTitle - Title/subject of the letter
 * @param {string} params.letterUrl - Direct link to the letter in Usly frontend
 * @returns {Object} { subject, html, text }
 */
export const getNewLetterEmailTemplate = ({ senderName, letterTitle, letterUrl }) => {
  const subject = `You received a new letter 💌`;

  const text = `You have a new letter 💌\n\n${senderName} has sent you a new letter "${letterTitle || 'Untitled'}" on Usly.\n\nOpen Usly to read it:\n${letterUrl}`;

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
              <span style="font-size: 40px;">💌</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #6D28D9;">You have a new letter</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px; color: #5F5268; font-size: 15px; line-height: 1.6;">
              <strong>${senderName}</strong> has sent you a new letter <strong>"${letterTitle || 'Untitled'}"</strong> on Usly.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${letterUrl}" target="_blank" style="display: inline-block; background-color: #6D28D9; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);">
                Open Letter 💌
              </a>
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
