import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateInterviewQuestions(jobDescription: string, cvContent: string): Promise<string[]> {
  try {
    const prompt = `
    You are an expert AI technical interviewer. Based on the following job description and candidate CV, 
    generate 3 relevant interview questions that will help assess the candidate's fit for the role.
    
    The questions should cover:
    - Technical and coding skills (at least 4 coding-specific questions)
    - Relevant experience
    - Problem-solving abilities 
    - System design (if applicable)
    - Soft skills and team collaboration
    
    Ensure the coding questions are specific and challenging based on the technologies mentioned in the job description and CV.
    
    Job Description:
    ${jobDescription}
    
    Candidate CV:
    ${cvContent}
    
    Return the questions as a JSON array of objects, where each object has the following structure:
    {
      "question": "The interview question text",
      "type": "coding" | "technical" | "experience" | "soft_skills"
    }
    
    Make sure to properly classify each question as either "coding" (requires writing code), "technical" (knowledge-based), "experience" (about past work), or "soft_skills" (behavioral or team-related).
    `

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7
    })

    try {
      const parsedResult = JSON.parse(text)
      if (Array.isArray(parsedResult)) {
        
        if (parsedResult.length > 0 && typeof parsedResult[0] === 'object' && parsedResult[0].question) {
          return parsedResult.map(item => `[${item.type}] ${item.question}`);
        } else {
          return parsedResult; 
        }
      } else {
        return extractQuestionsFromText(text)
      }
    } catch (error) {
      return extractQuestionsFromText(text)
    }
  } catch (error) {
    console.error("Error generating questions:", error)
    throw error
  }
}

export async function analyzeInterview(
  messages: any[],
  responseTimes: Record<number, number>,
  jobDescription: string,
  cvContent: string,
): Promise<any> {
  try {
    
    const transcript = extractTranscript(messages, responseTimes)
    const stringTranscript=JSON.stringify(transcript)
    const stringResponseItem=JSON.stringify(responseTimes)
    
    
    const codingQuestions = transcript.filter(item => 
      item.question.toLowerCase().includes("[coding]") || 
      item.question.toLowerCase().includes("write a function") ||
      item.question.toLowerCase().includes("implement") ||
      item.question.toLowerCase().includes("code") ||
      item.question.toLowerCase().includes("algorithm") ||
      item.question.toLowerCase().includes("programming")
    );
    const prompt = `
    You are an expert AI technical interviewer and evaluator. Analyze the following interview transcript 
    and provide a comprehensive evaluation of the candidate's performance.Check each answer strictly
    
    Job Description:
    ${jobDescription}
    
    Candidate CV:
    ${cvContent}
    
    Interview Transcript:
    ${stringTranscript}
    
    Response Times (in milliseconds):
   ${stringResponseItem}
    
    Number of coding questions: ${codingQuestions.length}
    
    Provide an evaluation with the following structure:
    1. Overall score (0-100)
    2. Scores for categories: Technical Acumen, Coding Proficiency, Communication Skills, Responsiveness & Agility, Problem-Solving & Adaptability, Cultural Fit & Soft Skills
    3. A summary of the candidate's performance
    4. Key strengths (list)
    5. Areas for improvement (list)
    
    Return your evaluation as a JSON object with the following structure:
    {
      "overallScore": number,
      "categories": {
        "technicalAcumen": number,
        "codingProficiency": number,
        "communicationSkills": number,
        "responsivenessAgility": number,
        "problemSolvingAdaptability": number,
        "culturalFitSoftSkills": number
      },
      "responseTimes": {
        "average": number,
        "fastest": number,
        "slowest": number
      },
      "summary": string,
      "strengths": string[],
      "improvements": string[]
    }
    `

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature:0.9
      
    })
    const replacedText = text.replace(/```json|```/g, '');
    const modifiedText = replacedText.replace(/(?<![{\[,])\n(?![\]}])/g, ' ');
  
    const trimmedText= modifiedText.trim();
    try {
      const results = JSON.parse(trimmedText)
      
      const times = Object.values(responseTimes)
      if (!results.responseTimes || Object.keys(results.responseTimes).length === 0) {
        results.responseTimes = {
          average: times.reduce((sum: number, time: number) => sum + time, 0) / times.length,
          fastest: Math.min(...times),
          slowest: Math.max(...times),
        }
      }
      
     
      results.transcript = transcript
      
      return results
    } catch (error) {
      console.error("Error parsing AI response:", error)
      
      
      const extractedAnalysis = extractAnalysisFromText(text)
      if (extractedAnalysis) {
        return {
          ...extractedAnalysis,
          transcript
        }
      }
      
      
      throw new Error("Failed to parse interview analysis and could not extract structured data")
    }
  } catch (error) {
    console.error("Error analyzing interview:", error)
    throw error
  }
}

function extractQuestionsFromText(text: string): string[] {
 
  const numberedQuestionRegex = /\d+[.)]\s*(.+?)(?=\n\d+[.)]|\n*$)/g;
  const matches = [];
  let match;
  
  // Manual matching to avoid using 's' flag
  const modifiedText = text.replace(/\n/g, ' \n ');
  while ((match = numberedQuestionRegex.exec(modifiedText)) !== null) {
    matches.push(match);
  }
  
  if (matches.length > 0) {
    return matches.map((match) => match[1].trim())
  }
  
  // If no numbered questions found, look for lines that appear to be questions
  const lines = text.split("\n").map((line) => line.trim())
  return lines.filter(
    (line) =>
      line.length > 20 && 
      (line.endsWith("?") || line.includes("?")) &&
      !line.startsWith("{") &&
      !line.startsWith("[") && 
      !line.startsWith("```")
  )
}

