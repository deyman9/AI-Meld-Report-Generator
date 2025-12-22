/**
 * Email template for successful report generation
 */

interface ReportReadyData {
  companyName: string;
  reportType: string;
  valuationDate: string;
  dashboardUrl: string;
  warnings?: string[];
}

export function buildReportReadyEmail(data: ReportReadyData): {
  subject: string;
  html: string;
  text: string;
} {
  const { companyName, reportType, valuationDate, dashboardUrl, warnings } = data;
  
  const reportTypeDisplay = reportType === 'FOUR09A' ? '409A Valuation' : 'Gift & Estate (59-60)';
  
  const subject = `Your ${companyName} Valuation Report is Ready`;
  
  const warningsSection = warnings && warnings.length > 0 
    ? `
      <div style="margin-top: 20px; padding: 15px; background-color: #FEF3C7; border-radius: 8px;">
        <h3 style="color: #92400E; margin: 0 0 10px 0; font-size: 14px;">Notes for Review:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #78350F;">
          ${warnings.map(w => `<li style="margin-bottom: 5px;">${w}</li>`).join('')}
        </ul>
      </div>
    `
    : '';
  
  const warningsTextSection = warnings && warnings.length > 0
    ? `\n\nNotes for Review:\n${warnings.map(w => `- ${w}`).join('\n')}`
    : '';
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">MELD Report Generator</h1>
  </div>
  
  <div style="background-color: #F9FAFB; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #059669; margin: 0 0 20px 0;">✓ Your Report is Ready!</h2>
    
    <p style="margin: 0 0 20px 0;">
      Great news! Your AI-powered valuation report has been generated and is ready for download.
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
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Valuation Date:</td>
          <td style="padding: 8px 0; color: #1F2937; font-weight: 500;">${valuationDate}</td>
        </tr>
      </table>
    </div>
    
    ${warningsSection}
    
    <div style="margin-top: 25px; text-align: center;">
      <a href="${dashboardUrl}" 
         style="display: inline-block; background-color: #2563EB; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 500; font-size: 16px;">
        Download Your Report
      </a>
    </div>
    
    <p style="margin: 25px 0 0 0; font-size: 14px; color: #6B7280;">
      This report is a draft and should be reviewed before finalizing. The report will be available for 30 days.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
    <p style="margin: 0;">MELD AI Report Generator</p>
    <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply directly to this email.</p>
  </div>
  
</body>
</html>
  `.trim();
  
  const text = `
MELD Report Generator - Your Report is Ready!

Great news! Your AI-powered valuation report has been generated and is ready for download.

Report Details:
- Company: ${companyName}
- Report Type: ${reportTypeDisplay}
- Valuation Date: ${valuationDate}
${warningsTextSection}

Download your report at: ${dashboardUrl}

This report is a draft and should be reviewed before finalizing. The report will be available for 30 days.

---
MELD AI Report Generator
This is an automated message. Please do not reply directly to this email.
  `.trim();
  
  return { subject, html, text };
}

