"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, FileText, Users, MessageSquare, BarChart3 } from "lucide-react"
import Dictaphone from "@/components/dictaphone"

export default function Home() {
  
  return (
    <div className=" mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">AI-Powered Interview System</h1>
          <p className="text-xl text-muted-foreground">
            Streamline your recruitment process with AI-driven interviews and candidate evaluation
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Our system uses AI to create personalized interviews based on job descriptions and candidate CVs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">1. Upload Data</h3>
                  <p className="text-sm text-muted-foreground">Enter job description and upload candidate's CV</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">2. Generate Questions</h3>
                  <p className="text-sm text-muted-foreground">AI creates tailored interview questions</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">3. Conduct Interview</h3>
                  <p className="text-sm text-muted-foreground">Dynamic one-shot interview with timing metrics</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">4. Get Results</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive scoring and performance analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Link href="/setup">
            <Button size="lg" className="gap-2">
              Start New Interview
              <ArrowRight className="h-4 w-4" />
            
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
