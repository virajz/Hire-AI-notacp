import { Resend } from 'resend';

// Initialize Resend with API key
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

interface EmailTemplate {
  subject: string;
  body: string;
}

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  candidateName: string;
  roleTitle: string;
  companyName: string;
}

export const sendOutreachEmail = async ({
  to,
  template,
  candidateName,
  roleTitle,
  companyName,
}: SendEmailParams) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HireAI <onboarding@hireai.io>',
      to: [to],
      subject: template.subject,
      html: template.body,
      text: template.body.replace(/<[^>]*>/g, ''), // Strip HTML tags for plain text version
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const generateEmailTemplate = (
  candidateName: string,
  roleTitle: string,
  companyName: string
): EmailTemplate => {
  return {
    subject: `Interested in ${roleTitle} at ${companyName}`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hi ${candidateName},</p>
        <p>I hope this message finds you well. I came across your profile and was particularly impressed by your experience.</p>
        <p>We're currently looking for a ${roleTitle} at ${companyName}, and I believe your background could be a great fit for this role.</p>
        <p>Would you be open to a brief conversation about this opportunity?</p>
        <p>Best regards,<br/>The ${companyName} Team</p>
      </div>
    `,
  };
}; 