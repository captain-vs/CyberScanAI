import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { domain } = await req.json()

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      )
    }

    // 🔒 EXAM-SAFE SIMULATION LOGIC
    // Generates consistent data based on the domain string characters.
    // This ensures "google.com" always returns the same "Google-like" data.

    const hash = domain.length + domain.charCodeAt(0)
    
    // 1. Simulate Registrar
    const registrars = [
      "GoDaddy.com, LLC",
      "NameCheap, Inc.",
      "MarkMonitor Inc.",
      "Google LLC",
      "CloudFlare, Inc."
    ]
    const registrar = registrars[hash % registrars.length]

    // 2. Simulate Dates
    const currentYear = new Date().getFullYear()
    const createdYear = currentYear - (hash % 15) - 1 // 1-15 years old
    const createdDate = `${createdYear}-0${(hash % 9) + 1}-15T04:00:00Z`
    const expiresDate = `${currentYear + (hash % 5) + 1}-0${(hash % 9) + 1}-15T04:00:00Z`
    const updatedDate = `${currentYear}-01-10T09:23:00Z`

    // 3. Simulate Name Servers
    const nsBase = domain.split('.')[0] // "google" from "google.com"
    const nameServers = [
      `ns1.${nsBase}.com`,
      `ns2.${nsBase}.com`,
      `ns3.${nsBase}.com`,
      `ns4.${nsBase}.com`
    ]

    // 4. Simulate Status
    const statuses = [
      "clientTransferProhibited",
      "clientUpdateProhibited",
      "clientDeleteProhibited"
    ]

    // 🔥 Return the "Mock" Record
    return NextResponse.json({
      WhoisRecord: {
        domainName: domain.toLowerCase(),
        registrarName: registrar,
        registrarIANAID: (hash * 12).toString(),
        createdDate,
        updatedDate,
        expiresDate,
        estimatedDomainAge: currentYear - createdYear,
        nameServers: { hostNames: nameServers },
        status: statuses,
        disclaimer: "⚠️ Educational Simulation: Data generated for demonstration purposes."
      },
    })

  } catch (err) {
    return NextResponse.json(
      { error: "WHOIS lookup failed" },
      { status: 500 }
    )
  }
}