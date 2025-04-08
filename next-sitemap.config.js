/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://one-campus.vercel.app',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://one-campus.vercel.app/sitemap.xml',
    ],
  },
  exclude: ['/api/*'],
} 