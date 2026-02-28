import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PPT AI – Free AI Presentation Maker | Generate Slides in Seconds",
  description: "Turn any idea into a stunning presentation in seconds. PPT AI is the free AI-powered slide generator trusted by professionals worldwide. Export to PowerPoint (.pptx). No credit card required.",
  keywords: [
    "AI presentation maker",
    "free AI presentation maker",
    "AI PowerPoint generator",
    "AI slide maker",
    "AI pitch deck generator",
    "PPT AI",
    "Gamma alternative",
    "Beautiful.ai alternative",
    "ChatGPT for presentations",
    "create presentation with AI",
    "AI ppt maker",
    "presentation software",
    "AI presentation tool 2026",
  ],
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PPT AI",
    url: "https://pptai.online",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan: 5 presentations per month. No credit card required.",
    },
    description: "PPT AI is the free AI-powered presentation maker that turns any idea into professional slides in seconds. Export to PowerPoint (.pptx), share instantly, and customize with your brand.",
    featureList: [
      "AI-powered slide generation",
      "PowerPoint export (.pptx)",
      "Professional templates",
      "Brand kit and style customization",
      "One-click sharing",
      "PDF to PowerPoint converter",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
    sameAs: [
      "https://www.producthunt.com",
      "https://futurepedia.io",
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <ComparisonTable />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
