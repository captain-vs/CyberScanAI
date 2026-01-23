import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { username } = await req.json()

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    // 🔒 ADVANCED SIMULATION LOGIC
    // We deterministically generate "scraped" data based on the username.
    
    const hash = username.length + username.charCodeAt(0)
    const foundProfiles = []
    
    // Helper to generate a fake "Bio"
    const bios = [
      "Tech enthusiast. Developer. Coffee lover. ☕",
      "Digital artist & designer. 🎨",
      "Just here for the memes.",
      "Cybersecurity student @ MU. 🔒",
      "Building the future of the web.",
      "Open source contributor.",
      "Photographer based in Mumbai. 📸"
    ]

    // 1. Define Potential Platforms
    const platforms = [
      { name: "Twitter", cat: "Social", base: "twitter.com/" },
      { name: "Instagram", cat: "Social", base: "instagram.com/" },
      { name: "GitHub", cat: "Code", base: "github.com/" },
      { name: "Reddit", cat: "Forum", base: "reddit.com/user/" },
      { name: "LinkedIn", cat: "Professional", base: "linkedin.com/in/" },
      { name: "Spotify", cat: "Music", base: "open.spotify.com/user/" },
      { name: "Discord", cat: "Chat", base: "discordapp.com/users/" },
      { name: "Medium", cat: "Blog", base: "medium.com/@" },
      { name: "Steam", cat: "Gaming", base: "steamcommunity.com/id/" },
      { name: "Twitch", cat: "Streaming", base: "twitch.tv/" }
    ]

    // 2. "Scan" Logic (Deterministically find 3-6 profiles)
    const matchCount = (hash % 4) + 3 
    
    for (let i = 0; i < matchCount; i++) {
      // Pick a platform based on hash offset
      const platformIndex = (hash + (i * 3)) % platforms.length
      const p = platforms[platformIndex]
      
      // Simulate "Confidence" (Real tools often give a % match)
      const confidence = 85 + ((hash + i) % 15) // 85-100%

      // Simulate "Last Active"
      const daysAgo = (hash * i) % 30
      const lastActive = daysAgo === 0 ? "Now" : `${daysAgo}d ago`

      foundProfiles.push({
        platform: p.name,
        category: p.cat,
        url: `https://${p.base}${username}`,
        username: username, // Sometimes usernames vary slightly, but we'll keep it simple
        confidence: confidence,
        lastActive: lastActive,
        // Pick a bio randomly
        bio: bios[(hash + i) % bios.length], 
        // Generate a consistent avatar color
        avatarColor: (hash + i) % 2 === 0 ? "bg-purple-500" : "bg-indigo-500"
      })
    }

    // Remove duplicates
    const uniqueProfiles = foundProfiles.filter((v,i,a)=>a.findIndex(t=>(t.platform===v.platform))===i)

    return NextResponse.json({
      username,
      profiles: uniqueProfiles,
      totalFound: uniqueProfiles.length,
      scanTime: "1.2s",
      exposureLevel: uniqueProfiles.length > 4 ? "High" : "Medium",
      disclaimer: "⚠️ Educational Simulation: Profile data is generated for demonstration purposes.",
    })

  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}