"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ShieldAlert, Search, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { darkWebCheck } from "@/lib/osint/darkweb"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DarkWebPage() {
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (!email || !email.includes("@")) return
    setLoading(true)
    setResult(null)
    try {
      const res = await darkWebCheck(email)
      setResult(res)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Link href="/osint" className={cn(buttonVariants({ variant: "ghost" }), "mb-6 text-muted-foreground")}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to OSINT Hub
      </Link>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-500/10 mb-4">
           <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Dark Web Intelligence</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Scan credible threat intelligence feeds to detect if an email has been compromised in known data breaches.
        </p>
      </div>

      <Card className="max-w-xl mx-auto border-primary/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter target email (e.g. admin@corp.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
            />
            <Button onClick={handleCheck} disabled={loading} className="min-w-[100px]">
              {loading ? "Scanning..." : "Scan"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>Standard Protocol: Hash-based lookup for privacy protection.</span>
          </p>
        </CardContent>
      </Card>

      {result && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* STATUS BANNER */}
          <Alert className={`mb-6 border-l-4 ${result.status === "Breached" ? "border-l-red-500 bg-red-500/5" : "border-l-green-500 bg-green-500/5"}`}>
            {result.status === "Breached" ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
            <AlertTitle className={result.status === "Breached" ? "text-red-500" : "text-green-500"}>
              {result.status === "Breached" ? "Compromised Identities Found" : "No Breaches Detected"}
            </AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {result.status === "Breached" 
                ? `This email appears in ${result.breachCount} known database leaks.` 
                : "This email does not appear in our current threat datasets."}
            </AlertDescription>
          </Alert>

          {/* DETAILED REPORT */}
          {result.status === "Breached" && (
            <div className="grid gap-4">
              {result.sources.map((breach: any, i: number) => (
                <Card key={i} className="border-l-4 border-l-orange-500/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{breach.name}</CardTitle>
                        <CardDescription>{breach.date}</CardDescription>
                      </div>
                      <Badge variant="outline" className="border-orange-500/50 text-orange-500">
                        {breach.domain}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{breach.description}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compromised Data:</p>
                      <div className="flex flex-wrap gap-2">
                        {breach.dataClasses.map((data: string) => (
                          <Badge key={data} variant="secondary" className="bg-red-500/10 text-red-400 hover:bg-red-500/20">
                            {data}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <p className="text-center text-xs text-muted-foreground mt-8 opacity-50">
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}