import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

const siteUrl = 'https://find.isamelorealestate.com'
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Palm Springs by Nakheel | Jebel Ali, Dubai',
  description: 'Palm Springs by Nakheel in Jebel Ali: 3 and 4 bedroom townhouses, 4 and 5 bedroom villas, from AED 3.8M. Answer 3 questions and get the unit list on WhatsApp.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Isamelo Real Estate',
    title: 'Palm Springs by Nakheel | Jebel Ali, Dubai',
    description: 'Palm Springs by Nakheel in Jebel Ali: 3 and 4 bedroom townhouses, 4 and 5 bedroom villas, from AED 3.8M. Answer 3 questions and get the unit list on WhatsApp.',
    locale: 'en_US',
    images: [
      {
        url: '/images/hero-aerial.jpg',
        alt: 'Aerial view of Palm Springs, Jebel Ali',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palm Springs by Nakheel | Jebel Ali, Dubai',
    description: 'Palm Springs by Nakheel in Jebel Ali: townhouses and villas from AED 3.8M. Answer 3 questions and get the unit list on WhatsApp.',
    images: ['/images/hero-aerial.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/samelo-logo.png',
        type: 'image/png',
      },
    ],
    apple: '/samelo-logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0A1322',
}

const agentSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'Isamelo Real Estate',
  url: siteUrl,
  logo: `${siteUrl}/samelo-logo.png`,
  image: `${siteUrl}/isa-melo-agent.jpg`,
  areaServed: { '@type': 'City', name: 'Dubai' },
  knowsAbout: [
    'Palm Springs by Nakheel',
    'Jebel Ali property',
    'Palm Jebel Ali',
    'Off-plan property Dubai',
    'Dubai Golden Visa',
    'Dubai property payment plans',
  ],
}

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Isamelo Real Estate',
  url: siteUrl,
  inLanguage: ['en', 'pt-BR', 'es'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&display=swap"
        />
      </head>
      <body>
        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`,
          }} />
        )}
        {children}
        {metaPixelId && (
          <noscript>
            <img height="1" width="1" style={{ display: 'none' }} alt="" src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`} />
          </noscript>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(agentSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
