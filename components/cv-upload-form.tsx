"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText, Upload, X, Loader2 } from "lucide-react"

interface CVUploadFormProps {
  onUpload: (content: string, fileName: string) => void
  fileName: string
}

export function CVUploadForm({ onUpload, fileName }: CVUploadFormProps) {
  const [error, setError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "text/plain",
    ]

    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF, DOCX, or TXT file")
      return
    }

    setIsUploading(true)
    setError("")

    try {

      const formData = new FormData()
      formData.append("file", file)


      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response: ${await response.text()}`)
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse CV")
      }

      onUpload(data.content, data.fileName)
    } catch (err) {
      console.error("Error uploading file:", err)
      setError(err instanceof Error ? err.message : "Failed to upload the file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    onUpload("", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cv-upload">Upload Candidate CV</Label>

        {!fileName ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Input
              id="cv-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm font-medium">Drag and drop or click to upload</div>
              <div className="text-xs text-muted-foreground">Supports PDF, DOCX, and TXT files</div>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Select File"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium truncate max-w-[200px]">{fileName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemoveFile} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <p>
          The CV will be used to generate personalized interview questions relevant to the candidate's background and
          the job requirements.
        </p>
      </div>
    </div>
  )
}
