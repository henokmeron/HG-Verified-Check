import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { google } from 'googleapis';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  public transporter: Transporter | null = null; // Make public for checking
  private oauth2Client: any = null;
  private readonly fromAddress = process.env.GMAIL_ADDRESS || 'noreply@hgverified.com';
  private readonly replyTo = 'support@hgverified.com';
  private initializationPromise: Promise<void> | null = null;
  
  constructor() {
    this.initializationPromise = this.initializeTransporter();
  }

  // Method to ensure transporter is ready
  async ensureReady(): Promise<boolean> {
    if (this.transporter) {
      return true;
    }
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    return !!this.transporter;
  }

  private async initializeTransporter() {
    try {
      console.log('🔧 Initializing email service...');
      console.log('📧 Gmail address available:', !!process.env.GMAIL_ADDRESS);
      console.log('🔑 Gmail API key available:', !!process.env.GMAIL_API_KEY);
      console.log('🆔 Gmail client ID available:', !!process.env.GMAIL_CLIENT_ID);
      
      // Check if Gmail credentials are available
      if (!process.env.GMAIL_ADDRESS || !process.env.GMAIL_API_KEY) {
        console.warn('⚠️ Gmail credentials not configured - email sending disabled');
        console.warn('Missing: ', {
          address: !process.env.GMAIL_ADDRESS ? 'GMAIL_ADDRESS' : 'OK',
          apiKey: !process.env.GMAIL_API_KEY ? 'GMAIL_API_KEY' : 'OK'
        });
        return;
      }

      console.log('📬 Creating Gmail transporter with address:', process.env.GMAIL_ADDRESS);
      
      // Using nodemailer with Gmail App Password method
      // The GMAIL_API_KEY should be an app-specific password
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_ADDRESS,
          pass: process.env.GMAIL_API_KEY // App-specific password or API key
        }
      });

      console.log('🔗 Verifying Gmail connection...');
      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully with Gmail');
    } catch (error: any) {
      console.error('❌ Failed to initialize email service:', error.message || error);
      
      if (error.code === 'EAUTH' || error.message?.includes('Username and Password not accepted')) {
        console.error('\n📝 Gmail Authentication Failed - Instructions:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('The GMAIL_API_KEY needs to be an App Password, not your regular Gmail password.');
        console.error('\nTo generate an App Password:');
        console.error('1. Go to https://myaccount.google.com/security');
        console.error('2. Enable 2-Step Verification if not already enabled');
        console.error('3. Click on "2-Step Verification"');
        console.error('4. Scroll down and click on "App passwords"');
        console.error('5. Generate a new app password for "Mail"');
        console.error('6. Copy the 16-character password (remove spaces)');
        console.error('7. Update GMAIL_API_KEY in Replit Secrets with this App Password');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
      
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.response) {
        console.error('Error response:', error.response);
      }
      
      console.warn('⚠️ Email service disabled - Reports will be downloadable but not emailed');
      // Fallback to console logging if email service fails
      this.transporter = null;
    }
  }

  async sendReportEmail(userEmail: string, pdfBuffer: Buffer, registration: string): Promise<boolean> {
    console.log('📨 Attempting to send report email to:', userEmail);
    console.log('📄 PDF size:', pdfBuffer.length, 'bytes');
    console.log('🚗 Registration:', registration);
    
    try {
      if (!this.transporter) {
        console.warn('⚠️ Email transporter not available - email service may have failed to initialize');
        console.warn('Would have sent report for', registration, 'to:', userEmail);
        return false;
      }

      const currentYear = new Date().getFullYear();
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `HG-Verified-Report-${registration}-${currentDate}.pdf`;

      const emailOptions: EmailOptions = {
        to: userEmail,
        subject: `Your vehicle report is ready - ${registration}`,
        html: this.getEmailTemplate(registration, currentYear),
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const mailOptions = {
        from: `HG Verified <${this.fromAddress}>`,
        replyTo: this.replyTo,
        to: emailOptions.to,
        subject: emailOptions.subject,
        html: emailOptions.html,
        attachments: emailOptions.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Report email sent successfully to ${userEmail}:`, info.messageId);
      return true;

    } catch (error) {
      console.error('❌ Failed to send report email:', error);
      
      // Retry once on 5xx errors
      if (error && typeof error === 'object' && 'responseCode' in error) {
        const responseCode = (error as any).responseCode;
        if (responseCode >= 500 && responseCode < 600) {
          console.log('🔄 Retrying email send after 5xx error...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          
          try {
            if (this.transporter) {
              const info = await this.transporter.sendMail({
                from: `HG Verified <${this.fromAddress}>`,
                replyTo: this.replyTo,
                to: userEmail,
                subject: `Your vehicle report is ready - ${registration}`,
                html: this.getEmailTemplate(registration, new Date().getFullYear()),
                attachments: [
                  {
                    filename: `HG-Verified-Report-${registration}-${new Date().toISOString().split('T')[0]}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                  }
                ]
              });
              console.log(`✅ Report email sent successfully on retry:`, info.messageId);
              return true;
            }
          } catch (retryError) {
            console.error('❌ Retry failed:', retryError);
          }
        }
      }
      
      return false;
    }
  }

  private getEmailTemplate(registration: string, year: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #6B46C1 0%, #7C3AED 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 0 0 12px 12px;
            }
            h1 {
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .registration {
              display: inline-block;
              background: rgba(255, 255, 255, 0.2);
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: bold;
              font-size: 18px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .footer a {
              color: #6B46C1;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Your vehicle report is ready</h1>
            <div class="registration">${registration}</div>
          </div>
          <div class="content">
            <p>Thank you for using HG Verified Vehicle Check.</p>
            <p>Please find your comprehensive vehicle history report attached to this email as a PDF document.</p>
            <p>The report includes:</p>
            <ul>
              <li>Complete vehicle identification and specifications</li>
              <li>MOT history and test results</li>
              <li>Tax and insurance information</li>
              <li>Security and finance checks</li>
              <li>Valuation and market data</li>
            </ul>
            <p>If you have any questions about your report, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for using our service.</p>
            <p>
              <strong>HG Verified</strong> • 
              <a href="mailto:support@hgverified.com">support@hgverified.com</a> • 
              © ${year} HG Verified. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();