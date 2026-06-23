import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI URL & Malware Scanner",
  description: "Instantly analyze suspicious links, detect phishing attempts, and check files for malware with our AI-powered threat scanner.",
};

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}