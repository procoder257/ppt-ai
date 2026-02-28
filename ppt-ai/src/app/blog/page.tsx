import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
    title: "PPT AI Blog | Articles on AI Presentations & Public Speaking",
    description: "Read the latest articles on how AI is revolutionizing presentations, slide creation, and professional communications. Better than Gamma.",
};

const DUMMY_POSTS = [
    {
        slug: "top-5-ai-presentation-makers-in-2026",
        title: "Top 5 AI Presentation Makers in 2026 (Compared)",
        date: "February 28, 2026",
        readTime: "8 min read",
        excerpt: "Discover the best AI tools to create stunning slides in seconds. See how PPT AI compares to Gamma, Beautiful.ai, Canva, and more — with honest pros and cons for each.",
    },
    {
        slug: "how-to-make-powerpoint-from-pdf-ai",
        title: "How to Make a PowerPoint from a PDF using AI (2026 Guide)",
        date: "February 25, 2026",
        readTime: "6 min read",
        excerpt: "Learn the fastest way to convert your long PDF reports into actionable, engaging presentation decks using Generative AI — step by step.",
    },
    {
        slug: "gamma-alternative-why-professionals-switching",
        title: "Gamma Alternative: Why Professionals Are Switching to PPT AI in 2026",
        date: "February 20, 2026",
        readTime: "7 min read",
        excerpt: "A deep dive into why startup founders, sales teams, and enterprise professionals are choosing PPT AI over Gamma for their pitch decks and sales presentations.",
    },
];

export default function BlogHubPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-4">PPT AI Blog</h1>
                <p className="text-xl text-muted-foreground mb-12">
                    Insights, guides, and updates on the future of AI-powered presentations.
                </p>

                <div className="grid gap-8">
                    {DUMMY_POSTS.map((post) => (
                        <article key={post.slug} className="p-6 border rounded-xl hover:shadow-lg hover:border-primary/30 transition-all duration-200 group">
                            <Link href={`/blog/${post.slug}`} className="block">
                                <div className="flex items-center gap-3 mb-3">
                                    <time className="text-sm text-muted-foreground">{post.date}</time>
                                    <span className="text-muted-foreground/50">·</span>
                                    <span className="text-sm text-muted-foreground">{post.readTime}</span>
                                </div>
                                <h2 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
                                <p className="text-muted-foreground">{post.excerpt}</p>
                                <span className="mt-4 text-primary text-sm font-medium inline-flex items-center">
                                    Read article
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </Link>
                        </article>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
