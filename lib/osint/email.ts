export async function emailHarvest(domain: string) {
  const res = await fetch("/api/osint/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
  })

  if (!res.ok) {
    throw new Error("Email harvesting failed")
  }

  return res.json()
}