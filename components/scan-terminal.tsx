"use client"
import { useEffect, useRef } from "react"
import { Terminal, XCircle, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export type LogEntry = {
  timestamp: string
  type: "info" | "success" | "warning" | "error"
  message: string
}

export function ScanTerminal({ logs }: { logs: LogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logs.length > 0) {
      // Only auto-scroll if there are actual logs to show
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [logs])

  return (
    <div className="w-full rounded-lg border border-slate-800 bg-black/90 font-mono text-xs shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-blue-500" />
          <span className="font-semibold text-slate-300">SYSTEM_CONSOLE</span>
        </div>
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
        </div>
      </div>
      <ScrollArea className="h-[150px] p-4">
        <div className="space-y-1.5">
          {logs.length === 0 && (
            <span className="text-slate-600 italic">Waiting for input...</span>
          )}
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="shrink-0 text-slate-600">[{log.timestamp}]</span>
              <div className="mt-0.5 shrink-0">
                {log.type === "info" && <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />}
                {log.type === "success" && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                {log.type === "warning" && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                {log.type === "error" && <XCircle className="h-3 w-3 text-red-500" />}
              </div>
              <span className={`
                ${log.type === "info" ? "text-blue-200" : ""}
                ${log.type === "success" ? "text-green-300" : ""}
                ${log.type === "warning" ? "text-yellow-300" : ""}
                ${log.type === "error" ? "text-red-400" : ""}
              `}>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  )
}