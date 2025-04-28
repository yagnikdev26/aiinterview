const API_URL = "https://api.example.com/v1/generate";
export async function generateInterviewQuestions(
  jobDescription: string,
  cvContent: string
): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("Using mock data – API key not provided.");
    return [
      "Can you tell me about your experience with developing web applications using React and Next.js?",
      "How have you implemented AI features in your previous projects?",
      "Describe a challenging technical problem you've faced and how you solved it.",
      "How do you approach testing and ensuring code quality in your projects?",
      "What experience do you have with handling file uploads and processing in web applications?",
      "How would you design a system to evaluate user responses in real-time?",
      "Can you explain your approach to creating responsive and accessible user interfaces?",
      "What strategies would you use to optimize the performance of a Next.js application?",
      "How do you stay updated with the latest developments in web technologies?",
      "Do you have any questions about the role or the company?"
    ];
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      jobDescription,
      cvContent
    })
  });

  const data = await response.json();
  return data.questions || [];
}

export async function analyzeInterview(
  messages: any[],
  responseTimes: Record<number, number>
): Promise<any> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("Using mock data – API key not provided.");
    const times = Object.values(responseTimes);
    const average = times.reduce((sum, t) => sum + t, 0) / times.length;
    const fastest = Math.min(...times);
    const slowest = Math.max(...times);

    return {
      overallScore: 85,
      categories: {
        technicalAcumen: 82,
        communicationSkills: 88,
        responsivenessAgility: 78,
        problemSolvingAdaptability: 90,
        culturalFitSoftSkills: 85
      },
      responseTimes: { average, fastest, slowest },
      summary:
        "The candidate demonstrated strong technical knowledge and excellent problem-solving skills. Their communication was clear and concise, though response times varied.",
      strengths: [
        "Strong technical knowledge of web development technologies",
        "Excellent problem-solving approach with clear methodology",
        "Good communication skills with concise explanations",
        "Demonstrated experience with relevant frameworks and tools"
      ],
      improvements: [
        "Could improve response time consistency",
        "Some answers could benefit from more specific examples",
        "Consider providing more context when discussing technical solutions"
      ],
      transcript: messages
        .filter((m) => m.role === "assistant" || m.role === "user")
        .map((m, i) => ({
          question: m.role === "assistant" ? m.content : "",
          answer: m.role === "user" ? m.content : "",
          responseTime: responseTimes[i] || 5000
        }))
    };
  }

  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ messages, responseTimes })
  });

  const data = await response.json();
  return data;
}
