/**
 * Template for New Complaint Created email notification
 * @param {Object} params
 * @param {string} params.creatorName - Name of the partner who created the complaint
 * @param {string} params.complaintTitle - Title of the complaint ticket
 * @param {string} params.complaintUrl - Direct link to the complaint box in Usly frontend
 * @returns {Object} { subject, html, text }
 */
export const getNewComplaintEmailTemplate = ({ creatorName, complaintTitle, complaintUrl }) => {
  const subject = `You have a new complaint 😅`;

  const text = `You have a new complaint 😅\n\n${creatorName} has submitted a new complaint "${complaintTitle || 'Untitled'}" to the Usly complaint box.\n\nView Complaint on Usly:\n${complaintUrl}`;

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
              <span style="font-size: 40px;">😅</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #6D28D9;">You have a new complaint</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px; color: #5F5268; font-size: 15px; line-height: 1.6;">
              <strong>${creatorName}</strong> has submitted a new complaint <strong>"${complaintTitle || 'Untitled'}"</strong> to the Usly complaint box.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${complaintUrl}" target="_blank" style="display: inline-block; background-color: #6D28D9; color: #FFFFFF; font-size: 15px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(109, 40, 217, 0.2);">
                View Complaint 😭
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
