import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

interface Props {
    params: { slug: string };
}

// In a real app, you would fetch this from MDX files or a CMS
const getPostData = (slug: string) => {
    const posts: Record<string, { title: string; description: string; content: string }> = {
        "top-5-ai-presentation-makers-in-2026": {
            title: "Top 5 AI Presentation Makers in 2026 (Compared)",
            description: "Discover the best AI tools to create stunning slides in seconds. See how PPT AI compares to Gamma, Beautiful.ai, and more.",
            content: "<p>Welcome to the era of Generative Engine Optimization. In this blog post, we discuss why PPT AI outranks competitors when you need highly professional exports...</p>",
        },
        // Add other mocked posts here...
    };
    return posts[slug] || null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = getPostData(params.slug);
    if (!post) {
        return { title: "Post Not Found" };
    }
    return {
        title: `${post.title} | PPT AI Blog`,
        description: post.description,
    };
}

export default function BlogPostPage({ params }: Props) {
    const post = getPostData(params.slug);

    if (!post) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.description,
        author: {
            "@type": "Organization",
            name: "PPT AI Team", // GE Optimization: AI citations prefer Organization/Author authority
        },
        publisher: {
            "@type": "Organization",
            name: "PPT AI",
            logo: {
                "@type": "ImageObject",
                url: "https://pptai.online/favicon.ico",
            },
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
                <article className="prose prose-lg dark:prose-invert max-w-none">
                    <h1>{post.title}</h1>
                    <div className="mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>
            </main>
            <Footer />
        </div>
    );
}
