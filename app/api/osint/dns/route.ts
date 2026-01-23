import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { domain } = await req.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // 🔒 EXAM-SAFE SIMULATION LOGIC
    const hash = domain.length + domain.charCodeAt(0)
    const records = []
    
    // Helper to generate consistent IPs based on domain
    const baseIP = `192.168.${hash % 255}`

    // 1. A Records (IPv4)
    records.push({
      type: "A",
      name: domain,
      ttl: 3600,
      value: `${baseIP}.${(hash * 2) % 255}`
    })
    records.push({
      type: "A",
      name: `www.${domain}`,
      ttl: 3600,
      value: `${baseIP}.${(hash * 3) % 255}`
    })

    // 2. MX Records (Mail)
    records.push({
      type: "MX",
      name: domain,
      ttl: 3600,
      value: `10 aspmx.l.google.com`
    })
    records.push({
      type: "MX",
      name: domain,
      ttl: 3600,
      value: `20 alt1.aspmx.l.google.com`
    })

    // 3. NS Records (Nameservers)
    records.push({
      type: "NS",
      name: domain,
      ttl: 86400,
      value: `ns1.digitalocean.com`
    })
    records.push({
      type: "NS",
      name: domain,
      ttl: 86400,
      value: `ns2.digitalocean.com`
    })

    // 4. TXT Records (Verification)
    records.push({
      type: "TXT",
      name: domain,
      ttl: 300,
      value: `"v=spf1 include:_spf.google.com ~all"`
    })
    
    // 5. CNAME (Alias)
    if (hash % 2 === 0) {
      records.push({
        type: "CNAME",
        name: `blog.${domain}`,
        ttl: 43200,
        value: `ext-cust.squarespace.com`
      })
    }

    // 6. SOA (Start of Authority)
    records.push({
      type: "SOA",
      name: domain,
      ttl: 900,
      value: `ns1.digitalocean.com hostmaster.${domain} 1709934221 10800 3600 604800 3600`
    })

    return NextResponse.json({ records })
  } catch {
    return NextResponse.json(
      { error: "DNS lookup failed" },
      { status: 500 }
    )
  }
}