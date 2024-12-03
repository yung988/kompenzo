'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/hooks/use-toast'
import { Camera, Upload } from 'lucide-react'
import Image from 'next/image'
export default function ScanTicketPage() {
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setScannedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleScanClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Jízdenka naskenována",
      description: "Vaše jízdenka byla úspěšně naskenována a uložena.",
    })
    setScannedImage(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Naskenovat jízdenku</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            {scannedImage ? (
              <Image src={scannedImage} alt="Naskenovaná jízdenka" className="max-w-full max-h-full object-contain" />
            ) : (
              <Camera className="h-24 w-24 text-gray-400" />
            )}
          </div>
          <Input
            id="ticketScan"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            accept="image/*"
          />
          <Button type="button" onClick={handleScanClick} className="w-full max-w-xs">
            {scannedImage ? (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Změnit naskenovanou jízdenku
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Naskenovat jízdenku
              </>
            )}
          </Button>
        </div>
        {scannedImage && (
          <Button type="submit" className="w-full max-w-xs mx-auto block">Uložit naskenovanou jízdenku</Button>
        )}
      </form>
    </div>
  )
}

