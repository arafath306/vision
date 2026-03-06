import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skyxvision.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/dashboard/', '/leader/', '/trainer/', '/api/', '/u/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
