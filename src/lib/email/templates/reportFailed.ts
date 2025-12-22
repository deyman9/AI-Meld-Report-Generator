/**
 * Email template for failed report generation
 */

interface ReportFailedData {
  companyName: string;
  reportType: string;
  errorMessage: string;
  dashboardUrl: string;
}

export function buildReportFailedEmail(data: ReportFailedData): {
  subject: string;
  html: string;
  text: string;
} {
  const { companyName, reportType, errorMessage, dashboardUrl } = data;
  
  const reportTypeDisplay = reportType === 'FOUR09A' ? '409A Valuation' : 'Gift & Estate (59-60)';
  
  const subject = `Report Generation Failed - ${companyName}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">MELD Report Generator</h1>
  </div>
  
  <div style="background-color: #F9FAFB; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #DC2626; margin: 0 0 20px 0;">⚠ Report Generation Failed</h2>
    
    <p style="margin: 0 0 20px 0;">
      We encountered an error while generating your valuation report. Please try again or contact support if the issue persists.
    </p>
    
    <div style="background-color: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Report Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280; width: 140px;">Company:</td>
          <td style="padding: 8px 0; color: #1F2937; font-weight: 500;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Report Type:</td>
          <td style="padding: 8px 0; color: #1F2937; font-weight: 500;">${reportTypeDisplay}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #FEE2E2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 10px 0; color: #991B1B; font-size: 14px;">Error Details:</h4>
      <p style="margin: 0; color: #7F1D1D; font-size: 14px;">${errorMessage}</p>
    </div>
    
    <div style="margin-top: 25px; text-align: center;">
      <a href="${dashboardUrl}" 
         style="display: inline-block; background-color: #2563EB; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>
    
    <div style="margin-top: 25px; padding: 15px; background-color: #F3F4F6; border-radius: 8px;">
      <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">Troubleshooting Tips:</h4>
      <ul style="margin: 0; padding-left: 20px; color: #4B5563; font-size: 14px;">
        <li style="margin-bottom: 5px;">Verify the Excel model file is in the correct format</li>
        <li style="margin-bottom: 5px;">Ensure all required sheets are present (LEs, Summary, Exhibits)</li>
        <li style="margin-bottom: 5px;">Check that company name and valuation date cells are populated</li>
        <li style="margin-bottom: 0;">Try uploading the model file again</li>
      </ul>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
    <p style="margin: 0;">MELD AI Report Generator</p>
    <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply directly to this email.</p>
  </div>
  
</body>
</html>
  `.trim();
  
  const text = `
MELD Report Generator - Report Generation Failed

We encountered an error while generating your valuation report for ${companyName}.

Report Details:
- Company: ${companyName}
- Report Type: ${reportTypeDisplay}

Error: ${errorMessage}

Please try again or contact support if the issue persists.

Troubleshooting Tips:
- Verify the Excel model file is in the correct format
- Ensure all required sheets are present (LEs, Summary, Exhibits)
- Check that company name and valuation date cells are populated
- Try uploading the model file again

Go to Dashboard: ${dashboardUrl}

---
MELD AI Report Generator
This is an automated message. Please do not reply directly to this email.
  `.trim();
  
  return { subject, html, text };
}

