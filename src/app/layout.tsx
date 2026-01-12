import type { Metadata } from "next"
import { IBM_Plex_Sans } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import "./globals.css"

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sales Huddle | AmeriFab Inc.",
  description: "Customer Dossier Tracker - Know Before You Go",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.className} antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
