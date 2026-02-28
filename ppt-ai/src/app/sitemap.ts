import { MetadataRoute } from 'next'
import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = env.NEXTAUTH_URL;

    const blogSlugs = [
        "top-5-ai-presentation-makers-in-2026",
        "how-to-make-powerpoint-from-pdf-ai",
        "gamma-alternative-why-professionals-switching",
    ];

    const useCaseSlugs = [
        "ai-pitch-deck-generator",
        "ai-slides-for-sales",
        "pdf-to-ppt-ai",
        "ai-presentation-maker-for-students",
        "ai-presentation-maker-for-business",
        "free-ai-presentation-maker",
    ];

    const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
    }));

    const useCaseRoutes: MetadataRoute.Sitemap = useCaseSlugs.map((slug) => ({
        url: `${baseUrl}/use-cases/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/use-cases`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/cookies`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/auth/signin`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        ...blogRoutes,
        ...useCaseRoutes,
    ]
}
