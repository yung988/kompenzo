'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/components/ui/use-toast'

export default function SubmitClaim() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    transportType: 'train',
    routeNumber: '',
    departureDate: '',
    departureTime: '',
    delayMinutes: '',
  })
  const [ticketFile, setTicketFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTicketFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Submitting claim:', { ...formData, ticketFile })
    toast({
      title: "Žádost odeslána",
      description: "Vaše žádost o refundaci byla úspěšně odeslána.",
    })
    router.push('/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Podat žádost o refundaci</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Jméno</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <Label>Typ dopravy</Label>
          <RadioGroup defaultValue="train" onValueChange={(value) => setFormData({ ...formData, transportType: value })}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="train" id="train" />
              <Label htmlFor="train">Vlak</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bus" id="bus" />
              <Label htmlFor="bus">Autobus</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label htmlFor="routeNumber">Číslo spoje</Label>
          <Input id="routeNumber" name="routeNumber" value={formData.routeNumber} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="departureDate">Datum odjezdu</Label>
          <Input id="departureDate" name="departureDate" type="date" value={formData.departureDate} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="departureTime">Čas odjezdu</Label>
          <Input id="departureTime" name="departureTime" type="time" value={formData.departureTime} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="delayMinutes">Zpoždění (v minutách)</Label>
          <Input id="delayMinutes" name="delayMinutes" type="number" min="60" value={formData.delayMinutes} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="ticketScan">Naskenovaná jízdenka</Label>
          <Input id="ticketScan" name="ticketScan" type="file" onChange={handleFileChange} accept="image/*" />
        </div>
        <Button type="submit">Odeslat žádost</Button>
      </form>
    </div>
  )
}

