export async function whoisLookup(domain: string) {
  const res = await fetch("/api/osint/whois", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
  })

  if (!res.ok) {
    throw new Error("WHOIS lookup failed")
  }

  return res.json()
}