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
        date: "2026-02-28",
        excerpt: "Discover the best AI tools to create stunning slides in seconds. See how PPT AI compares to Gamma, Beautiful.ai, and more.",
    },
    {
        slug: "how-to-make-powerpoint-from-pdf-ai",
        title: "How to Make a PowerPoint from a PDF using AI",
        date: "2026-02-25",
        excerpt: "Learn the fastest way to convert your long PDF reports into actionable, engaging presentation decks using Generative AI.",
    },
    {
        slug: "gamma-alternative-why-professionals-switching",
        title: "Gamma Alternative: Why Professionals are Switching to PPT AI",
        date: "2026-02-20",
        excerpt: "A deep dive into why enterprise users and startup founders prefer PPT AI for their highly crucial pitch decks and sales materials.",
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
                        <article key={post.slug} className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
                            <Link href={`/blog/${post.slug}`} className="block">
                                <time className="text-sm text-muted-foreground">{post.date}</time>
                                <h2 className="text-2xl font-semibold mt-2 mb-3 group-hover:text-primary">{post.title}</h2>
                                <p className="text-muted-foreground">{post.excerpt}</p>
                            </Link>
                        </article>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
