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
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXTAUTH_URL),
  title: {
    default: "PPT AI - AI-Powered Presentation Generator",
    template: "%s | PPT AI",
  },
  description:
    "Create stunning, professional presentations in seconds with PPT AI. Transform your ideas into engaging slides automatically.",
  keywords: [
    "AI presentation",
    "slide generator",
    "powerpoint AI",
    "automated slides",
    "pitch deck creator",
    "PPT AI",
  ],
  authors: [{ name: "PPT AI Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pptai.online",
    title: "PPT AI - AI-Powered Presentation Generator",
    description:
      "Create stunning, professional presentations in seconds with PPT AI. Transform your ideas into engaging slides automatically.",
    siteName: "PPT AI",
    images: [
      {
        url: "https://pptai.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "PPT AI – AI Presentation Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PPT AI - AI-Powered Presentation Generator",
    description:
      "Create stunning, professional presentations in seconds with PPT AI.",
    images: ["https://pptai.online/og-image.png"],
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "add-google-verification-code-here",
  },
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
            <JsonLd
              data={{
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  name: "PPT AI",
                  url: "https://pptai.online",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://pptai.online/search?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                }}
            />
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <CSPostHogProvider>{children}</CSPostHogProvider>
            </ThemeProvider>
          </body>
        </html>
      </NextAuthProvider>
    </TanStackQueryProvider>
  );
}
