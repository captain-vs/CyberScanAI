export async function dnsLookup(domain: string) {
  const res = await fetch("/api/osint/dns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
  })

  if (!res.ok) {
    throw new Error("DNS lookup failed")
  }

  return res.json()
}