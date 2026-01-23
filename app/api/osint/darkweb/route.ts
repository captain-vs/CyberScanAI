import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // 🔒 ADVANCED SIMULATION LOGIC
    // We simulate a database of 10 billion records by hashing the input.
    // This allows specific emails to always trigger specific "realistic" breach scenarios.

    const hash = email.length + email.charCodeAt(0)
    const isBreached = hash % 2 === 0 // 50/50 chance

    if (!isBreached) {
      return NextResponse.json({
        email,
        status: "Safe",
        severity: "Low",
        breachCount: 0,
        sources: [],
        disclaimer: "No public breaches found in our simulated intelligence feed."
      })
    }

    // 📝 REALISTIC MOCK DATASETS
    const breachDatabase = [
      {
        name: "LinkedIn (2012 Scraping)",
        domain: "linkedin.com",
        date: "2012-06-05",
        dataClasses: ["Email Addresses", "Passwords (SHA-1)"],
        description: "Professional networking site suffered a massive data scrape affecting 160M accounts."
      },
      {
        name: "Adobe Systems",
        domain: "adobe.com",
        date: "2013-10-04",
        dataClasses: ["Email", "Password Hints", "Usernames"],
        description: "153 million accounts breached including source code and customer data."
      },
      {
        name: "Collection #1 (Combo List)",
        domain: "n/a",
        date: "2019-01-07",
        dataClasses: ["Email", "Plaintext Passwords"],
        description: "A massive aggregation of 773 million unique email addresses and passwords."
      },
      {
        name: "Canva Design",
        domain: "canva.com",
        date: "2019-05-24",
        dataClasses: ["Email", "Names", "Cities", "Auth Tokens"],
        description: "Graphic design tool suffered a breach affecting 137 million users."
      },
      {
        name: "Verifications.io",
        domain: "verifications.io",
        date: "2019-02-25",
        dataClasses: ["Email", "Phone Numbers", "IP Addresses", "Genders"],
        description: "Email validation service left a MongoDB instance unprotected."
      }
    ]

    // Select distinct breaches based on email hash
    const breachCount = (hash % 3) + 1 // 1 to 3 breaches
    const selectedBreaches = []
    
    // Pick breaches deterministically (so refreshing gives same result)
    for (let i = 0; i < breachCount; i++) {
        const index = (hash + i) % breachDatabase.length
        selectedBreaches.push(breachDatabase[index])
    }

    // Calculate Severity based on what was stolen
    const hasPasswordLeak = selectedBreaches.some(b => b.dataClasses.join("").includes("Password"))
    const severity = hasPasswordLeak ? "Critical" : "Medium"

    return NextResponse.json({
      email,
      status: "Breached",
      severity: severity,
      breachCount: selectedBreaches.length,
      sources: selectedBreaches, // Returning full objects now
      disclaimer: "⚠️ Educational Simulation: These results are generated for demonstration logic only."
    })

  } catch {
    return NextResponse.json(
      { error: "Dark web check failed" },
      { status: 500 }
    )
  }
}