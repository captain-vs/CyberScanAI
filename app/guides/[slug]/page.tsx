import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getGuide, guides } from "@/lib/guides"

type GuidePageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }))
}

export async function generateMetadata(
  { params }: GuidePageProps
): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)

  if (!guide) {
    return {
      title: "Guide Not Found",
    }
  }

  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
  }
}

export default async function GuideArticlePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuide(slug)

  if (!guide) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/guides"
          className="text-sm font-medium text-lime-400 hover:text-lime-300"
        >
          ← Back to all guides
        </Link>

        <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-lime-400">
          {guide.level} · {guide.readTime}
        </p>

        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          {guide.title}
        </h1>

        <p className="mt-6 text-xl leading-relaxed text-slate-400">
          {guide.description}
        </p>

        <div className="mt-12 space-y-10">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold text-white">
                {section.heading}
              </h2>

              <div className="mt-4 space-y-4 leading-8 text-slate-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-14 rounded-2xl border border-lime-500/20 bg-lime-500/5 p-6">
          <h2 className="text-xl font-semibold text-lime-300">
            Learn responsibly
          </h2>

          <p className="mt-3 leading-relaxed text-slate-300">
            This guide is for educational use. Only test systems, accounts, and
            data that belong to you or where you have clear permission.
          </p>
        </section>
      </article>
    </main>
  )
}