export async function socialCheck(username: string) {
  const res = await fetch("/api/osint/social", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  })

  if (!res.ok) {
    throw new Error("Social media check failed")
  }

  return res.json()
}