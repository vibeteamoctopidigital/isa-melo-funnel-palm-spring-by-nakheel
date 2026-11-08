import type { MetadataRoute } from 'next'

const aiBots = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...aiBots.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: 'https://find.isamelorealestate.com/sitemap.xml',
  }
}
