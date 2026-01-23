"use client"

import { useState } from "react"
import { signIn, signUp, signInWithGoogle } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Mail, Lock, User, Loader2, Cpu, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", 
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (mode === "register" && form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = mode === "login"
        ? await signIn(form.email, form.password)
        : await signUp(form.email, form.password, form.name)

      if (!res.success) {
        // ⚡ CLEAN UP ERROR MESSAGES
        let msg = res.error || "Authentication failed"
        
        // Check for specific Firebase error codes inside the string
        if (msg.includes("auth/invalid-credential") || msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password")) {
           msg = "Invalid email or password"
        } else if (msg.includes("auth/email-already-in-use")) {
           msg = "This email is already registered"
        } else if (msg.includes("auth/weak-password")) {
           msg = "Password should be at least 6 characters"
        } else if (msg.includes("auth/invalid-email")) {
           msg = "Please enter a valid email address"
        } else if (msg.includes("auth/too-many-requests")) {
           msg = "Too many failed attempts. Try again later."
        }

        setError(msg)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* 1. BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 2. CENTERED FIXED-SIZE CARD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        // ⚡ FIXED SIZE: h-[580px] fits everything perfectly without scroll
        className="w-full max-w-4xl h-[580px] bg-[#0f141f] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10"
      >
        
        {/* =======================
            LEFT SIDE: IMAGE
        ======================= */}
        <div className="relative hidden md:block h-full">
          <div className="absolute inset-0 bg-slate-900/20 z-10" />
          <img
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80"
            alt="Cyber Security Operations"
            className="absolute inset-0 h-full w-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-20 flex flex-col justify-end p-8">
             <div className="flex items-center gap-3 mb-3">
               <div className="h-10 w-10 rounded-lg bg-lime-500/20 flex items-center justify-center border border-lime-500/50 backdrop-blur-sm">
                 <Shield className="h-5 w-5 text-lime-400" />
               </div>
               <h2 className="text-2xl font-bold text-white tracking-tight">CyberScan AI</h2>
             </div>
             <p className="text-slate-300 leading-relaxed text-sm">
               Secure your digital footprint. Access advanced scanning tools and join the elite network.
             </p>
          </div>
        </div>

        {/* =======================
            RIGHT SIDE: COMPACT FORM
        ======================= */}
        <div className="flex items-center justify-center h-full bg-[#0f141f] p-6 sm:p-8">
          <div className="w-full max-w-sm flex flex-col justify-center">
            
            <div className="mb-4 text-center md:text-left">
              <h1 className="text-2xl font-bold text-white mb-1">
                {mode === "login" ? "Welcome Back" : "Initialize Profile"}
              </h1>
              <p className="text-slate-400 text-xs">
                {mode === "login" ? "Enter credentials to access the grid." : "Join the network to start operations."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 p-2 flex items-center gap-2 text-red-400 text-xs"
                >
                  <Cpu className="h-3 w-3 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ⚡ SPACE-Y-3 KEEPS IT TIGHT */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              <AnimatePresence mode="popLayout">
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative mb-3">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      {/* ⚡ h-10 (40px) Inputs to save space */}
                      <Input
                        placeholder="Codename (Full Name)"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="pl-9 bg-slate-950/50 border-slate-800 text-white focus:border-lime-500/50 h-10 text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pl-9 bg-slate-950/50 border-slate-800 text-white focus:border-lime-500/50 h-10 text-sm"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pl-9 bg-slate-950/50 border-slate-800 text-white focus:border-lime-500/50 h-10 text-sm"
                />
              </div>

              <AnimatePresence mode="popLayout">
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative mt-3">
                      <CheckCircle className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Confirm Password"
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="pl-9 bg-slate-950/50 border-slate-800 text-white focus:border-lime-500/50 h-10 text-sm"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                className="w-full bg-lime-500 hover:bg-lime-400 text-black font-bold h-10 text-sm mt-1 transition-all hover:shadow-[0_0_20px_rgba(132,204,22,0.3)]"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Processing...</>
                ) : (
                  mode === "login" ? "Access Dashboard" : "Create Account"
                )}
              </Button>
            </form>

            {/* Compact Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#0f141f] px-2 text-slate-500">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full bg-slate-900 border-slate-800 hover:bg-slate-800 text-white h-10 text-sm"
              onClick={signInWithGoogle}
            >
              <svg className="mr-2 h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Google
            </Button>

            <p className="mt-4 text-center text-xs text-slate-400">
              {mode === "login" ? "Need clearance?" : "Already an agent?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login")
                  setError("")
                  setForm({ name: "", email: "", password: "", confirmPassword: "" })
                }}
                className="text-lime-400 hover:text-lime-300 font-bold hover:underline transition-all ml-1"
              >
                {mode === "login" ? "Register" : "Login"}
              </button>
            </p>

          </div>
        </div>

      </motion.div>
    </div>
  )
}