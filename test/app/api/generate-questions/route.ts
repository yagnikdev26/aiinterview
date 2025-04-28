import { type NextRequest, NextResponse } from "next/server"
import { generateInterviewQuestions } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, cvContent } = await request.json()

    if (!jobDescription || !cvContent) {
      return NextResponse.json({ error: "Job description and CV content are required" }, { status: 400 })
    }


    const questions = await generateInterviewQuestions(jobDescription, cvContent)

    return NextResponse.json({
      success: true,
      questions,
    })
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate interview questions" }, { status: 500 })
  }
}
