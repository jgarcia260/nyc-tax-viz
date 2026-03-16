import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NYC Tax Dollar Visualizer",
  description: "See how New York City spends its $107 billion budget",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen relative overflow-x-hidden">
        {/* Subtle radial gradient background */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent_70%)]" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(139,92,246,0.08),transparent_60%)]" />
        {children}
      </body>
    </html>
  );
}
