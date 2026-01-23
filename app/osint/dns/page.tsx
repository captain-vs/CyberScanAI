"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  ChevronLeft,
  Database,
  Search,
  Loader2,
  List
} from "lucide-react"

import { dnsLookup } from "@/lib/osint/dns"
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
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  domain: z.string().min(3, "Please enter a valid domain name"),
})

export default function DNSReconPage() {
  const [data, setData] = useState<{ records: any[] } | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { domain: "" },
  })

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (formData) => {
    setLoading(true)
    setData(null)
    try {
      const res = await dnsLookup(formData.domain)
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Helper for Badge Colors
  const getTypeColor = (type: string) => {
    switch(type) {
      case "A": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
      case "MX": return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "NS": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "TXT": return "bg-slate-500/10 text-slate-400 border-slate-500/20"
      case "CNAME": return "bg-pink-500/10 text-pink-400 border-pink-500/20" // Added CNAME
      case "SOA": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" // Added SOA
      default: return "bg-lime-500/10 text-lime-400 border-lime-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f141f] to-black text-slate-200">
      {/* 🟢 INCREASED WIDTH HERE: max-w-7xl */}
      <div className="container max-w-7xl mx-auto px-4 py-12">
        
        <Link
          href="/osint"
          className={cn(buttonVariants({ variant: "ghost" }), "mb-8 text-slate-400 hover:text-white hover:bg-slate-800")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to OSINT Hub
        </Link>

        <div className="text-center mb-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-500/10 border border-lime-500/20 shadow-[0_0_15px_-3px_rgba(132,204,22,0.3)]">
            <Database className="h-8 w-8 text-lime-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            DNS <span className="text-lime-400">Recon</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Map the attack surface by enumerating public DNS records.
          </p>
        </div>

        <Card className="max-w-xl mx-auto bg-[#0f141f] border-slate-800 shadow-xl mb-12">
          <CardHeader>
            <CardTitle className="text-white">Target Domain</CardTitle>
            <CardDescription className="text-slate-400">Enter domain to scan (e.g. google.com)</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input 
                           placeholder="example.com" 
                           className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600"
                           {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-lime-600 hover:bg-lime-700 text-black font-bold"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  {loading ? "..." : "Scan"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {data && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-lime-500/10 rounded-lg">
                <List className="h-5 w-5 text-lime-400" />
              </div>
              <h2 className="text-xl font-bold text-white">DNS Records Found</h2>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                {data.records.length}
              </Badge>
            </div>

            <div className="rounded-xl border border-slate-800 overflow-hidden bg-[#0f141f] shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold w-32">Type</th>
                      <th className="px-6 py-4 font-semibold w-64">Name</th>
                      <th className="px-6 py-4 font-semibold w-32">TTL</th>
                      <th className="px-6 py-4 font-semibold">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.records.map((record, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline" className={`font-bold ${getTypeColor(record.type)}`}>
                            {record.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300 group-hover:text-white transition-colors">
                          {record.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono">
                          {record.ttl}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-400 break-all group-hover:text-slate-200 transition-colors">
                          {record.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <p className="text-center text-xs text-slate-600 mt-6">
              ⚠️ Educational Simulation: Data generated for demonstration logic.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}