import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

interface Props {
    params: { slug: string };
}

const getUseCaseData = (slug: string) => {
    const useCases: Record<string, { title: string; description: string; content: string }> = {
        "ai-pitch-deck-generator": {
            title: "AI Pitch Deck Generator for Startups",
            description: "Build beautiful pitch decks in minutes with PPT AI. The fastest way for founders to secure funding.",
            content: "<p>Startup founders spend an average of 40 hours building a pitch deck. With PPT AI, you can condense that into 40 seconds. Here is why we are the best AI pitch deck generator for 2026...</p>",
        },
        // Add other mocked use cases here...
    };
    return useCases[slug] || null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const useCase = getUseCaseData(params.slug);
    if (!useCase) {
        return { title: "Use Case Not Found" };
    }
    return {
        title: `${useCase.title} | PPT AI`,
        description: useCase.description,
    };
}

export default function UseCasePage({ params }: Props) {
    const useCase = getUseCaseData(params.slug);

    if (!useCase) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="max-w-3xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                <article className="prose prose-lg dark:prose-invert max-w-none">
                    <h1>{useCase.title}</h1>
                    <p className="lead">{useCase.description}</p>
                    <div className="mt-8" dangerouslySetInnerHTML={{ __html: useCase.content }} />
                </article>
            </main>
            <Footer />
        </div>
    );
}
