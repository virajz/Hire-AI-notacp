import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Star, Mail, ChevronDown, Check } from 'lucide-react';

export interface CandidateProps {
  id: string;
  name: string;
  currentTitle: string;
  location: string;
  workAuth: string;
  yearsExp: number;
  skills: string[];
  shortlisted: boolean;
  status: 'new' | 'contacted' | 'interested' | 'interviewing';
  onView: (id: string) => void;
  onShortlist: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onEmail: (id: string) => void;
}

const CandidateCard = ({
  id,
  name,
  currentTitle,
  location,
  workAuth,
  yearsExp,
  skills,
  shortlisted,
  status,
  onView,
  onShortlist,
  onStatusChange,
  onEmail,
}: CandidateProps) => {
  const [isShortlisted, setIsShortlisted] = useState(shortlisted);

  const handleShortlist = () => {
    setIsShortlisted(!isShortlisted);
    onShortlist(id);
  };

  const statusColors = {
    new: 'bg-gray-100 text-gray-800',
    contacted: 'bg-blue-100 text-blue-800',
    interested: 'bg-green-100 text-green-800',
    interviewing: 'bg-purple-100 text-purple-800',
  };

  return (
    <Card className="candidate-card p-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{name}</h3>
            <p className="text-muted-foreground">{currentTitle}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isShortlisted ? 'text-yellow-500' : 'text-muted-foreground'}`}
            onClick={handleShortlist}
          >
            <Star className="h-5 w-5" fill={isShortlisted ? 'currentColor' : 'none'} />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {location}
          </Badge>
          {workAuth && (
            <Badge variant="outline" className="text-xs">
              {workAuth}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {yearsExp}+ years
          </Badge>
        </div>

        <div className="mt-3">
          <div className="flex flex-wrap gap-1 mt-1">
            {skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between opacity-100 z-10">
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onView(id)}>
            View
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onEmail(id)}>
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className={statusColors[status]}>
              <span className="capitalize">{status}</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange(id, 'new')} className="gap-2">
              {status === 'new' && <Check className="h-4 w-4" />}
              <span>New</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(id, 'contacted')} className="gap-2">
              {status === 'contacted' && <Check className="h-4 w-4" />}
              <span>Contacted</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(id, 'interested')} className="gap-2">
              {status === 'interested' && <Check className="h-4 w-4" />}
              <span>Interested</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(id, 'interviewing')} className="gap-2">
              {status === 'interviewing' && <Check className="h-4 w-4" />}
              <span>Interviewing</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default CandidateCard;
