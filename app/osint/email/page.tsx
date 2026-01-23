"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  Mail,
  Search,
  Building,
  User,
  ExternalLink,
  Briefcase,
  Loader2,
  Copy
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
import { emailHarvest } from "@/lib/osint/email"

export default function EmailHarvesterPage() {
  const [domain, setDomain] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain) return
    setLoading(true)
    setResult(null)

    try {
      const data = await emailHarvest(domain)
      setResult(data)
    } catch (error) {
      console.error(error)
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]">
            <Mail className="h-8 w-8 text-orange-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Email <span className="text-orange-400">Harvester</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Discover public email addresses and employee naming conventions associated with a target domain.
          </p>
        </div>

        {/* INPUT CARD */}
        <Card className="max-w-xl mx-auto bg-[#0f141f] border-slate-800 shadow-xl mb-12">
          <CardHeader>
            <CardTitle className="text-white">Target Domain</CardTitle>
            <CardDescription className="text-slate-400">Enter a company domain (e.g. tesla.com)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="domain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600"
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold min-w-[100px]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                {loading ? "..." : "Harvest"}
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
            {/* STATS HEADER */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-orange-400" />
                <span className="text-lg font-bold text-white">{result.domain}</span>
              </div>
              <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">
                Pattern: {result.namingConvention}
              </Badge>
            </div>

            {/* EMAIL GRID */}
            <div className="grid gap-4 md:grid-cols-2">
              {result.emails.map((person: any, i: number) => (
                <Card key={i} className="border-slate-800 bg-[#0f141f] hover:border-orange-500/30 transition-all group">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-slate-900 text-slate-400 group-hover:text-white transition-colors">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base capitalize">{person.name}</h4>
                          <span className="text-xs text-orange-400 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {person.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* EMAIL BOX */}
                    <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 flex items-center justify-between group-hover:border-orange-500/20 transition-all">
                      <code className="text-sm text-slate-300 font-mono">{person.email}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white" onClick={() => navigator.clipboard.writeText(person.email)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* VERIFICATION LINKS - THIS IS YOUR DEFENSE */}
                    <div className="mt-4 flex gap-2">
                      {person.sources.map((source: any, j: number) => (
                        <a 
                          key={j}
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="secondary" size="sm" className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
                            Verify on {source.type} <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
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