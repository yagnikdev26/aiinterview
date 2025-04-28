import { type NextRequest, NextResponse } from "next/server"
import { parseCV } from "@/lib/file-parser"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

   
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
      "text/plain",
    ]

    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF, DOCX, or TXT file" }, { status: 400 })
    }


    const content = await parseCV(file)

    return NextResponse.json({
      success: true,
      fileName: file.name,
      content,
    })
  } catch (error) {
    console.error("Error parsing CV:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to parse the file",
        success: false,
      },
      { status: 500 },
    )
  }
}
