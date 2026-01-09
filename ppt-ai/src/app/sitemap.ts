import { MetadataRoute } from 'next'
import { env } from "@/env";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = env.NEXTAUTH_URL;

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
            priority: 0.8,
        },
        {
            url: `${baseUrl}/auth/signin`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        // Add other public routes as needed
    ]
}
