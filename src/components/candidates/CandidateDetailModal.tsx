import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Star, X } from 'lucide-react';
import { CandidateProps } from './CandidateCard';

interface CandidateDetailModalProps {
  candidate: Omit<CandidateProps, 'onView' | 'onShortlist' | 'onStatusChange' | 'onEmail'> | null;
  isOpen: boolean;
  onClose: () => void;
  onShortlist: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onEmail: (id: string) => void;
}

const CandidateDetailModal = ({
  candidate,
  isOpen,
  onClose,
  onShortlist,
  onStatusChange,
  onEmail,
}: CandidateDetailModalProps) => {
  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-semibold">{candidate.name}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-medium text-muted-foreground">{candidate.currentTitle}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{candidate.location}</Badge>
                {candidate.workAuth && (
                  <Badge variant="outline">{candidate.workAuth}</Badge>
                )}
                <Badge variant="outline">{candidate.yearsExp}+ years</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${candidate.shortlisted ? 'text-yellow-500' : 'text-muted-foreground'}`}
              onClick={() => onShortlist(candidate.id)}
            >
              <Star className="h-5 w-5" fill={candidate.shortlisted ? 'currentColor' : 'none'} />
            </Button>
          </div>

          {/* Skills Section */}
          <div>
            <h4 className="text-sm font-medium mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button onClick={() => onEmail(candidate.id)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button
              variant="outline"
              onClick={() => onStatusChange(candidate.id, candidate.status)}
            >
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateDetailModal; 