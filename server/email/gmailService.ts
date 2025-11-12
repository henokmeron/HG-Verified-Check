import axios from 'axios';

interface EmailOptions {
  to: string;
  subject: string;
  userName?: string;
  registration: string;
  pdfBuffer: Buffer;
}

/**
 * Gmail API Email Service
 * Uses Gmail API to send vehicle reports with PDF attachments
 */
export class GmailEmailService {
  private apiKey: string;
  private accessToken?: string;
  
  constructor() {
    this.apiKey = process.env.GMAIL_API_KEY || 'AIzaSyDw7fQGzsiZTbc8i3aaCLDJxCzi8FUXuQI';
  }

  /**
   * Set the OAuth access token for authenticated requests
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Create MIME message for Gmail API
   */
  private createMimeMessage(options: EmailOptions): string {
    const { to, userName, registration, pdfBuffer } = options;
    const boundary = `boundary_${Date.now()}`;
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // Build the MIME message
    const mimeLines = [
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      'MIME-Version: 1.0',
      `to: ${to}`,
      'from: support@hgverified.com',
      `subject: Your Vehicle History Report is Ready - ${registration}`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      'MIME-Version: 1.0',
      'Content-Transfer-Encoding: 7bit',
      '',
      '<!DOCTYPE html>',
      '<html>',
      '  <body style="font-family: Arial, sans-serif; color:#333;">',
      `    <p>Dear ${userName || 'Customer'},</p>`,
      `    <p>Your requested vehicle history report for <strong>${registration}</strong> is now ready.<br>`,
      '       Please find the detailed report attached below.</p>',
      '    <p>If you have any questions or need further assistance, feel free to reach out to us.</p>',
      '    <br>',
      '    <p style="color:#555; font-size:12px; border-top:1px solid #ccc; padding-top:10px;">',
      '      Thank you for using HG Verified Vehicle Check service.<br>',
      '      Email: support@hgverified.com<br>',
      '      Website: hgverified.com',
      '    </p>',
      '  </body>',
      '</html>',
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="VehicleHistoryReport_${registration}.pdf"`,
      'MIME-Version: 1.0',
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="VehicleHistoryReport_${registration}.pdf"`,
      '',
      pdfBase64,
      '',
      `--${boundary}--`
    ];
    
    return mimeLines.join('\r\n');
  }

  /**
   * Send email using Gmail API
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mimeMessage = this.createMimeMessage(options);
      
      // Base64 encode the entire MIME message
      const encodedMessage = Buffer.from(mimeMessage).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Gmail API endpoint
      const endpoint = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
      
      // Headers for the request
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      // Use access token if available (OAuth), otherwise use API key
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
      
      // Send the email
      const response = await axios.post(
        endpoint,
        {
          raw: encodedMessage
        },
        {
          headers,
          params: this.accessToken ? {} : { key: this.apiKey }
        }
      );
      
      console.log('✅ Email sent successfully via Gmail API:', response.data.id);
      return true;
      
    } catch (error: any) {
      console.error('❌ Failed to send email via Gmail API:', error.response?.data || error.message);
      
      // Log specific error details for debugging
      if (error.response?.status === 401) {
        console.error('Authentication error - OAuth token may be required for Gmail API');
      } else if (error.response?.status === 403) {
        console.error('Permission denied - Gmail API may need to be enabled or OAuth scopes configured');
      }
      
      return false;
    }
  }

  /**
   * Send vehicle report email with PDF attachment
   */
  async sendVehicleReport(
    to: string,
    registration: string,
    pdfBuffer: Buffer,
    userName?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      userName,
      registration,
      subject: `Your Vehicle History Report is Ready - ${registration}`,
      pdfBuffer
    });
  }
}

// Create singleton instance
export const gmailService = new GmailEmailService();