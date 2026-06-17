import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniPilot - AI Admissions Strategist",
  description: "Your personalized AI-powered university admissions platform. Profile analysis, university matching, and month-by-month roadmaps.",
  keywords: ["university admissions", "AI", "college applications", "SAT", "IELTS"],
  openGraph: {
    title: "UniPilot",
    description: "Your AI Admissions Strategist",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-surface-0 text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
