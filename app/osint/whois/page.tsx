"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"

import {
  ChevronLeft,
  Fingerprint,
  Search,
  Calendar,
  Contact,
  Server,
  Info,
  Globe,
  Loader2
} from "lucide-react"

import { whoisLookup } from "@/lib/osint/whois"
import { cn } from "@/lib/utils"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  domain: z.string().min(3, "Please enter a valid domain name"),
})

/* =======================
   TYPES
======================= */

interface WhoisRecord {
  domainName?: string
  registrarName?: string
  registrarIANAID?: string
  createdDate?: string
  updatedDate?: string
  expiresDate?: string
  estimatedDomainAge?: number
  nameServers?: { hostNames?: string[] }
  status?: string[]
}

interface WhoisResponse {
  WhoisRecord?: WhoisRecord
}

/* =======================
   RESULT COMPONENT
======================= */

function WhoisResults({ data }: { data: WhoisResponse }) {
  const record = data?.WhoisRecord

  if (!record?.domainName) {
    return (
      <div className="text-center text-red-400 py-8 bg-red-500/10 rounded-lg border border-red-500/20">
        No WHOIS data found for this domain.
      </div>
    )
  }

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A"

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="mt-10"
    >
      <Card className="border-cyan-500/30 bg-[#0f141f] shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
               <Globe className="h-6 w-6 text-cyan-400" />
             </div>
             <div>
               <CardTitle className="text-2xl text-white">{record.domainName}</CardTitle>
               <CardDescription className="text-slate-400">
                 Domain Intelligence Report
               </CardDescription>
             </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-8 md:grid-cols-2 p-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            
            {/* DATES */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-cyan-400">
                  <Calendar className="h-4 w-4" />
                  Lifecycle Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableCell className="text-slate-400 font-medium">Registered</TableCell>
                      <TableCell className="text-right text-slate-200">{formatDate(record.createdDate)}</TableCell>
                    </TableRow>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableCell className="text-slate-400 font-medium">Updated</TableCell>
                      <TableCell className="text-right text-slate-200">{formatDate(record.updatedDate)}</TableCell>
                    </TableRow>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableCell className="text-slate-400 font-medium">Expires</TableCell>
                      <TableCell className="text-right text-orange-400">{formatDate(record.expiresDate)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* REGISTRAR */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-purple-400">
                  <Contact className="h-4 w-4" />
                  Registrar Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableCell className="text-slate-400 font-medium">Organization</TableCell>
                      <TableCell className="text-right text-white font-semibold">{record.registrarName || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableCell className="text-slate-400 font-medium">IANA ID</TableCell>
                      <TableCell className="text-right text-slate-200 font-mono">{record.registrarIANAID || "N/A"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* STATUS */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-lime-400">
                  <Info className="h-4 w-4" />
                  Domain Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {record.status?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {record.status.map((s) => (
                      <Badge key={s} variant="outline" className="border-lime-500/30 text-lime-400 bg-lime-500/10">
                        {s.split(' ')[0]}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No status info available.</p>
                )}
              </CardContent>
            </Card>

            {/* NAME SERVERS */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-orange-400">
                  <Server className="h-4 w-4" />
                  Name Servers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {record.nameServers?.hostNames?.length ? (
                  <div className="grid gap-2">
                    {record.nameServers.hostNames.map((ns) => (
                      <div key={ns} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        <span className="font-mono">{ns.toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No name servers found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* =======================
   MAIN PAGE
======================= */

export default function WhoisLookupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WhoisResponse | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { domain: "" },
  })

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await whoisLookup(data.domain)
      setResult(res)
    } catch {
      setResult(null)
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
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
            <Fingerprint className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            WHOIS <span className="text-cyan-400">Recon</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Extract domain ownership, registrar data, and infrastructure details.
          </p>
        </div>

        {/* FORM */}
        <Card className="max-w-xl mx-auto bg-[#0f141f] border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Target Domain</CardTitle>
            <CardDescription className="text-slate-400">Enter a URL or domain (e.g. google.com)</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="example.com"
                            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600"
                            {...field}
                          />
                          <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-[100px]"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                            {loading ? "..." : "Scan"}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* RESULTS */}
        {result && <WhoisResults data={result} />}
      </div>
    </div>
  )
}