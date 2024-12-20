import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Home, Ticket, Camera, RefreshCw } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kompenzo - Refundace za zpoždění v ČR',
  description: 'Mobilní aplikace pro žádosti o refundaci za zpoždění vlaků a autobusů v České republice',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className={`${inter.className} bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <header className="glass-effect p-4 fixed top-0 left-0 right-0 z-10">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-800">Kompenzo</h1>
              <Link href="/profile">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
                  <AvatarFallback>JN</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
          <main className="flex-grow pt-20 pb-20">{children}</main>
          <div className="fixed bottom-4 left-4 right-4 pointer-events-none">
            <nav className="container mx-auto floating-nav rounded-full p-4 pointer-events-auto">
              <div className="flex justify-between items-center">
                <Link href="/" className="flex flex-col items-center text-blue-600">
                  <Home className="h-6 w-6" />
                  <span className="text-xs">Domů</span>
                </Link>
                <Link href="/tickets" className="flex flex-col items-center text-blue-600">
                  <Ticket className="h-6 w-6" />
                  <span className="text-xs">Jízdenky</span>
                </Link>
                <Link href="/scan-ticket" className="flex flex-col items-center text-blue-600">
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Skenovat</span>
                </Link>
                <Link href="/refunds" className="flex flex-col items-center text-blue-600">
                  <RefreshCw className="h-6 w-6" />
                  <span className="text-xs">Refundace</span>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </body>
    </html>
  )
}

