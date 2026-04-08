export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/api/'], // Protect internal routes
    },
    sitemap: 'https://smakresearch.com/sitemap.xml',
  }
}
