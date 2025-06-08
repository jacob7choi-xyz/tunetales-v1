import './globals.css'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TuneTales - Discover the Stories Behind the Music',
  description: 'Embark on an exquisite musical odyssey',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}