"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatInterface } from "@/components/chat-interface"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

interface InterviewData {
  jobDescription: string
  cvContent: string
  cvFileName: string
  questions: string[]
  timestamp: string
}

export default function InterviewPage() {
  const router = useRouter()
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {

    const storedData = localStorage.getItem("interviewData")
    if (!storedData) {
      router.push("/setup")
      return
    }

    try {
      const parsedData = JSON.parse(storedData) as InterviewData

      if (!parsedData.questions || parsedData.questions.length === 0) {
        throw new Error("No interview questions found. Please go back and try again.")
      }

      setInterviewData(parsedData)
    } catch (error) {
      console.error("Error loading interview data:", error)
      setError(error instanceof Error ? error.message : "Failed to load interview data")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleInterviewComplete = async (messages: any[], responseTimes: Record<number, number>) => {
    if (!interviewData) return

    setInterviewComplete(true)

    try {
      const response = await fetch("/api/analyze-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          responseTimes,
          jobDescription: interviewData.jobDescription,
          cvContent: interviewData.cvContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze interview")
      }

      const data = await response.json()

      
      localStorage.setItem("interviewResults", JSON.stringify(data.results))

     
      router.push("/results")
    } catch (error) {
      console.error("Error analyzing interview:", error)
      setError(error instanceof Error ? error.message : "Failed to analyze interview. Please try again.")
      setInterviewComplete(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className=" max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading Interview</CardTitle>
              <CardDescription>Loading your personalized interview questions...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-10">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">This may take a moment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>There was a problem with your interview</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Link href="/setup" className="w-full">
                <Button className="w-full">Go Back to Setup</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className=" mx-auto">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>AI Interview Session</CardTitle>
            <CardDescription>
              {interviewComplete
                ? "Interview complete! Analyzing responses..."
                : "Answer the questions naturally. Your responses and timing are being evaluated."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interviewComplete ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Generating your interview results...</p>
              </div>
            ) : (
              interviewData && (
                <ChatInterface questions={interviewData.questions} onComplete={handleInterviewComplete} />
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
