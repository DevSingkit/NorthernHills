import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Northern Hills Veterinary Clinic',
  description: 'Community spay and neuter outreach program for cats and dogs across Taguig City. Register your pet online or walk in on event day.',
  keywords: 'spay neuter taguig veterinary clinic outreach free low cost cats dogs',
  authors: [{ name: 'Northern Hills Veterinary Clinic' }],
  openGraph: {
    title: 'Northern Hills Veterinary Clinic',
    description: 'Low-cost spay and neuter outreach for cats and dogs in Taguig City.',
    type: 'website',
    locale: 'en_PH',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a0a2e" />
        <link rel="icon" href="/FUR.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}