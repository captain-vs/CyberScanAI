import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cybersecurity GameZone & Beginner CTFs",
  description: "Learn hacking basics, play interactive cybersecurity games, and climb the leaderboard in the SecurityX GameZone.",
};

export default function GameZoneLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}