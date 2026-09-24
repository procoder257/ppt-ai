import { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "About PPT AI | The Fastest AI Presentation Maker",
    description: "Learn about PPT AI — the free AI-powered presentation maker built for professionals, students, and startups. Discover our mission, product, and what makes us different from Gamma and Beautiful.ai.",
};

export default function AboutPage() {
    const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PPT AI",
        url: "https://pptai.online",
        description: "PPT AI is the free AI-powered presentation maker that turns any idea into professional slides in seconds. Trusted by over 10 million presenters worldwide.",
        foundingDate: "2023",
        applicationCategory: "BusinessApplication",
        sameAs: [
            "https://www.producthunt.com",
        ],
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <JsonLd data={orgSchema} />
            <Navbar />
            <main className="max-w-3xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">About PPT AI</h1>
                <p className="text-xl text-muted-foreground mb-12">
                    We&apos;re building the fastest, most accessible AI presentation tool in the world.
                </p>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
                    <section>
                        <h2>Our mission</h2>
                        <p>
                            Creating professional presentations should be fast and effortless — for everyone. Whether you&apos;re a founder building your first pitch deck, a student preparing for a class presentation, a sales rep customizing a proposal, or an executive briefing the board, the process should take minutes, not hours.
                        </p>
                        <p>
                            PPT AI was built to make that a reality. We combine advanced AI with clean design principles to generate structured, professional-quality presentations from a single prompt — and export them as fully editable PowerPoint files.
                        </p>
                    </section>

                    <section>
                        <h2>What makes PPT AI different</h2>
                        <p>
                            The AI presentation market has grown quickly, and with it a long list of tools that overpromise and underdeliver. Here&apos;s what makes PPT AI different:
                        </p>
                        <ul>
                            <li>
                                <strong>Genuinely free to start.</strong> Our free plan gives you 5 complete AI-generated presentations per month with full PowerPoint export — no credit card, no trial period, no watermarks.
                            </li>
                            <li>
                                <strong>PowerPoint export on every plan.</strong> Unlike Gamma, which requires a paid subscription for .pptx export, PPT AI gives you editable PowerPoint files from day one.
                            </li>
                            <li>
                                <strong>Speed over everything.</strong> Our pipeline is optimized for fast generation. From prompt to presentation in under 60 seconds.
                            </li>
                            <li>
                                <strong>Clean, editable output.</strong> We engineer our exports to be immediately usable in Microsoft PowerPoint and Google Slides — not just pretty screenshots.
                            </li>
                            <li>
                                <strong>PDF to PowerPoint conversion.</strong> Upload a PDF document and get a structured, summarized presentation automatically — a feature no major competitor offers on a free plan.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>Who we build for</h2>
                        <p>PPT AI is used by over 10 million presenters across every profession:</p>
                        <ul>
                            <li><strong>Startup founders</strong> building investor pitch decks</li>
                            <li><strong>Sales professionals</strong> creating personalized client proposals</li>
                            <li><strong>Students</strong> turning research papers into lecture slides</li>
                            <li><strong>Consultants</strong> summarizing reports into client-ready decks</li>
                            <li><strong>Executives</strong> preparing board and stakeholder presentations</li>
                            <li><strong>Educators</strong> building course materials and training decks</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Our values</h2>
                        <ul>
                            <li><strong>Accessibility first.</strong> Great tools shouldn&apos;t require a paid subscription to be useful. Our free plan is real.</li>
                            <li><strong>Speed matters.</strong> Every second saved on slide formatting is a second available for the work that actually matters.</li>
                            <li><strong>Honest pricing.</strong> No hidden limits, no bait-and-switch free tiers, no surprise charges.</li>
                            <li><strong>Privacy by design.</strong> Your presentation content is yours. We don&apos;t train our models on your data without consent.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Get started</h2>
                        <p>
                            The best way to understand PPT AI is to use it. Create your first presentation free — no credit card, no commitment.
                        </p>
                        <Link
                            href="/auth/signin"
                            className="inline-flex items-center justify-center h-12 px-8 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors no-underline"
                        >
                            Try PPT AI Free →
                        </Link>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
