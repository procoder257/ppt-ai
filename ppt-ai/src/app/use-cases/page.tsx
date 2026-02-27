import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "PPT AI Use Cases | AI Templates for Every Profession",
    description: "Explore how different professionals use PPT AI to generate pitch decks, sales presentations, educational slides, and more.",
};

const USE_CASES = [
    {
        slug: "ai-pitch-deck-generator",
        title: "AI Pitch Deck Generator for Startups",
        excerpt: "Generate compelling, investor-ready pitch decks in seconds. Let our AI handle the design while you focus on the story.",
    },
    {
        slug: "ai-slides-for-sales",
        title: "AI Sales Presentations",
        excerpt: "Close more deals with highly personalized sales proposals and presentation decks tailored to your prospects.",
    },
    {
        slug: "pdf-to-ppt-ai",
        title: "PDF to PPT Converter",
        excerpt: "Instantly transform lengthy PDF documents, whitepapers, and reports into clean, summarized PowerPoint presentations.",
    },
];

export default function UseCasesHubPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-4">PPT AI Use Cases</h1>
                <p className="text-xl text-muted-foreground mb-12">
                    Discover how AI-powered presentations can accelerate your workflow.
                </p>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {USE_CASES.map((useCase) => (
                        <div key={useCase.slug} className="p-6 border rounded-xl hover:shadow-lg transition-shadow flex flex-col h-full">
                            <h2 className="text-2xl font-semibold mb-3">{useCase.title}</h2>
                            <p className="text-muted-foreground mb-6 flex-grow">{useCase.excerpt}</p>
                            <Link href={`/use-cases/${useCase.slug}`} className="text-primary font-medium hover:underline inline-flex items-center mt-auto">
                                Explore Use Case
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
