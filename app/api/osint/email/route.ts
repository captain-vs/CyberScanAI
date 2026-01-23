import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { domain } = await req.json()

    if (!domain || !domain.includes(".")) {
      return NextResponse.json({ error: "Valid domain required" }, { status: 400 })
    }

    // 🔒 SMART SIMULATION
    const company = domain.split(".")[0]
    const hash = domain.length + domain.charCodeAt(0)
    
    // 1. Basic Roles (Always present for infrastructure)
    const employees = [
      { first: "admin", last: "", role: "Infrastructure" },
      { first: "support", last: "", role: "Customer Service" },
      { first: "contact", last: "", role: "General" },
    ]

    // 2. Add "Realistic" Names (Simulated Employees)
    const commonNames = [
      { first: "John", last: "Smith", role: "Sales Director" },
      { first: "Sarah", last: "Connor", role: "Security Lead" },
      { first: "Michael", last: "Chen", role: "Developer" },
      { first: "Emily", last: "Davis", role: "HR Manager" },
      { first: "David", last: "Miller", role: "Finance" },
    ]

    // Deterministically pick 2-4 people based on the domain hash
    for (let i = 0; i < commonNames.length; i++) {
      if ((hash + i) % 2 === 0) {
        employees.push(commonNames[i])
      }
    }

    // 3. Format Data & Generate Verification Links
    const results = employees.map((p) => {
      const email = p.last 
        ? `${p.first.toLowerCase()}.${p.last.toLowerCase()}@${domain}`
        : `${p.first.toLowerCase()}@${domain}`
        
      return {
        name: p.last ? `${p.first} ${p.last}` : p.first,
        email: email,
        role: p.role,
        // Google Search Dorks for Verification (The "Real" OSINT part)
        sources: [
          { 
            type: "LinkedIn", 
            url: `https://www.google.com/search?q=site:linkedin.com/in/ "${p.first} ${p.last}" "${company}"` 
          },
          { 
            type: "Twitter", 
            url: `https://twitter.com/search?q="${p.first} ${p.last}"` 
          }
        ]
      }
    })

    return NextResponse.json({
      domain,
      found: results.length,
      emails: results,
      namingConvention: "{first}.{last}@" + domain,
      disclaimer: "⚠️ Educational Simulation: Emails generated based on common corporate naming conventions.",
    })

  } catch {
    return NextResponse.json({ error: "Harvesting failed" }, { status: 500 })
  }
}