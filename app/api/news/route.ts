import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "News service is not configured." },
      { status: 503 },
    )
  }

  const { searchParams } = new URL(request.url)
  const rawQuery = searchParams.get("query") || "cybersecurity"
  const query = rawQuery.slice(0, 100)

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } },
    )

    if (!response.ok) {
      throw new Error(`NewsAPI returned ${response.status}`)
    }

    return NextResponse.json(await response.json())
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch news right now." },
      { status: 502 },
    )
  }
}