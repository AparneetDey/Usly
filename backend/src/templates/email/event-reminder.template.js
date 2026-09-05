/**
 * Event Reminder Email Template Generator
 * @param {Object} params
 * @param {string} params.recipientName - Name of the email recipient
 * @param {string} params.eventTitle - Title of the event
 * @param {string} params.eventDate - Formatted event date string
 * @param {string} [params.eventDescription] - Optional description of the event
 * @param {string} params.eventUrl - Full URL to open Usly calendar
 * @returns {{ subject: string, html: string, text: string }}
 */
export const getEventReminderEmailTemplate = ({
  recipientName,
  eventTitle,
  eventDate,
  eventDescription = '',
  eventUrl,
}) => {
  const subject = `Tomorrow: ${eventTitle}`;

  const text = `Hi ${recipientName},\n\nJust a little reminder that your event is tomorrow!\n\n${eventTitle}\n${eventDate}${
    eventDescription ? `\n\n${eventDescription}` : ''
  }\n\nOpen Usly: ${eventUrl}\n\nSee you there. 💜`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f5f9;
      color: #24132f;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 560px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(109, 40, 217, 0.08);
      border: 1px solid #e9e3f0;
    }
    .header {
      background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%);
      padding: 28px 32px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 13px;
      opacity: 0.9;
    }
    .body {
      padding: 32px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #24132f;
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 14px;
      color: #6b5b77;
      margin-bottom: 24px;
    }
    .event-card {
      background-color: #f9f7fc;
      border-left: 4px solid #6d28d9;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 28px;
    }
    .event-title {
      font-size: 18px;
      font-weight: 700;
      color: #6d28d9;
      margin: 0 0 6px 0;
    }
    .event-date {
      font-size: 13px;
      font-weight: 600;
      color: #8b5cf6;
      margin: 0 0 10px 0;
    }
    .event-desc {
      font-size: 13px;
      color: #4a3856;
      margin: 0;
    }
    .button-container {
      text-align: center;
      margin: 32px 0 20px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 999px;
      box-shadow: 0 4px 14px rgba(109, 40, 217, 0.25);
    }
    .footer {
      text-align: center;
      padding: 20px 32px 28px 32px;
      font-size: 12px;
      color: #9c8da8;
      border-top: 1px solid #f0eaf5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Usly Event Reminder</h1>
      <p>Your special moment is tomorrow</p>
    </div>
    <div class="body">
      <div class="greeting">Hi ${recipientName},</div>
      <div class="subtitle">Just a little reminder that your event is coming up tomorrow!</div>
      
      <div class="event-card">
        <div class="event-title">${eventTitle}</div>
        <div class="event-date">📅 ${eventDate}</div>
        ${eventDescription ? `<div class="event-desc">${eventDescription}</div>` : ''}
      </div>

      <div class="button-container">
        <a href="${eventUrl}" class="btn" target="_blank">Open Usly Calendar</a>
      </div>
    </div>
    <div class="footer">
      See you there. 💜<br>
      Sent automatically with love by Usly.
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html, text };
};

export default getEventReminderEmailTemplate;
