import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "PPT AI Use Cases | AI Presentations for Business, Students & More",
    description: "Discover how professionals, students, and businesses use PPT AI to create pitch decks, sales presentations, academic slides, and more — in seconds.",
};

const USE_CASES = [
    {
        slug: "ai-presentation-maker-for-business",
        title: "AI Presentation Maker for Business",
        excerpt: "Create executive reports, client decks, and internal strategy presentations in minutes. Professional output, no design skills needed.",
        tag: "Business",
    },
    {
        slug: "ai-pitch-deck-generator",
        title: "AI Pitch Deck Generator for Startups",
        excerpt: "Generate compelling, investor-ready pitch decks in seconds. Let our AI handle the structure and design while you focus on your story.",
        tag: "Startups",
    },
    {
        slug: "ai-slides-for-sales",
        title: "AI Sales Presentations",
        excerpt: "Close more deals with highly personalized sales proposals and presentation decks tailored to your prospects — created in minutes.",
        tag: "Sales",
    },
    {
        slug: "ai-presentation-maker-for-students",
        title: "AI Presentation Maker for Students",
        excerpt: "Turn your research, essays, and notes into polished academic presentations. Free to use, no credit card required.",
        tag: "Education",
    },
    {
        slug: "pdf-to-ppt-ai",
        title: "PDF to PowerPoint Converter",
        excerpt: "Instantly transform lengthy PDF documents, whitepapers, and reports into clean, summarized PowerPoint presentations.",
        tag: "Productivity",
    },
    {
        slug: "free-ai-presentation-maker",
        title: "Free AI Presentation Maker",
        excerpt: "5 free AI-generated presentations per month. Full PowerPoint export. No credit card. No trial period. The best free AI presentation tool in 2026.",
        tag: "Free",
    },
];

export default function UseCasesHubPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="max-w-5xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">PPT AI for every workflow</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Whether you're a founder, student, sales rep, or executive — PPT AI adapts to your use case and delivers professional presentations in seconds.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {USE_CASES.map((useCase) => (
                        <Link
                            key={useCase.slug}
                            href={`/use-cases/${useCase.slug}`}
                            className="p-6 border rounded-xl hover:shadow-lg hover:border-primary/30 transition-all duration-200 flex flex-col h-full group"
                        >
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full w-fit mb-4">
                                {useCase.tag}
                            </span>
                            <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{useCase.title}</h2>
                            <p className="text-muted-foreground text-sm flex-grow">{useCase.excerpt}</p>
                            <span className="mt-4 text-primary text-sm font-medium inline-flex items-center">
                                Learn more
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="mt-20 text-center p-12 bg-primary/5 border border-primary/20 rounded-2xl">
                    <h2 className="text-3xl font-bold mb-3">Ready to build your next presentation?</h2>
                    <p className="text-muted-foreground mb-8">5 free presentations per month. No credit card required.</p>
                    <Link
                        href="/auth/signin"
                        className="inline-flex items-center justify-center h-12 px-8 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        Try PPT AI Free →
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
