import Link from "next/link"
import { ArrowLeft, AlertTriangle, FileText, Shield } from "lucide-react"

export default function LegalPage() {
  const lastUpdated = "November 3, 2026"

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-slate-300 md:py-20">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-lime-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="mb-12 border-b border-slate-800 pb-8">
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Legal, Privacy & Terms
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </p>

          <p className="mt-4 max-w-3xl leading-relaxed text-slate-400">
            SecurityX is an educational cybersecurity learning platform. It was
            previously known as CyberScan AI.
          </p>
        </header>

        <section className="mb-12 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="flex items-center gap-3 text-xl font-semibold text-amber-300">
            <AlertTriangle className="h-5 w-5" />
            Educational use notice
          </h2>

          <p className="mt-4 leading-relaxed text-slate-300">
            SecurityX is intended for cybersecurity education, guided practice,
            and awareness. Some features, including OSINT-related experiences,
            use educational simulations or example data. They are not a source
            of live breach intelligence, professional security assessments, or
            real-time threat guarantees.
          </p>

          <p className="mt-4 leading-relaxed text-slate-300">
            Never use SecurityX to target, scan, investigate, harass, or access
            a person, account, device, network, or website without clear
            permission from its owner.
          </p>
        </section>

        <section id="terms" className="mb-14 scroll-mt-24">
          <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
            <FileText className="h-7 w-7 text-blue-400" />
            Terms of Use
          </h2>

          <div className="mt-6 space-y-6 leading-relaxed text-slate-400">
            <div>
              <h3 className="text-lg font-semibold text-white">
                1. Acceptance
              </h3>
              <p className="mt-2">
                By using SecurityX, you agree to use the platform lawfully and
                responsibly. If you do not agree with these terms, please do not
                use the platform.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                2. Permitted use
              </h3>
              <p className="mt-2">
                SecurityX may be used for personal learning, cybersecurity
                awareness, and authorised educational practice. You must not use
                the platform to attack systems, collect personal data without
                permission, distribute malware, evade security controls, or
                assist unlawful activity.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                3. No professional security guarantee
              </h3>
              <p className="mt-2">
                SecurityX does not replace a qualified cybersecurity
                professional, incident-response provider, antivirus product, or
                professional penetration test. Results, explanations, and
                educational simulations should not be treated as a final
                security verdict.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                4. Accounts and user content
              </h3>
              <p className="mt-2">
                You are responsible for the information you enter into your
                account and for keeping your sign-in details secure. Do not
                submit confidential files, passwords, private keys, financial
                information, or sensitive personal data to platform tools.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                5. Changes or access restrictions
              </h3>
              <p className="mt-2">
                Features may change, be improved, paused, or removed as the
                platform develops. Access may be restricted when needed to
                protect users, the platform, or applicable law.
              </p>
            </div>
          </div>
        </section>

        <section id="privacy" className="scroll-mt-24">
          <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
            <Shield className="h-7 w-7 text-emerald-400" />
            Privacy Policy
          </h2>

          <div className="mt-6 space-y-6 leading-relaxed text-slate-400">
            <div>
              <h3 className="text-lg font-semibold text-white">
                1. Information we collect
              </h3>
              <p className="mt-2">
                When you create an account, SecurityX may process information
                needed to operate the account, such as your email address,
                display name, profile information, learning progress, and
                platform activity. Information you voluntarily submit through
                forms, messages, or feedback may also be processed.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                2. How information is used
              </h3>
              <p className="mt-2">
                Information is used to provide authentication, save learning
                progress, operate platform features, respond to support
                requests, improve reliability, and protect the platform from
                misuse.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                3. Service providers
              </h3>
              <p className="mt-2">
                SecurityX uses third-party services to operate parts of the
                platform. These may include Firebase for authentication and
                database services, Vercel for website hosting and performance
                services, and Web3Forms for support-form delivery. When you use
                a feature that sends information to an external service, that
                service may process the information according to its own privacy
                policy.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                4. Tool inputs
              </h3>
              <p className="mt-2">
                Do not submit sensitive, confidential, or personal information
                to scanning, analysis, chat, or educational tools. Tool inputs
                may be processed by SecurityX or relevant service providers to
                deliver the requested feature.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                5. Cookies and advertising
              </h3>
              <p className="mt-2">
                SecurityX may use essential browser storage, cookies, or similar
                technologies to provide account sessions and improve the
                platform. If advertising is enabled in the future, this policy
                will be updated to explain the advertising technologies and
                choices available to visitors.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                6. Contact
              </h3>
              <p className="mt-2">
                For privacy questions, support, or requests related to your
                account, contact{" "}
                <a
                  href="mailto:customercare@securityx.in"
                  className="text-lime-400 underline underline-offset-4 hover:text-lime-300"
                >
                  customercare@securityx.in
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}