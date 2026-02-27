import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/lib/UserContext'
import { ChatWidget } from '@/components/ChatWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NovaMart - Find the Best Deals Across Platforms',
  description: 'Compare prices across Amazon, Flipkart, and Meesho to find the best deals. Features include AI value scores, price history charts, trust scores, and price alerts.',
  keywords: 'price comparison, amazon, flipkart, meesho, best deals, shopping, online shopping, price tracker, price history',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          {children}
        </UserProvider>
        <ChatWidget />
      </body>
    </html>
  )
}
