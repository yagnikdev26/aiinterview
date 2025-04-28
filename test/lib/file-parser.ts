
import pdfParse from "pdf-parse"; // Import pdf-parse

export async function parseCV(file: File): Promise<string> {
  try {


    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(arrayBuffer); 

    const data= await pdfParse(nodeBuffer)
    const cleanedText = cleanExtractedText(data.text);

    return cleanedText;

    } 
   
     else {
      throw new Error("Unsupported file type");
    }
  } catch (error) {
    console.error("Error parsing file:", error);
    throw error;
  }
}


function cleanExtractedText(rawText: string): string {
  return rawText
    .replace(/\n{2,}/g, '\n')        
    .replace(/([^\n])\n([^\n])/g, '$1 $2') 
    .replace(/\s{2,}/g, ' ')          
    .trim();                         
}
