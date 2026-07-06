import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Directory & Site Map",
  description: "Navigate the complete SecurityX platform. Access our threat scanners, advanced OSINT tools, GameZone challenges, and education hubs.",
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}