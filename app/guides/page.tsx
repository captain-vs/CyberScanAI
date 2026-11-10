import Link from "next/link"
import { guides } from "@/lib/guides"
import { GuidesBackLink } from "@/components/guides-back-link"
import { ArrowLeft, Clock, User, PlayCircle, Beaker, CheckCircle2, XCircle, Terminal, ShieldAlert, Key, Lightbulb, ChevronRight, Lock, FileCode, Server, Globe, Layers } from "lucide-react"
export const metadata = {
  title: "Cybersecurity Guides for Beginners",
  description:
    "Free beginner-friendly cybersecurity guides from SecurityX.",
}

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
        <GuidesBackLink />
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-lime-400">
          SecurityX Learning Library
        </p>

        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          Cybersecurity Guides for Beginners
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-400">
          Clear, practical cybersecurity lessons for students and beginners.
          Learn safely, protect your accounts, and understand common online risks.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <article
              key={guide.slug}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-6 transition hover:border-lime-500/50"
            >
              <p className="text-sm text-lime-400">
                {guide.level} · {guide.readTime}
              </p>

              <h2 className="mt-3 text-2xl font-semibold text-white">
                {guide.title}
              </h2>

              <p className="mt-3 leading-relaxed text-slate-400">
                {guide.description}
              </p>

              <Link
                href={`/guides/${guide.slug}`}
                className="mt-6 inline-block font-semibold text-lime-400 hover:text-lime-300"
              >
                Read guide →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}