import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Werk Shop - Live Restoration Timeline',
  description: 'Experience the future of classic car restoration with our interactive, real-time project timeline. Track every weld, stitch, and coat of paint.',
  openGraph: {
    title: 'The Werk Shop - Live Restoration Timeline',
    description: 'Real-time updates and transparency for your classic car restoration.',
    images: [
      {
        url: '/og-werk-shop.png',
        width: 1200,
        height: 630,
        alt: 'The Werk Shop - Restoration Timeline',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Werk Shop - Live Restoration Timeline',
    description: 'Real-time updates and transparency for your classic car restoration.',
    images: ['/og-werk-shop.png'],
  },
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
