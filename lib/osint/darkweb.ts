export async function darkWebCheck(email: string) {
  const res = await fetch("/api/osint/darkweb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    throw new Error("Dark web check failed")
  }

  return res.json()
}