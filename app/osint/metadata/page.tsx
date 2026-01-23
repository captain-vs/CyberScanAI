"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  FileSearch,
  AlertTriangle,
  CheckCircle,
  FileText,
  Camera,
  MapPin,
  Lock,
  Search,
  Loader2
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants, Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function MetadataPage() {
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileName || !fileType) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/osint/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        
        <Link
          href="/osint"
          className={cn(buttonVariants({ variant: "ghost" }), "mb-8 text-slate-400 hover:text-white hover:bg-slate-800")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to OSINT Hub
        </Link>

        {/* HERO */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)]">
            <FileSearch className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Metadata <span className="text-yellow-400">Extractor</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Analyze digital files to reveal hidden EXIF data, author info, and location tags.
          </p>
        </div>

        {/* INPUT CARD */}
        <Card className="max-w-xl mx-auto bg-[#0f141f] border-slate-800 shadow-xl mb-12">
          <CardHeader>
            <CardTitle className="text-white">File Analysis Simulation</CardTitle>
            <CardDescription className="text-slate-400">Enter file details to simulate extraction (No upload required).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="File Name (e.g. photo)"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="col-span-2 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600"
                />
                <Input
                  placeholder="Type (jpg)"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="col-span-1 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                {loading ? "Extracting..." : "Analyze Metadata"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* RESULTS AREA */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* RISK BANNER */}
            <div className={`mb-8 p-4 rounded-xl border flex items-start gap-4 ${
              result.riskLevel === "High" 
                ? "bg-red-500/10 border-red-500/30 text-red-400" 
                : result.riskLevel === "Medium"
                ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                : "bg-green-500/10 border-green-500/30 text-green-400"
            }`}>
              {result.riskLevel === "High" ? <AlertTriangle className="h-6 w-6 shrink-0" /> : <CheckCircle className="h-6 w-6 shrink-0" />}
              <div>
                <h3 className="font-bold text-lg">Risk Level: {result.riskLevel}</h3>
                <p className="text-sm opacity-90 mt-1">
                  {result.warnings.length > 0 ? result.warnings.join(" ") : "No sensitive metadata fields detected."}
                </p>
              </div>
            </div>

            {/* METADATA GRID */}
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* FILE INFO CARD */}
              <Card className="border-slate-800 bg-[#0f141f]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <FileText className="h-4 w-4 text-blue-400" />
                    General Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-500 text-sm">Name</span>
                      <span className="text-slate-200 font-mono text-sm">{result.fileName}.{result.fileType}</span>
                    </div>
                    {Object.entries(result.metadata).slice(0, 3).map(([k, v]: any) => (
                      <div key={k} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                        <span className="text-slate-500 text-sm">{k}</span>
                        <span className="text-slate-200 font-mono text-sm">{v}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* EXIF / TECH DETAILS CARD */}
              <Card className="border-slate-800 bg-[#0f141f]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Camera className="h-4 w-4 text-yellow-400" />
                    Technical Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {Object.entries(result.metadata).slice(3).map(([k, v]: any) => (
                      <div key={k} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                        <span className="text-slate-500 text-sm">{k}</span>
                        <span className="text-slate-200 font-mono text-sm text-right break-all">{v}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* GPS WARNING CARD (Only shows if GPS data exists) */}
              {JSON.stringify(result.metadata).includes("GPS") && (
                <Card className="md:col-span-2 border-red-500/30 bg-red-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                      <MapPin className="h-5 w-5" />
                      Location Data Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 mb-4">
                      This file contains precise GPS coordinates. Sharing this file publicly reveals the exact location where it was created.
                    </p>
                    <div className="flex gap-4">
                      <Badge variant="outline" className="border-red-500/50 text-red-400">Lat: {result.metadata["GPS Latitude"]}</Badge>
                      <Badge variant="outline" className="border-red-500/50 text-red-400">Lng: {result.metadata["GPS Longitude"]}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            <p className="text-center text-xs text-slate-600 mt-8">
              {result.disclaimer}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}