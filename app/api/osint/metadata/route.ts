import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json()

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    // 🔒 EXAM-SAFE SIMULATION LOGIC
    const hash = fileName.length + fileType.length
    const cleanFileType = fileType.toLowerCase().replace(".", "")
    
    // Determine Risk & Data based on file type
    let metadata = {}
    let riskLevel = "Low"
    let warnings = []

    if (["jpg", "jpeg", "png", "heic"].includes(cleanFileType)) {
      // IMAGE SIMULATION
      metadata = {
        "Dimensions": "4032 x 3024",
        "Color Space": "sRGB",
        "Camera Model": "iPhone 14 Pro",
        "Aperture": "f/1.78",
        "Exposure": "1/120 sec",
        "Software": "iOS 16.4.1",
        "Date Created": "2023-10-15 14:22:01",
      }
      // Add GPS to every 2nd file for demo
      if (hash % 2 === 0) {
        metadata = { ...metadata, "GPS Latitude": "34.0522 N", "GPS Longitude": "118.2437 W" }
        riskLevel = "High"
        warnings.push("Precise GPS location embedded.")
      }
    } 
    else if (["pdf", "docx", "pptx"].includes(cleanFileType)) {
      // DOCUMENT SIMULATION
      metadata = {
        "Author": "Corporate User",
        "Company": "Tech Corp Ltd.",
        "Creator": "Microsoft Word 365",
        "Creation Date": "2023-09-01 09:00:00",
        "Last Modified": "2024-01-20 16:45:00",
        "Revision Number": "12",
        "Language": "en-US"
      }
      riskLevel = "Medium"
      warnings.push("Author and Company names exposed.")
    } 
    else {
      // GENERIC SIMULATION
      metadata = {
        "File Size": "2.4 MB",
        "MIME Type": `application/${cleanFileType}`,
        "Encoding": "UTF-8",
        "Hash (MD5)": "a3c4f9d2e1b8...",
      }
    }

    return NextResponse.json({
      fileName,
      fileType: cleanFileType,
      metadata,
      riskLevel,
      warnings,
      disclaimer: "⚠️ Educational Simulation: Metadata generated for demonstration.",
    })
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}