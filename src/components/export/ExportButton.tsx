
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { mockCandidates } from '@/data/mockData';
import { toast } from 'sonner';

const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    // Convert candidates to CSV format
    const headers = ['Name', 'Title', 'Location', 'Work Auth', 'Experience', 'Skills', 'Status'];
    
    const rows = mockCandidates.map(candidate => {
      return [
        candidate.name,
        candidate.currentTitle,
        candidate.location,
        candidate.workAuth || 'N/A',
        `${candidate.yearsExp} years`,
        candidate.skills.join(', '),
        candidate.status
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a CSV file and trigger download
    setTimeout(() => {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'candidates.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setIsExporting(false);
      toast.success('Candidates exported to CSV');
    }, 1000);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2"></div>
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </>
      )}
    </Button>
  );
};

export default ExportButton;
