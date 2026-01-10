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
    url: "/",
    title: "PPT AI - AI-Powered Presentation Generator",
    description:
      "Create stunning, professional presentations in seconds with PPT AI. Transform your ideas into engaging slides automatically.",
    siteName: "PPT AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "PPT AI - AI-Powered Presentation Generator",
    description:
      "Create stunning, professional presentations in seconds with PPT AI.",
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
