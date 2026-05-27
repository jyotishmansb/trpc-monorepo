import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ChaiForm — Build Beautiful Forms",
    template: "%s | ChaiForm",
  },
  description:
    "Create stunning, themed forms in minutes. Collect responses, analyze data, and share with the world — no login required for respondents.",
  keywords: ["form builder", "typeform alternative", "surveys", "analytics", "no-code"],
  openGraph: {
    title: "ChaiForm — Build Beautiful Forms",
    description: "Create stunning, themed forms in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <GlobalProviders>{children}</GlobalProviders>
      </body>
    </html>
  );
}