function extractTranscript(messages: any[], responseTimes: Record<number, number>) {
  const transcript = []
  let currentQuestion = ""

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]

    if (message.role === "assistant" && message.id !== "welcome" && message.id !== "final") {
      currentQuestion = message.content
    } else if (message.role=== "user" && currentQuestion) {
      const questionIndex = Number.parseInt(messages[i - 1]?.id?.split("-")[1] || "0")
      transcript.push({
        question: currentQuestion,
        answer: message.content,
        responseTime: responseTimes[questionIndex] || 0, 
        type: identifyQuestionType(currentQuestion)
      })
      currentQuestion = ""
    }
  }

  return transcript
}
function identifyQuestionType(question: string): string {
  const questionLower = question.toLowerCase();
  if (questionLower.includes("[coding]")) return "coding";
  if (questionLower.includes("[technical]")) return "technical";
  if (questionLower.includes("[experience]")) return "experience";
  if (questionLower.includes("[soft_skills]")) return "soft_skills";
  if (
    questionLower.includes("write a function") ||
    questionLower.includes("implement") ||
    questionLower.includes("code") ||
    questionLower.includes("algorithm") ||
    questionLower.includes("programming") ||
    questionLower.includes("write code") ||
    questionLower.includes("solve this problem")
  ) {
    return "coding";
  }
  
  if (
    questionLower.includes("explain") ||
    questionLower.includes("difference between") ||
    questionLower.includes("how does") ||
    questionLower.includes("what is") ||
    questionLower.includes("describe")
  ) {
    return "technical";
  }
  
  if (
    questionLower.includes("tell me about a time") ||
    questionLower.includes("previous experience") ||
    questionLower.includes("project") ||
    questionLower.includes("worked on") ||
    questionLower.includes("your role")
  ) {
    return "experience";
  }
  
  return "soft_skills";
}

function extractAnalysisFromText(text: string): any | null {
  try {
    // Look for numeric scores (avoiding regex lookbehind/lookahead for compatibility)
    const overallScoreMatch = text.match(/overall\s+score:?\s*(\d+)/i)
    const technicalMatch = text.match(/technical\s+acumen:?\s*(\d+)/i)
    const codingMatch = text.match(/coding\s+proficiency:?\s*(\d+)/i)
    const communicationMatch = text.match(/communication\s+skills:?\s*(\d+)/i)
    const responsivenessMatch = text.match(/responsiveness:?\s*(\d+)/i)
    const problemSolvingMatch = text.match(/problem.?solving:?\s*(\d+)/i)
    const culturalFitMatch = text.match(/cultural\s+fit:?\s*(\d+)/i)
    
    // Extract summary using simpler regex approach
    let summary = "";
    const summaryHeaderIndex = text.toLowerCase().indexOf("summary:");
    if (summaryHeaderIndex >= 0) {
      const nextHeaderIndex = text.toLowerCase().substring(summaryHeaderIndex + 8).search(/(strengths|key\s+strengths|improvements|areas\s+for\s+improvement):/i);
      if (nextHeaderIndex >= 0) {
        summary = text.substring(
          summaryHeaderIndex + 8, 
          summaryHeaderIndex + 8 + nextHeaderIndex
        ).trim();
      } else {
        summary = text.substring(summaryHeaderIndex + 8).trim();
      }
    }
    
    const strengths: string[] = [];
    const strengthsHeaderIndex = text.toLowerCase().search(/(strengths|key\s+strengths):/i);
    if (strengthsHeaderIndex >= 0) {
      const strengthsSection = text.substring(strengthsHeaderIndex);
      const lines = strengthsSection.split('\n');
     
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^[-*•]\s/) || line.match(/^\d+[.)]\s/)) {
         
          strengths.push(line.replace(/^[-*•\d+.)\s]+/, '').trim());
        } else if (line.match(/(improvements|areas\s+for\s+improvement):/i)) {
          // Found the next section
          break;
        }
      }
    }
    
   
    const improvements: string[] = [];
    const improvementsHeaderIndex = text.toLowerCase().search(/(improvements|areas\s+for\s+improvement):/i);
    if (improvementsHeaderIndex >= 0) {
      const improvementsSection = text.substring(improvementsHeaderIndex);
      const lines = improvementsSection.split('\n');
     
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.match(/^[-*•]\s/) || line.match(/^\d+[.)]\s/)) {
          improvements.push(line.replace(/^[-*•\d+.)\s]+/, '').trim());
        }
      }
    }
    
    if (overallScoreMatch) {
      return {
        overallScore: parseInt(overallScoreMatch[1]),
        categories: {
          technicalAcumen: technicalMatch ? parseInt(technicalMatch[1]) : 70,
          codingProficiency: codingMatch ? parseInt(codingMatch[1]) : 70,
          communicationSkills: communicationMatch ? parseInt(communicationMatch[1]) : 70,
          responsivenessAgility: responsivenessMatch ? parseInt(responsivenessMatch[1]) : 70,
          problemSolvingAdaptability: problemSolvingMatch ? parseInt(problemSolvingMatch[1]) : 70,
          culturalFitSoftSkills: culturalFitMatch ? parseInt(culturalFitMatch[1]) : 70
        },
        summary: summary || "Analysis extracted from unstructured text.",
        strengths: strengths.length > 0 ? strengths : ["Technical knowledge", "Communication approach"],
        improvements: improvements.length > 0 ? improvements : ["Could be more specific", "Response timing"]
      }
    }
    return null
  } catch (error) {
    console.error("Error extracting analysis from text:", error)
    return null
  }
}