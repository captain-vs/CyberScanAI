import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-black text-slate-300">
      <Loader2 className="h-8 w-8 animate-spin text-lime-400" />
      <p className="font-mono text-sm">Loading GameZone...</p>
    </div>
  )
}