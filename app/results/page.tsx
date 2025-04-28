"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Download, Home } from "lucide-react"
import Link from "next/link"

interface InterviewResults {
  overallScore: number
  categories: {
    technicalAcumen: number
    communicationSkills: number
    responsivenessAgility: number
    problemSolvingAdaptability: number
    culturalFitSoftSkills: number
  }
  responseTimes: {
    average: number
    fastest: number
    slowest: number
  }
  summary: string
  strengths: string[]
  improvements: string[]
  transcript: {
    question: string
    answer: string
    responseTime: number
  }[]
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<InterviewResults | null>(null)

  useEffect(() => {
   
    const storedResults = localStorage.getItem("interviewResults")
    if (!storedResults) {
      router.push("/setup")
      return
    }

    setResults(JSON.parse(storedResults))
  }, [router])

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading Results</CardTitle>
              <CardDescription>Please wait while we load your interview results...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-10">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const downloadResults = () => {
    const resultsJson = JSON.stringify(results, null, 2)
    const blob = new Blob([resultsJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `interview-results-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
          <Button variant="outline" size="sm" onClick={downloadResults} className="gap-2">
            <Download className="h-4 w-4" />
            Download Results
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Interview Results</span>
              <div className="text-2xl font-bold">{results.overallScore}%</div>
            </CardTitle>
            <CardDescription>Comprehensive evaluation of the candidate's performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Performance Summary</h3>
                <p className="text-muted-foreground mb-4">{results.summary}</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Strengths</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.strengths.map((strength, index) => (
                        <li key={index} className="text-sm">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Areas for Improvement</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm">
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Scoring Categories</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Technical Acumen</span>
                      <span className="text-sm font-medium">{results.categories.technicalAcumen}%</span>
                    </div>
                    <Progress value={results.categories.technicalAcumen} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Communication Skills</span>
                      <span className="text-sm font-medium">{results.categories.communicationSkills}%</span>
                    </div>
                    <Progress value={results.categories.communicationSkills} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Responsiveness & Agility</span>
                      <span className="text-sm font-medium">{results.categories.responsivenessAgility}%</span>
                    </div>
                    <Progress value={results.categories.responsivenessAgility} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Problem-Solving & Adaptability</span>
                      <span className="text-sm font-medium">{results.categories.problemSolvingAdaptability}%</span>
                    </div>
                    <Progress value={results.categories.problemSolvingAdaptability} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cultural Fit & Soft Skills</span>
                      <span className="text-sm font-medium">{results.categories.culturalFitSoftSkills}%</span>
                    </div>
                    <Progress value={results.categories.culturalFitSoftSkills} className="h-2" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Response Time Analysis</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold">{(results.responseTimes.average / 1000).toFixed(1)}s</div>
                        <p className="text-sm text-muted-foreground">Average Response Time</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Clock className="h-8 w-8 text-green-500 mb-2" />
                        <div className="text-2xl font-bold">{(results.responseTimes.fastest / 1000).toFixed(1)}s</div>
                        <p className="text-sm text-muted-foreground">Fastest Response</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Clock className="h-8 w-8 text-orange-500 mb-2" />
                        <div className="text-2xl font-bold">{(results.responseTimes.slowest / 1000).toFixed(1)}s</div>
                        <p className="text-sm text-muted-foreground">Slowest Response</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interview Transcript</CardTitle>
            <CardDescription>Complete record of questions, answers, and response times</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transcript">
              <TabsList className="mb-4">
                <TabsTrigger value="transcript">Full Transcript</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              <TabsContent value="transcript" className="space-y-4">
                {results.transcript.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="mb-2">
                      <div className="font-medium">Question {index + 1}</div>
                      <p className="text-sm">{item.question}</p>
                    </div>
                    <div className="mb-2">
                      <div className="font-medium">Answer</div>
                      <p className="text-sm whitespace-pre-wrap">{item.answer}</p>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Response time: {(item.responseTime / 1000).toFixed(1)} seconds
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="timeline">
                <div className="relative">
                  {results.transcript.map((item, index) => (
                    <div key={index} className="mb-8 relative pl-6 border-l-2 border-muted-foreground/20">
                      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                      <div className="mb-2">
                        <div className="font-medium">Question {index + 1}</div>
                        <p className="text-sm">{item.question}</p>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Response time: {(item.responseTime / 1000).toFixed(1)} seconds
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/setup")}>
              Start New Interview
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
