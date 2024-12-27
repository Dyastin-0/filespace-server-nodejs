const emailTemplate = (title, message, link, linkTitle) => {
  const escapeEmail = (text) =>
    text.replace(/\./g, "&#46;").replace(/@/g, "&#64;");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeEmail(title)}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #212830; padding: 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 400px; background-color: #1a2028; border: 1px solid #343d49; border-radius: 10px; padding: 20px;">
              
              <!-- Logo Section -->
              <tr>
                <td align="center">
                  <h1 style="display: inline; font-size: 24px; font-weight: bold; color: #4daafc; margin: 0;">File</h1>
                  <h1 style="display: inline; font-size: 24px; font-weight: bold; color: #ffffff; margin: 0;">Space</h1>
                </td>
              </tr>

              <!-- Title Section -->
              <tr>
                <td align="center" style="padding: 20px 0 10px 0;">
                  <h2 style="font-size: 18px; color: #f2f2f3; margin: 0; white-space: nowrap;">${escapeEmail(
                    title
                  )}</h2>
                </td>
              </tr>

              <!-- Message Section -->
              <tr>
                <td align="center" style="padding: 10px 0 20px 0;">
                  <p style="font-size: 14px; color: #cacaca; line-height: 1.5; margin: 0; white-space: normal;">
                    ${escapeEmail(message)}
                  </p>
                </td>
              </tr>

              <!-- Call-to-Action Button -->
              ${
                link
                  ? `
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${link}" style="display: inline-block; font-size: 14px; color: #ffffff; background-color: #2b333e; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                      ${linkTitle}
                    </a>
                  </td>
                </tr>`
                  : ""
              }

              <!-- Footer Section -->
              <tr>
                <td align="center" style="padding: 20px 0 0 0;">
                  <p style="font-size: 12px; color: #cacaca; line-height: 1.5; margin: 0;">
                    If you have any questions, contact us at
                    <a href="mailto:support@filespace.dyastin.tech" style="color: #4daafc; text-decoration: none;">support@filespace.dyastin.tech</a>.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export { emailTemplate };
