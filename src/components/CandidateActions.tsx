import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { sendOutreachEmail, generateEmailTemplate } from '../utils/emailService';
import { exportToCSV } from '../utils/exportService';
import { toast } from 'sonner';

interface CandidateActionsProps {
  candidates: Array<{
    id: string;
    name: string;
    current_title: string;
    location: string;
    work_auth: string;
    years_exp: number;
    status?: string;
    shortlisted?: boolean;
  }>;
  selectedCandidate?: {
    id: string;
    name: string;
    email: string;
  };
  roleTitle: string;
  companyName: string;
}

export const CandidateActions: React.FC<CandidateActionsProps> = ({
  candidates,
  selectedCandidate,
  roleTitle,
  companyName,
}) => {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!selectedCandidate) return;

    setIsSending(true);
    try {
      const template = generateEmailTemplate(
        selectedCandidate.name,
        roleTitle,
        companyName
      );

      const result = await sendOutreachEmail({
        to: selectedCandidate.email,
        template,
        candidateName: selectedCandidate.name,
        roleTitle,
        companyName,
      });

      if (result.success) {
        toast.success('Email sent successfully!');
        setIsEmailDialogOpen(false);
      } else {
        toast.error('Failed to send email. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred while sending the email.');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(candidates);
      toast.success('CSV exported successfully!');
    } catch (error) {
      toast.error('Failed to export CSV. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="flex gap-4">
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={!selectedCandidate}
          >
            Send Email
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Outreach Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>To</Label>
              <Input
                value={selectedCandidate?.email || ''}
                disabled
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={`Interested in ${roleTitle} at ${companyName}`}
                disabled
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Enter your message..."
                rows={6}
              />
            </div>
            <Button
              onClick={handleSendEmail}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant="outline"
        onClick={handleExportCSV}
      >
        Export CSV
      </Button>
    </div>
  );
}; 