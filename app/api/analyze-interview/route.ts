import { type NextRequest, NextResponse } from "next/server"
import { analyzeInterview } from "@/lib/ai-service"


export async function POST(request: NextRequest) {
  try {
    const { messages, responseTimes, jobDescription, cvContent } = await request.json()

    if (!messages || !responseTimes) {
      return NextResponse.json({ error: "Interview messages and response times are required" }, { status: 400 })
    }

    const results = await analyzeInterview(messages, responseTimes, jobDescription, cvContent)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error analyzing interview:", error)
    return NextResponse.json({ error: "Failed to analyze the interview" }, { status: 500 })
  }
}
