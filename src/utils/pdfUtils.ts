import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Set the worker source to use unpkg CDN (more reliable than cdnjs for this case)
// GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

/**
 * Extract text from a PDF file
 * @param file The PDF file to extract text from
 * @returns The extracted text
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    // Convert the File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    
    // Initialize text variable
    let text = '';
    
    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      text += pageText + '\n';
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}; 
