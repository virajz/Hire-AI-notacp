import Papa from 'papaparse';

interface Candidate {
  id: string;
  name: string;
  current_title: string;
  location: string;
  work_auth: string;
  years_exp: number;
  status?: string;
  shortlisted?: boolean;
}

export const exportToCSV = (candidates: Candidate[]) => {
  // Transform the data to include only the fields we want to export
  const exportData = candidates.map(candidate => ({
    Name: candidate.name,
    'Current Title': candidate.current_title,
    Location: candidate.location,
    'Work Authorization': candidate.work_auth,
    'Years Experience': candidate.years_exp,
    Status: candidate.status || 'New',
    Shortlisted: candidate.shortlisted ? 'Yes' : 'No'
  }));

  // Convert to CSV
  const csv = Papa.unparse(exportData);

  // Create a blob and download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  // Set up the download
  link.setAttribute('href', url);
  link.setAttribute('download', `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 