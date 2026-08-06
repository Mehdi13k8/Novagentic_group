const SITE_URL = 'https://novagentic.fr'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'blog').order('date', 'DESC').all()

  const entries: SitemapEntry[] = [
    { loc: '/', changefreq: 'monthly', priority: '1.0' },
    { loc: '/blog', changefreq: 'weekly', priority: '0.8' },
    ...posts.map(post => ({
      loc: post.path,
      lastmod: post.date,
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${SITE_URL}${entry.loc}</loc>
${entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : ''}    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
