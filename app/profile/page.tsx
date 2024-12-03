'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from '@/components/ui/use-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Jan Novák',
    email: 'jan.novak@example.com',
    permanentCard: '1234567890',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Zde by byla logika pro uložení profilu
    toast({
      title: "Profil aktualizován",
      description: "Vaše údaje byly úspěšně uloženy.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Můj profil</h1>
      <div className="flex justify-center mb-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
          <AvatarFallback>JN</AvatarFallback>
        </Avatar>
      </div>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Osobní údaje</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Jméno</Label>
              <Input id="name" name="name" value={profile.name} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="permanentCard">Číslo permanentky</Label>
              <Input id="permanentCard" name="permanentCard" value={profile.permanentCard} onChange={handleChange} />
            </div>
            <Button type="submit" className="w-full">Uložit změny</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

