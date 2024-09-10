import type { Metadata } from "next"
import "./globals.css"
import { SkeletonTheme } from "react-loading-skeleton"
import 'react-loading-skeleton/dist/skeleton.css'

export const metadata: Metadata = {
  metadataBase: new URL("https://bonita-maquillaje.com"),
  title: "Bonita Maquillaje",
  description: "Somos una tienda virtual y física en la ciudad de Cúcuta. Te ofrecemos los productos más TOP de marcas Colombianas en maquillaje, skincare y accesorios.",
  authors: {
    name: "Rubert Gonzalez - Desarrollador web",
    url: "https://rubertweb.dev"
  },
  keywords: 'Bonita maquillaje, bonita, maquillaje, web, cucuta, tineda virtual, skincare, accesorios.',
  openGraph: {
    title: "Bonita Maquillaje",
    description: "Somos una tienda virtual y física en la ciudad de Cúcuta. Te ofrecemos los productos más TOP de marcas Colombianas en maquillaje, skincare y accesorios.",
    images: '/logo.webp',
    type: 'website',
    url: 'https://bonita-maquillaje.com/',
    siteName: 'Bonita Maquillaje'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/logo.webp" type="image/webp" />
      </head>
      <body className='antialiased bg-bg-100'>
        <main>
          <SkeletonTheme baseColor="#feeaf0" highlightColor="#fff4f4">
            {children}
          </SkeletonTheme>
        </main>
      </body>
    </html >
  )
}
