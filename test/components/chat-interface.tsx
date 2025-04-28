"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, User, Code, FileQuestion, BookOpen, Users, Play, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import Dictaphone from "./dictaphone"
import { useSpeechRecognition } from "react-speech-recognition"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Editor from "./Editor"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  questionType?: "coding" | "technical" | "experience" | "soft_skills"
  codeSubmission?: {
    code: string;
    language: string;
    output?: string;
  }
}

interface ChatInterfaceProps {
  questions: string[]
  onComplete: (messages: Message[], responseTimes: Record<number, number>) => void
}

// Supported languages for the code editor
const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "rust", label: "Rust" },
  { value: "kotlin", label: "Kotlin" },
];

export function ChatInterface({ questions, onComplete }: ChatInterfaceProps) {
  const {
    transcript, listening, resetTranscript,
  } = useSpeechRecognition();
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null)
  const [responseTimes, setResponseTimes] = useState<Record<number, number>>({})
  
  const [code, setCode] = useState('');
    const [codeInput, setCodeInput] = useState("")
  const [codeLanguage, setCodeLanguage] = useState("javascript")
  const [codeOutput, setCodeOutput] = useState<string | null>(null)
  const [isRunningCode, setIsRunningCode] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)

  const getQuestionType = (questionText: string): "coding" | "technical" | "experience" | "soft_skills" => {
    const text = questionText.toLowerCase();
    
    if (text.includes("[coding]")) return "coding";
    if (text.includes("[technical]")) return "technical";
    if (text.includes("[experience]")) return "experience";
    if (text.includes("[soft_skills]")) return "soft_skills";
    
    if (
      text.includes("write a function") ||
      text.includes("implement") ||
      text.includes("code") ||
      text.includes("algorithm") ||
      text.includes("programming") ||
      text.includes("write code") ||
      text.includes("solve this problem")
    ) {
      return "coding";
    }
    
    if (
      text.includes("explain") ||
      text.includes("difference between") ||
      text.includes("how does") ||
      text.includes("what is") ||
      text.includes("describe")
    ) {
      return "technical";
    }
    
    if (
      text.includes("tell me about a time") ||
      text.includes("previous experience") ||
      text.includes("project") ||
      text.includes("worked on") ||
      text.includes("your role")
    ) {
      return "experience";
    }
    
    return "soft_skills";
  }

  useEffect(() => {
    if (questions.length > 0 && messages.length === 0) {
      const firstQuestion = questions[0];
      const questionType = getQuestionType(firstQuestion);
      
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Welcome to your AI interview. I'll be asking you a series of questions based on the job description and your CV. Please answer each question as thoroughly as possible.",
          timestamp: Date.now(),
        },
        {
          id: `q-${0}`,
          role: "assistant",
          content: firstQuestion,
          timestamp: Date.now(),
          questionType
        },
      ])
      setResponseStartTime(Date.now())
    }
  }, [questions, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  useEffect(() => {
    if (!isTyping) {
      const currentMessage = messages.find(m => m.id === `q-${currentQuestion}`);
      if (currentMessage?.questionType === "coding" && codeEditorRef.current) {
        codeEditorRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isTyping, currentQuestion, messages])

  const runCode = async (code: string, language: string): Promise<string> => {
    setIsRunningCode(true);
  
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
  
      if (language === "javascript" || language === "typescript") {
        const execute = new Function(`
          try {
            return (function() { 
              ${code}
              if (typeof main === 'function') {
                return main();
              }
              ${code.includes('return') ? '' : 'return "Code executed successfully";'}
            })();
          } catch (error) {
            return "Error: " + error.message;
          }
        `);
  
        const result = execute();
        return typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
      } else {
       
        return `[Simulated ${language.toUpperCase()} Execution]\n\nCode appears to compile successfully.\nOutput would display here after execution.`;
      }
    } catch (error) {
      return `Error executing code: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      setIsRunningCode(false);
    }
  };
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("User switched tab or minimized");
      } else if (document.visibilityState === "visible") {
        console.log("User is back on the tab");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  

  const handleRunCode = async () => {
    if (!codeInput.trim()) return;
    
    const output = await runCode(codeInput, codeLanguage);
    setCodeOutput(output);
  };

  const handleSendMessage = async () => {
    if ((input.trim() === "" && codeInput.trim() === "") || isTyping) return;
    
    if (responseStartTime) {
      const responseTime = Date.now() - responseStartTime;
      setResponseTimes((prev) => ({
        ...prev,
        [currentQuestion]: responseTime,
      }));
    }
    
    const currentMsg = messages.find(m => m.id === `q-${currentQuestion}`);
    const isCodingQuestion = currentMsg?.questionType === "coding";
    
    let finalContent = input.trim();
    let codeSubmission = undefined;
    
    if (isCodingQuestion && codeInput.trim()) {
      codeSubmission = {
        code: codeInput,
        language: codeLanguage,
        output: codeOutput || undefined
      };
      
      if (finalContent) {
        finalContent += "\n\n";
      }
      finalContent += `\`\`\`${codeLanguage}\n${codeInput}\n\`\`\``;
      
      if (codeOutput) {
        finalContent += `\n\nOutput:\n\`\`\`\n${codeOutput}\n\`\`\``;
      }
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: finalContent,
      timestamp: Date.now(),
      codeSubmission
    };

    setMessages((prev) => [...prev, userMessage]);
    resetTranscript();
    setInput("");
    setCodeInput("");
    setCodeOutput(null);
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if we have more questions
    if (currentQuestion < questions.length - 1) {
      const nextQuestionIndex = currentQuestion + 1;
      const nextQuestion = questions[nextQuestionIndex];
      const questionType = getQuestionType(nextQuestion);

      const assistantMessage: Message = {
        id: `q-${nextQuestionIndex}`,
        role: "assistant",
        content: nextQuestion,
        timestamp: Date.now(),
        questionType
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentQuestion(nextQuestionIndex);
      setResponseStartTime(Date.now());
    } else {
      const finalMessage: Message = {
        id: "final",
        role: "assistant",
        content: "Thank you for completing the interview. I'll now analyze your responses and provide feedback.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, finalMessage]);

      // Include the last user message in the complete messages array
      const allMessages = [...messages, userMessage, finalMessage];
      onComplete(allMessages, responseTimes);
    }

    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't auto-submit when in code editor
    const currentMsg = messages.find(m => m.id === `q-${currentQuestion}`);
    if (currentMsg?.questionType === "coding" && e.target === codeEditorRef.current) {
      return; // Allow normal typing in code editor
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  useEffect(() => {
    if (listening) {
      setInput((prev) => {
        
        if (!transcript.startsWith(prev)) {
          return transcript; 
        }
        return transcript;
      });
    }
  }, [transcript, listening]);

  const getQuestionIcon = (type?: "coding" | "technical" | "experience" | "soft_skills") => {
    switch (type) {
      case "coding":
        return <Code className="h-4 w-4" />;
      case "technical":
        return <FileQuestion className="h-4 w-4" />;
      case "experience":
        return <BookOpen className="h-4 w-4" />;
      case "soft_skills":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Function to get question type badge
  const getQuestionTypeBadge = (type?: "coding" | "technical" | "experience" | "soft_skills") => {
    if (!type) return null;
    
    const badgeClasses = {
      coding: "bg-red-100 text-red-800",
      technical: "bg-blue-100 text-blue-800",
      experience: "bg-green-100 text-green-800",
      soft_skills: "bg-purple-100 text-purple-800"
    };
    
    const badgeText = {
      coding: "Coding",
      technical: "Technical",
      experience: "Experience",
      soft_skills: "Soft Skills"
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badgeClasses[type]} ml-2`}>
        {badgeText[type]}
      </span>
    );
  };

  const formatQuestionText = (text: string): string => {
    return text
      .replace(/\[coding\]/i, '')
      .replace(/\[technical\]/i, '')
      .replace(/\[experience\]/i, '')
      .replace(/\[soft_skills\]/i, '')
      .trim();
  };

  return (
   <div className="flex gap-3">
     <div className="flex flex-col h-[80%] w-[50%]">
      <Card className="flex-1 p-4 mb-2">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3",
                message.role === "assistant" ? "bg-muted" : "bg-primary/10",
              )}
            >
              {message.role === "assistant" ? (
                <Avatar>
                  <AvatarFallback>
                    {message.questionType ? getQuestionIcon(message.questionType) : "AI"}
                  </AvatarFallback>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium flex items-center">
                  {message.role === "assistant" ? "AI Interviewer" : "You"}
                  {message.questionType && message.role === "assistant" && 
                    getQuestionTypeBadge(message.questionType)}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {message.role === "assistant" && message.questionType
                    ? formatQuestionText(message.content).split(`"question":`) 
                    : message.content}
                </div>
                
                {/* Display code submission for user messages with code */}
                {message.role === "user" && message.codeSubmission && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between bg-gray-800 text-gray-200 rounded-t-md p-2">
                      <div className="text-xs font-mono">{message.codeSubmission.language}</div>
                      <div className="flex items-center">
                        <div className="bg-green-500 text-white px-2 py-0.5 text-xs rounded-full">Submitted</div>
                      </div>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-3 font-mono text-xs overflow-x-auto">
                      <pre>{message.codeSubmission.code}</pre>
                    </div>
                    {message.codeSubmission.output && (
                      <div>
                        <div className="bg-gray-700 text-gray-200 p-1 text-xs">Output</div>
                        <div className="bg-gray-800 text-gray-100 p-2 font-mono text-xs overflow-x-auto max-h-[200px]">
                          <pre>{message.codeSubmission.output}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </Card>
      <div className="flex flex-col gap-2"> 
        <div className="flex items-center gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              messages.find(m => m.id === `q-${currentQuestion}`)?.questionType === "coding"
                ? "Add any explanation or notes about your code here..."
                : "Type your response..."
            }
            className="min-h-[80px] h-[120px] flex-1"
            disabled={isTyping}
          />
          <div className="flex flex-col items-center gap-2">
            <Dictaphone/>
            <Button
              onClick={handleSendMessage}
              size="icon"
              className="h-10 w-12"
              disabled={(input.trim() === "" && codeInput.trim() === "") || isTyping}
            >
              {codeInput?"Submit":<Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div className="w-[50%]">
    {messages.find(m => m.id === `q-${currentQuestion}`)?.questionType === "coding" && (
  <div className="border rounded-md border-gray-300 dark:border-gray-600">
    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 border-b border-gray-300 dark:border-gray-600">
      <div className="flex items-center gap-2">
        <Code className="w-4 h-4" />
        <span className="text-sm font-medium">Code Editor</span>
      </div>
      <div className="flex items-center gap-2">
        <Select value={codeLanguage} onValueChange={setCodeLanguage}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map(lang => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-8 gap-1"
          onClick={handleRunCode}
          disabled={!codeInput.trim() || isRunningCode}
        >
          <Play className="w-3 h-3" /> 
          {isRunningCode ? 'Running...' : 'Run'}
        </Button>
      </div>
    </div>
    
    <Textarea
      ref={codeEditorRef}
      value={codeInput}
      onChange={(e) => setCodeInput(e.target.value)}
      className="min-h-[350px] font-mono text-sm p-2 rounded-none border-0 focus:ring-0"
      placeholder="// Write your code here..."
    />
    
    {codeOutput !== null && (
      <div>
        <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs border-t border-gray-300 dark:border-gray-600">
          Output
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-2 font-mono text-xs overflow-x-auto max-h-[150px] border-t border-gray-300 dark:border-gray-600">
          <pre>{codeOutput}</pre>
        </div>
      </div>
    )}
  </div>
)}
    </div>
   </div>
  )
}




