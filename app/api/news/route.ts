import { NextResponse } from "next/server"

const NEWS_API_KEY = "0660e361a56145feaa354d0578e1243a"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || "technology"
  const query = searchParams.get("query") || "cybersecurity"

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`,
      { next: { revalidate: 3600 } },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch news")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("News API error:", error)
    return NextResponse.json({ error: "Failed to fetch news articles" }, { status: 500 })
  }
}
