"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobDescriptionForm } from "@/components/job-description-form"
import { CVUploadForm } from "@/components/cv-upload-form"
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetupPage() {
  const router = useRouter()
  const [jobDescription, setJobDescription] = useState("")
  const [cvContent, setCvContent] = useState("")
  const [cvFileName, setCvFileName] = useState("")
  const [activeTab, setActiveTab] = useState("job-description")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const handleJobDescriptionSubmit = (description: string) => {
    setJobDescription(description)
    setActiveTab("cv-upload")
  }

  const handleCVUpload = (content: string, fileName: string) => {
    setCvContent(content)
    setCvFileName(fileName)
  }

  const handleGenerateInterview = async () => {
    if (!jobDescription || !cvContent) return

    setIsGenerating(true)
    setError("")

    try {
      
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          cvContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate interview questions")
      }

      const data = await response.json()

      localStorage.setItem(
        "interviewData",
        JSON.stringify({
          jobDescription,
          cvContent,
          cvFileName,
          questions: data.questions,
          timestamp: new Date().toISOString(),
        }),
      )

      router.push("/interview")
    } catch (error) {
      console.error("Error generating interview:", error)
      setError(error instanceof Error ? error.message : "Failed to generate interview. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const isReadyToGenerate = jobDescription && cvContent

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Interview Setup</CardTitle>
            <CardDescription>
              Provide a job description and upload a candidate's CV to generate a personalized interview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="job-description">Job Description</TabsTrigger>
                <TabsTrigger value="cv-upload" disabled={!jobDescription}>
                  CV Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent value="job-description">
                <JobDescriptionForm initialValue={jobDescription} onSubmit={handleJobDescriptionSubmit} />
              </TabsContent>
              <TabsContent value="cv-upload">
                <CVUploadForm onUpload={handleCVUpload} fileName={cvFileName} />
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveTab("job-description")}
              disabled={activeTab === "job-description"}
            >
              Previous
            </Button>
            {activeTab === "job-description" ? (
              <Button onClick={() => setActiveTab("cv-upload")} disabled={!jobDescription}>
                Next
              </Button>
            ) : (
              <Button onClick={handleGenerateInterview} disabled={!isReadyToGenerate || isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Interview
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
