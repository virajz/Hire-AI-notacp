import React, { useState } from 'react';
import { Button } from './ui/button';
import { sendOutreachEmail, generateEmailTemplate } from '../utils/emailService';
import { toast } from 'sonner';

export const EmailTest: React.FC = () => {
  const [isSending, setIsSending] = useState(false);

  const handleTestEmail = async () => {
    setIsSending(true);
    try {
      const template = generateEmailTemplate(
        'Test User',
        'Software Engineer',
        'HireAI'
      );

      const result = await sendOutreachEmail({
        to: 'your-test-email@example.com', // Replace with your email for testing
        template,
        candidateName: 'Test User',
        roleTitle: 'Software Engineer',
        companyName: 'HireAI',
      });

      if (result.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error('Failed to send test email. Please check the console for details.');
        console.error('Email error:', result.error);
      }
    } catch (error) {
      toast.error('An error occurred while sending the test email.');
      console.error('Test email error:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Email Service Test</h2>
      <Button
        onClick={handleTestEmail}
        disabled={isSending}
        variant="outline"
      >
        {isSending ? 'Sending Test Email...' : 'Send Test Email'}
      </Button>
    </div>
  );
}; 