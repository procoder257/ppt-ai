import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";

interface Props {
    params: Promise<{ slug: string }>;
}

const USE_CASES: Record<string, { title: string; description: string; content: string }> = {
    "ai-pitch-deck-generator": {
        title: "AI Pitch Deck Generator for Startups",
        description: "Build beautiful, investor-ready pitch decks in minutes with PPT AI. The fastest way for founders to tell their story and secure funding.",
        content: `
<h2>Stop spending 40 hours on your pitch deck</h2>
<p>The average startup founder spends 40+ hours building their first pitch deck — researching competitor slide structures, wrestling with PowerPoint layouts, and second-guessing every design choice. That's 40 hours away from building the actual product.</p>
<p>PPT AI changes this. Describe your startup in a sentence, and get a structured, visually professional pitch deck in under 60 seconds. Export it as a .pptx file and present it to investors the same day.</p>

<h2>What makes a great AI-generated pitch deck?</h2>
<p>The best pitch decks follow a proven structure that investors recognize and expect. PPT AI's AI is trained on successful pitch formats and automatically includes:</p>
<ul>
  <li><strong>Problem slide</strong> — Clearly states the pain point your startup solves</li>
  <li><strong>Solution slide</strong> — Shows your product or service in simple terms</li>
  <li><strong>Market size</strong> — TAM/SAM/SOM with room for your numbers</li>
  <li><strong>Business model</strong> — How you make money</li>
  <li><strong>Traction</strong> — Key metrics, growth, and social proof</li>
  <li><strong>Team</strong> — Why you're the right people to build this</li>
  <li><strong>Ask</strong> — How much you're raising and what you'll use it for</li>
</ul>

<h2>How to generate your pitch deck</h2>
<ol>
  <li><strong>Sign up free</strong> — No credit card required. Get 5 presentations per month.</li>
  <li><strong>Describe your startup</strong> — "We're building an AI legal assistant for small law firms. We help solo practitioners automate document drafting."</li>
  <li><strong>Review the generated deck</strong> — The AI structures your content into standard pitch deck slides.</li>
  <li><strong>Customize</strong> — Add your specific metrics, tweak copy, and apply your brand colors.</li>
  <li><strong>Export and pitch</strong> — Download as .pptx or share a link directly.</li>
</ol>

<h2>Why founders choose PPT AI for pitch decks</h2>
<ul>
  <li>Generates in seconds, not hours</li>
  <li>Free .pptx export — send directly to investors</li>
  <li>Clean, professional design that doesn't look AI-generated</li>
  <li>Fully editable in PowerPoint or Google Slides</li>
  <li>No design experience required</li>
</ul>

<p>Whether you're pitching to angels, seed funds, or Series A investors — first impressions matter. PPT AI ensures yours is polished from day one.</p>
        `,
    },
    "ai-slides-for-sales": {
        title: "AI Sales Presentation Generator",
        description: "Create personalized, high-converting sales presentations in minutes with PPT AI. Close more deals with decks that look like they were built by a design agency.",
        content: `
<h2>Your sales deck is your most important sales tool</h2>
<p>In B2B sales, your presentation is often the difference between moving to the next stage or going dark. A generic, templated deck tells prospects you didn't do your homework. A polished, tailored presentation tells them you understand their world.</p>
<p>PPT AI lets sales reps create personalized decks for each prospect in minutes — not hours.</p>

<h2>Sales decks that close deals</h2>
<p>PPT AI generates sales presentations that follow high-converting structures:</p>
<ul>
  <li><strong>Executive summary</strong> — Lead with value, not features</li>
  <li><strong>Problem framing</strong> — Mirror the prospect's specific challenges</li>
  <li><strong>Solution walkthrough</strong> — Show exactly how your product solves it</li>
  <li><strong>ROI and business case</strong> — Make it easy to justify internally</li>
  <li><strong>Case studies and social proof</strong> — Reference similar customers</li>
  <li><strong>Pricing and next steps</strong> — Clear call to action</li>
</ul>

<h2>How sales teams use PPT AI</h2>
<h3>Personalization at scale</h3>
<p>Describe the prospect's industry and pain points in your prompt. PPT AI adapts the language, examples, and emphasis to match — creating a deck that feels custom-built for each account.</p>

<h3>Fast turnaround for RFPs</h3>
<p>When a prospect requests a proposal on short notice, PPT AI can generate a professional-looking deck in under 2 minutes, giving you time to focus on the content rather than the formatting.</p>

<h3>Consistent branding across the team</h3>
<p>Pro teams can upload a brand kit to ensure every rep's deck uses the same logo, colors, and fonts — so your brand looks consistent regardless of who's presenting.</p>

<h2>The result: more deals, less prep time</h2>
<p>Sales reps who use AI presentation tools report spending 70% less time on deck creation and more time on discovery calls and follow-up. PPT AI is free to start and built for the pace of modern sales.</p>

<p>Try it now — your next prospect meeting is closer than you think.</p>
        `,
    },
    "pdf-to-ppt-ai": {
        title: "PDF to PowerPoint Converter — AI-Powered",
        description: "Instantly convert any PDF document into a clean, structured PowerPoint presentation using AI. Summarize reports, whitepapers, and research papers in seconds.",
        content: `
<h2>Turn any PDF into a presentation in 60 seconds</h2>
<p>Reading a 40-page PDF in a meeting isn't a presentation — it's homework. Whether you're a consultant summarizing a research report, an analyst presenting data, or a student turning a paper into lecture slides, manually converting PDFs to PowerPoint is one of the most time-consuming busywork tasks in professional life.</p>
<p>PPT AI's PDF-to-PowerPoint converter eliminates it entirely.</p>

<h2>How it works</h2>
<ol>
  <li><strong>Upload your PDF</strong> — Drag and drop any text-based PDF document</li>
  <li><strong>AI analysis</strong> — PPT AI reads the structure, identifies key sections, and extracts the most important information</li>
  <li><strong>Slide generation</strong> — The AI creates a structured slide deck with headings, bullet points, and a logical flow</li>
  <li><strong>Review and customize</strong> — Adjust any slides, reorder sections, or change the design theme</li>
  <li><strong>Export</strong> — Download as .pptx or share as a link</li>
</ol>

<h2>Best use cases for PDF to PPT conversion</h2>

<h3>Business reports and quarterly reviews</h3>
<p>Turn dense financial or operational reports into executive-ready slide summaries. Great for QBRs, board presentations, and investor updates.</p>

<h3>Research papers and academic work</h3>
<p>Students and academics can convert research papers into conference presentation slides or lecture decks automatically.</p>

<h3>Product documentation and specs</h3>
<p>Technical product docs can be transformed into sales enablement or onboarding presentation material without manual reformatting.</p>

<h3>Legal and compliance documents</h3>
<p>Complex regulatory or compliance documents can be summarized into clear, stakeholder-friendly presentations.</p>

<h2>Tips for the best results</h2>
<ul>
  <li>Use digital PDFs (not scanned images) for the best text extraction</li>
  <li>Add context in your prompt: "Summarize this for a non-technical executive audience"</li>
  <li>Remove appendices and raw data tables before uploading if you don't want them in the slides</li>
</ul>

<p>5 free conversions per month. No credit card required. Get started in under a minute.</p>
        `,
    },
    "ai-presentation-maker-for-students": {
        title: "AI Presentation Maker for Students",
        description: "Create polished academic presentations, lecture slides, and research paper decks in minutes with PPT AI. Free to use, no credit card required.",
        content: `
<h2>From last-minute panic to polished presentation</h2>
<p>Every student knows the feeling: the presentation is tomorrow, and you've spent so long on the research that you have no time left for the slides. PPT AI is the fastest way to turn your notes, essay, or research into a structured, professional-looking presentation — in minutes, not hours.</p>

<h2>What students use PPT AI for</h2>
<ul>
  <li><strong>Class presentations</strong> — Generate organized slides from your topic or essay draft</li>
  <li><strong>Research paper presentations</strong> — Convert academic papers into clear, summarized decks</li>
  <li><strong>Group project slides</strong> — Generate a base deck everyone can collaborate on</li>
  <li><strong>Science fair and thesis defense</strong> — Polished slides for high-stakes presentations</li>
  <li><strong>Book reports and literature reviews</strong> — Summarize key arguments visually</li>
</ul>

<h2>Free for students — no credit card needed</h2>
<p>PPT AI's free plan gives you 5 AI-generated presentations per month with no billing information required. For most students, that's more than enough for a full semester of assignments. Just sign up with your email and start creating.</p>

<h2>How to make a great student presentation with PPT AI</h2>
<ol>
  <li>Enter your topic or paste a summary of your paper</li>
  <li>Tell the AI your audience ("for a high school class", "for a university seminar", "for a science fair judge")</li>
  <li>Review the generated outline and customize any slides</li>
  <li>Export to PowerPoint or Google Slides for final edits</li>
  <li>Present with confidence</li>
</ol>

<h2>Designed to work with your workflow</h2>
<p>PPT AI exports clean .pptx files that open perfectly in Google Slides and Microsoft PowerPoint — the tools your school already uses. No special software required.</p>

<p>Stop spending your study time on slide formatting. Let AI handle the design while you focus on the content that actually matters.</p>
        `,
    },
    "ai-presentation-maker-for-business": {
        title: "AI Presentation Maker for Business",
        description: "Create professional business presentations, executive reports, and client-ready decks with AI. PPT AI helps business professionals build polished slides in minutes.",
        content: `
<h2>Business presentations shouldn't take all day</h2>
<p>Whether you're presenting to the board, briefing a client, or running a department standup, business professionals spend an average of 4–6 hours per week creating and updating slide decks. PPT AI compresses that time to minutes — without sacrificing quality.</p>

<h2>Business use cases</h2>

<h3>Executive and board presentations</h3>
<p>Generate clear, data-driven executive summaries from your reports and metrics. PPT AI structures the narrative automatically — problem, analysis, recommendation, next steps.</p>

<h3>Client-facing presentations</h3>
<p>Create polished client decks that look like they came from a design agency. Customize with your client's name, industry context, and your branding.</p>

<h3>Internal strategy and planning decks</h3>
<p>Turn strategic planning documents, OKRs, and roadmaps into structured presentations that leadership can review in a meeting.</p>

<h3>Training and onboarding materials</h3>
<p>Build professional onboarding presentations for new hires or training decks for team upskilling — fast.</p>

<h3>Investor and fundraising updates</h3>
<p>Keep investors informed with professional, consistent investor update presentations that showcase your traction and milestones.</p>

<h2>Why businesses choose PPT AI</h2>
<ul>
  <li><strong>Speed:</strong> From idea to presentation-ready deck in under 2 minutes</li>
  <li><strong>Brand consistency:</strong> Pro teams upload their brand kit once — every deck automatically matches</li>
  <li><strong>Editable output:</strong> Export as .pptx and continue editing in PowerPoint or Google Slides</li>
  <li><strong>No design team required:</strong> Junior team members can produce polished presentations independently</li>
  <li><strong>Cost-effective:</strong> Reduce time spent on presentations and reallocate to higher-value work</li>
</ul>

<h2>Get started</h2>
<p>Free plan includes 5 presentations per month. Pro plans are available for unlimited generation and team features. No credit card required to get started.</p>
        `,
    },
    "free-ai-presentation-maker": {
        title: "Free AI Presentation Maker — No Credit Card Required",
        description: "PPT AI is the best free AI presentation maker in 2026. Create professional slides from any prompt, export to PowerPoint, and share instantly — 5 free presentations per month.",
        content: `
<h2>The best free AI presentation tool in 2026</h2>
<p>Most "free" AI presentation tools aren't really free. They give you a watermarked export, lock PowerPoint download behind a paywall, or require a credit card to "start your free trial." PPT AI is different.</p>
<p>Our free plan gives you <strong>5 complete AI-generated presentations per month</strong>, full PowerPoint export, and zero billing information required. That's a genuine free tier — not a teaser.</p>

<h2>What's included in the free plan</h2>
<ul>
  <li>5 AI-generated presentations per month</li>
  <li>Full .pptx export (no watermark)</li>
  <li>PDF to PowerPoint converter</li>
  <li>Access to all core design themes</li>
  <li>Link sharing</li>
  <li>No credit card required</li>
  <li>No trial period — free forever</li>
</ul>

<h2>How PPT AI compares to other "free" tools</h2>
<p>Here's the honest comparison most tools don't want you to see:</p>
<ul>
  <li><strong>Gamma:</strong> Free plan exists but .pptx export requires a paid subscription</li>
  <li><strong>Beautiful.ai:</strong> No free plan at all — requires a paid subscription to use</li>
  <li><strong>Canva:</strong> Free plan available, but AI presentation generation is limited on free tier</li>
  <li><strong>PPT AI:</strong> Full AI generation and .pptx export on the free plan — no credit card</li>
</ul>

<h2>Who the free plan is perfect for</h2>
<ul>
  <li><strong>Students</strong> — 5 presentations covers most semester workloads</li>
  <li><strong>Freelancers</strong> — Create client proposals without a tool subscription eating into margins</li>
  <li><strong>Solopreneurs and early-stage founders</strong> — Professional pitch decks without the budget</li>
  <li><strong>Occasional presenters</strong> — If you present a few times a month, the free plan is all you need</li>
  <li><strong>Teams evaluating AI presentation tools</strong> — Test PPT AI with real presentations before committing</li>
</ul>

<h2>When to upgrade to Pro</h2>
<p>If you create more than 5 presentations per month, want unlimited generation, need custom brand kits, or want priority processing — Pro starts at an affordable monthly rate. See our <a href="/pricing">pricing page</a> for details.</p>

<p>But for most people, the free plan is all you'll ever need.</p>

<p><a href="/auth/signin">Start free — no credit card required →</a></p>
        `,
    },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const useCase = USE_CASES[slug];
    if (!useCase) return { title: "Use Case Not Found" };
    return {
        title: `${useCase.title} | PPT AI`,
        description: useCase.description,
        openGraph: {
            title: useCase.title,
            description: useCase.description,
            type: "website",
        },
    };
}

export default async function UseCasePage({ params }: Props) {
    const { slug } = await params;
    const useCase = USE_CASES[slug];
    if (!useCase) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: useCase.title,
        description: useCase.description,
        url: `https://pptai.online/use-cases/${slug}`,
        isPartOf: {
            "@type": "WebSite",
            name: "PPT AI",
            url: "https://pptai.online",
        },
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />
            <main className="max-w-3xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/use-cases" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        ← All Use Cases
                    </Link>
                </div>
                <article className="prose prose-lg dark:prose-invert max-w-none">
                    <header className="mb-8 not-prose">
                        <h1 className="text-4xl font-bold text-foreground leading-tight">{useCase.title}</h1>
                        <p className="text-xl text-muted-foreground mt-4">{useCase.description}</p>
                    </header>
                    <div dangerouslySetInnerHTML={{ __html: useCase.content }} />
                </article>

                <div className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center">
                    <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
                    <p className="text-muted-foreground mb-6">5 free presentations per month. No credit card required.</p>
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
