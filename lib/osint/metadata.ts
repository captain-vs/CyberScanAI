export interface MetadataRequest {
  fileName: string
  fileType: string
}

export async function analyzeMetadata(data: MetadataRequest) {
  const res = await fetch("/api/osint/metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Metadata analysis failed")
  }

  return res.json()
}