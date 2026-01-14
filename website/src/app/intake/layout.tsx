import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Signal",
  description:
    "Share project ideas, stories about freedom tech, or feedback on the Libertas platform. Every submission is reviewed by our research pipeline.",
  openGraph: {
    title: "Submit a Signal | Libertas",
    description:
      "Share project ideas, stories about freedom tech, or feedback. Every submission is reviewed by our research pipeline.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Submit a Signal | Libertas",
    description:
      "Share project ideas, stories about freedom tech, or feedback. Every submission is reviewed by our research pipeline.",
  },
};

export default function IntakeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
