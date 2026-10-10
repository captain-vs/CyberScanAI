import { NextResponse } from "next/server"
import { z } from "zod"
import { securityScanFlow } from "@/src/index"

const scanSchema = z.object({
  target: z.string().trim().min(1).max(500),
  type: z.enum(["URL", "IP", "File", "Image"]),
  imageBase64: z.string().max(1_500_000).optional(),
})

export async function POST(req: Request) {
  try {
    const payload = scanSchema.parse(await req.json())

    if (payload.type === "Image" && !payload.imageBase64) {
      return NextResponse.json(
        { error: "Image data is required for image analysis." },
        { status: 400 },
      )
    }

    const result = await securityScanFlow(payload)
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Invalid scan request."
        : "Scan service is temporarily unavailable."

    return NextResponse.json({ error: message }, { status: 400 })
  }
}