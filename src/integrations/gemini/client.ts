import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { GEMINI_API_KEY } from '@/config/environment';

const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

const fileToGenerativePart = async (file: File): Promise<Part> => {
  if (file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1];
          if (!base64Data) {
            reject(new Error('Failed to extract base64 data from file.'));
            return;
          }
          resolve({
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          });
        } else {
          reject(new Error('Failed to read file as base64 string.'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  } else if (file.type === 'text/plain') {
    const text = await file.text();
    return { text };
  }
  throw new Error(`Unsupported file type provided to fileToGenerativePart: ${file.type}`);
};

export const parseResumeText = async (file: File): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const generativePart = await fileToGenerativePart(file);
  
  let requestContentsConfig: { parts: Part[] };
  let systemPromptText: string;

  if (file.type.startsWith('image/')) {
    systemPromptText = "You are an expert resume parser. Extract all text content from the following resume image. Present the text clearly and accurately. Maintain the original structure, sections, and line breaks as much as possible. Output only the extracted text.";
    requestContentsConfig = { parts: [{ text: systemPromptText }, generativePart] };
  } else if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    systemPromptText = `You are an expert resume parser. Extract all text content from the following resume document (${file.name}). Present the text clearly and accurately. Maintain the original structure, sections, and line breaks as much as possible. Output only the extracted text.`;
    requestContentsConfig = { parts: [{ text: systemPromptText }, generativePart] };
  } else if (file.type === 'text/plain') {
    systemPromptText = `You are an expert resume parser. The following is text from a resume. Process it and present it as clean, raw text, preserving its structure, sections, and formatting (like paragraphs and line breaks) as much as possible. Output only the extracted text.\n\nResume Text:\n${(generativePart as {text: string}).text}`;
    requestContentsConfig = { parts: [{ text: systemPromptText }] };
  } else {
    throw new Error(`Invalid file type for parsing: ${file.type}`);
  }
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [requestContentsConfig],
    });

    const text = response.text;
    if (text) {
      return text.trim();
    } else {
      throw new Error("No text content found in the API response.");
    }
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
            throw new Error("Invalid Gemini API Key. Please check your configuration.");
        }
    }
    throw new Error(`Error processing resume with Gemini API: ${error instanceof Error ? error.message : String(error)}`);
  }
};
