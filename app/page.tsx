import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Banknote, Clock, User } from 'lucide-react'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-800">Vítejte v Kompenzo!</h1>
      <p className="text-center mb-8 text-gray-600">Získejte zpět své peníze za zpožděné cesty snadno a rychle</p>
      <div className="space-y-4">
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-blue-800 mb-2">Moje jízdenky</h2>
                <p className="text-gray-600">Spravujte své jízdenky a sledujte zpoždění</p>
              </div>
              <Clock className="h-12 w-12 text-blue-500" />
            </div>
            <Link href="/tickets" className="mt-4 inline-block">
              <Button className="w-full">
                Zobrazit jízdenky
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-blue-800 mb-2">Moje refundace</h2>
                <p className="text-gray-600">Zkontrolujte stav vašich žádostí o refundaci</p>
              </div>
              <Banknote className="h-12 w-12 text-green-500" />
            </div>
            <Link href="/refunds" className="mt-4 inline-block">
              <Button className="w-full">
                Zobrazit refundace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-blue-800 mb-2">Můj profil</h2>
                <p className="text-gray-600">Upravte své osobní údaje a permanentku</p>
              </div>
              <User className="h-12 w-12 text-purple-500" />
            </div>
            <Link href="/profile" className="mt-4 inline-block">
              <Button className="w-full">
                Upravit profil
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

