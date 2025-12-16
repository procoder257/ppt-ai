import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PPT AI - Create Professional Presentations with AI",
  description: "Transform your ideas into stunning presentations in seconds. The #1 AI-powered slide generator for professionals. Export to PPTX.",
  keywords: ["AI ppt maker", "Ai slide maker", "generator", "Chatgpt for ppt", "gamma_ai", "ppt ai", "presentation software"]
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
