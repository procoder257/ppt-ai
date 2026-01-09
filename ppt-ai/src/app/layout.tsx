import NextAuthProvider from "@/provider/NextAuthProvider";
import TanStackQueryProvider from "@/provider/TanstackProvider";
import { CSPostHogProvider } from "@/lib/providers/PostHogProvider";
import { ThemeProvider } from "@/provider/theme-provider";
import "@/styles/globals.css";
import { type Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

import { env } from "@/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXTAUTH_URL),
  title: {
    default: "PPT AI - #1 AI Presentation Maker (Gamma Substitute)",
    template: "%s | PPT AI",
  },
  description:
    "The best free AI PPT maker. Create professional slides in seconds. Better than Gamma, Genspark, and Presentation.ai. Export to editable PowerPoint (PPTX).",
  keywords: [
    "AI PPT maker",
    "AI presentation generator",
    "Text to PPT AI",
    "AI slide creator",
    "Gamma AI alternative",
    "Genspark alternative",
    "Presentation.ai alternative",
    "PopAi presentation",
    "Beautiful.ai free alternative",
    "AI powerpoint maker",
    "generate slides from text",
    "automated pitch decks",
    "free ppt maker",
    "free ai ppt",
    "free ai slides",
    "pdf to ppt",
    "free presentation maker",
    "convert pdf to ppt ai",
  ],
  authors: [{ name: "PPT AI Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "PPT AI - Create Professional Presentations with AI",
    description:
      "Transform your ideas into stunning presentations in seconds. The smart alternative to Gamma and PowerPoint.",
    siteName: "PPT AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "PPT AI - #1 AI Presentation Maker",
    description:
      "Create stunning, professional presentations in seconds with PPT AI. Better than Gamma.",
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TanStackQueryProvider>
      <NextAuthProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${fontSans.variable} font-sans antialiased`}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <CSPostHogProvider>{children}</CSPostHogProvider>
            </ThemeProvider>
          </body>
        </html>
      </NextAuthProvider>
    </TanStackQueryProvider>
  );
}
