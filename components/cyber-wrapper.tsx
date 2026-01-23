import type { ReactNode } from "react"

interface CyberWrapperProps {
  children: ReactNode
  className?: string
}

export function CyberWrapper({ children, className = "" }: CyberWrapperProps) {
  return (
    <div className={`min-h-screen bg-black text-slate-200 relative overflow-hidden font-sans selection:bg-blue-500/30 ${className}`}>
      
      {/* THE MAGIC GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* YOUR PAGE CONTENT */}
      <div className="relative z-10">
        {children}
      </div>
      
    </div>
  )
}