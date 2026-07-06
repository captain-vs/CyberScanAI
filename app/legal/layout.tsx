import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal, Privacy & Terms of Service",
  description: "Read the CyberScan AI Terms of Service, Privacy Policy, and Educational Use Disclaimer.",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}