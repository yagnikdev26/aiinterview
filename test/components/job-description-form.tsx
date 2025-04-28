"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface JobDescriptionFormProps {
  initialValue: string
  onSubmit: (description: string) => void
}

export function JobDescriptionForm({ initialValue, onSubmit }: JobDescriptionFormProps) {
  const [description, setDescription] = useState(initialValue)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate input
    if (description.trim().length < 100) {
      setError("Please provide a more detailed job description (minimum 100 characters)")
      return
    }

    setError("")
    onSubmit(description)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="job-description">Job Description</Label>
        <Textarea
          id="job-description"
          placeholder="Enter a detailed job description including required skills, responsibilities, and qualifications..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[200px]"
        />
        <p className="text-sm text-muted-foreground">
          Character count: {description.length}
          {description.length < 100 && " (minimum 100 characters)"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={description.trim().length < 100}>
          Continue
        </Button>
      </div>
    </form>
  )
}
