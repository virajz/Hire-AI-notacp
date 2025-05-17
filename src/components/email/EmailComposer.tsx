
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { CandidateProps } from "../candidates/CandidateCard";
import { generateEmailTemplate } from "@/utils/emailUtils";

interface EmailComposerProps {
  candidate: Omit<CandidateProps, 'onView' | 'onShortlist' | 'onStatusChange' | 'onEmail'>;
  onBack: () => void;
  onSend: () => void;
}

const EmailComposer = ({ candidate, onBack, onSend }: EmailComposerProps) => {
  const [emailTemplate, setEmailTemplate] = useState("software-engineer");
  const [email, setEmail] = useState(generateEmailTemplate(candidate, emailTemplate));
  const [subject, setSubject] = useState(`Opportunity for ${candidate.name} at TechCo`);
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplate = e.target.value;
    setEmailTemplate(newTemplate);
    setEmail(generateEmailTemplate(candidate, newTemplate));
  };

  const handleSend = () => {
    setSending(true);
    
    // Simulate sending the email
    setTimeout(() => {
      setSending(false);
      onSend();
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="pl-0" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to profile
      </Button>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
            Email Template
          </label>
          <select
            id="template"
            className="w-full rounded-md border border-input py-2 px-3"
            value={emailTemplate}
            onChange={handleTemplateChange}
          >
            <option value="software-engineer">Software Engineer</option>
            <option value="product-manager">Product Manager</option>
            <option value="data-scientist">Data Scientist</option>
            <option value="designer">Designer</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="email-body" className="block text-sm font-medium text-gray-700 mb-1">
            Email Body
          </label>
          <Textarea
            id="email-body"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            rows={12}
            className="w-full font-mono text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" className="mr-2" onClick={onBack}>
          Cancel
        </Button>
        <Button 
          onClick={handleSend} 
          disabled={sending}
          className="bg-highlight hover:bg-highlight/90 text-white"
        >
          {sending ? (
            <>
              <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Send Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailComposer;
