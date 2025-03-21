'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Upload, Info, PlusCircle, Search, Train } from 'lucide-react'
import { ticketService } from '@/lib/api-supabase'
import { CarrierType, TransportType, TicketType } from '@/lib/types'
import { cdApiService, CdLocation, CdConnection } from '@/lib/services/cd-api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from '@/components/ui/card'

// Schéma validace formuláře
const ticketSchema = z.object({
  transportType: z.enum(['train', 'bus'] as const),
  carrier: z.enum(['cd', 'regiojet', 'flixbus', 'other'] as const),
  routeNumber: z.string().min(1, 'Číslo spoje je povinné'),
  departureStation: z.string().min(1, 'Zadejte stanici odjezdu'),
  arrivalStation: z.string().min(1, 'Zadejte stanici příjezdu'),
  departureDate: z.string().min(1, 'Vyberte datum odjezdu'),
  departureTime: z.string().min(1, 'Zadejte čas odjezdu'),
  arrivalDate: z.string().min(1, 'Vyberte datum příjezdu'),
  arrivalTime: z.string().min(1, 'Zadejte čas příjezdu'),
  price: z.coerce.number().min(1, 'Zadejte cenu jízdenky'),
  type: z.enum(['digital', 'scanned'] as const),
  delayMinutes: z.coerce.number().min(0, 'Zpoždění nemůže být záporné')
})

type TicketFormData = z.infer<typeof ticketSchema>

export default function AddTicketPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<TicketFormData>({
    transportType: 'train',
    carrier: 'cd',
    routeNumber: '',
    departureStation: '',
    arrivalStation: '',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '',
    arrivalDate: new Date().toISOString().split('T')[0],
    arrivalTime: '',
    price: 0,
    type: 'digital',
    delayMinutes: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ticketFile, setTicketFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showConnectionSearch, setShowConnectionSearch] = useState(false)
  const [searchFromQuery, setSearchFromQuery] = useState('')
  const [searchToQuery, setSearchToQuery] = useState('')
  const [fromLocations, setFromLocations] = useState<CdLocation[]>([])
  const [toLocations, setToLocations] = useState<CdLocation[]>([])
  const [selectedFromLocation, setSelectedFromLocation] = useState<CdLocation | null>(null)
  const [selectedToLocation, setSelectedToLocation] = useState<CdLocation | null>(null)
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0])
  const [connections, setConnections] = useState<CdConnection[]>([])
  const [isSearchingLocations, setIsSearchingLocations] = useState(false)
  const [isSearchingConnections, setIsSearchingConnections] = useState(false)

  // Funkce pro zpracování změn textových polí
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Vyčištění chyby pro toto pole
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Funkce pro zpracování změn select polí
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Vyčištění chyby pro toto pole
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Funkce pro zpracování nahrání souboru
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setTicketFile(file)
      
      // Vytvoření náhledu
      const reader = new FileReader()
      reader.onload = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Funkce pro otevření dialogu pro výběr souboru
  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Funkce pro odstranění souboru
  const handleRemoveFile = () => {
    setTicketFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const searchLocations = async (type: 'from' | 'to', query: string) => {
    if (query.length < 2) return
    
    setIsSearchingLocations(true)
    try {
      const locations = await cdApiService.searchLocations(query)
      if (type === 'from') {
        setFromLocations(locations)
      } else {
        setToLocations(locations)
      }
    } catch (error) {
      console.error('Chyba při vyhledávání stanic:', error)
    } finally {
      setIsSearchingLocations(false)
    }
  }

  const searchConnections = async () => {
    if (!selectedFromLocation || !selectedToLocation) return
    
    setIsSearchingConnections(true)
    try {
      const connections = await cdApiService.searchConnections(
        selectedFromLocation.id,
        selectedToLocation.id,
        searchDate
      )
      setConnections(connections)
    } catch (error) {
      console.error('Chyba při vyhledávání spojení:', error)
    } finally {
      setIsSearchingConnections(false)
    }
  }

  const selectConnection = (connection: CdConnection) => {
    // Použijeme první vlak ve spojení
    const train = connection.trains[0]
    
    // Extrahujeme hodiny a minuty z času
    const departureTime = train.trainData.from.time.split(':').slice(0, 2).join(':')
    const arrivalTime = train.trainData.to.time.split(':').slice(0, 2).join(':')
    
    // Nastavíme data do formuláře
    setFormData(prev => ({
      ...prev,
      transportType: 'train',
      carrier: 'cd',
      routeNumber: `${train.trainData.type}${train.trainData.number}`,
      departureStation: train.trainData.from.name,
      arrivalStation: train.trainData.to.name,
      departureTime,
      arrivalTime,
      price: connection.priceOffers?.offers?.[0]?.price 
        ? Math.round(connection.priceOffers.offers[0].price / 100) 
        : prev.price
    }))
    
    // Zavřeme dialog
    setShowConnectionSearch(false)
  }

  // Funkce pro odeslání formuláře
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated || !currentUser?.id) {
      router.push('/login')
      return
    }
    
    try {
      const validatedData = ticketSchema.parse(formData)
      setErrors({})
      
      setIsLoading(true)
      setSubmitMessage(null)
      
      let imageUrl: string | null = null
      if (ticketFile && formData.type === 'scanned') {
        // Zde by byla logika pro nahrání souboru na server
        // Pro ukázku pouze simulujeme nahrání
        try {
          // Simulace nahrání souboru
          await new Promise(resolve => setTimeout(resolve, 1000))
          imageUrl = URL.createObjectURL(ticketFile)
        } catch (error) {
          setSubmitMessage({
            type: 'error',
            text: 'Nepodařilo se nahrát sken jízdenky.'
          })
          setIsLoading(false)
          return
        }
      }
      
      // Přidání jízdenky
      const ticket = await ticketService.createTicket({
        userId: currentUser.id,
        transportType: validatedData.transportType,
        carrier: validatedData.carrier,
        type: validatedData.type,
        routeNumber: validatedData.routeNumber,
        departureStation: validatedData.departureStation,
        arrivalStation: validatedData.arrivalStation,
        departureDate: validatedData.departureDate,
        departureTime: validatedData.departureTime,
        arrivalDate: validatedData.arrivalDate,
        arrivalTime: validatedData.arrivalTime,
        price: Number(validatedData.price),
        status: 'active',
        delayMinutes: 0,
        imageUrl: imageUrl || undefined
      })
      
      if (ticket) {
        setSubmitMessage({
          type: 'success',
          text: 'Jízdenka byla úspěšně přidána.'
        })
        
        setTimeout(() => {
          router.push('/tickets')
        }, 1500)
      } else {
        setSubmitMessage({
          type: 'error',
          text: 'Při ukládání jízdenky došlo k chybě.'
        })
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        err.errors.forEach(error => {
          if (error.path) {
            fieldErrors[error.path[0]] = error.message
          }
        })
        setErrors(fieldErrors)
        
        setSubmitMessage({
          type: 'error',
          text: 'Formulář obsahuje chyby.'
        })
      } else {
        setSubmitMessage({
          type: 'error',
          text: 'Při zpracování požadavku došlo k chybě.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Získání dnešního data ve formátu YYYY-MM-DD pro omezení výběru data
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Přidat jízdenku</h1>
      
      {submitMessage && (
        <div className={`p-4 mb-6 rounded-lg text-white ${submitMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {submitMessage.text}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {!isAuthenticated ? (
            <div className="text-center py-8">
              <p className="mb-4">Pro přidání jízdenky se musíte přihlásit</p>
              <Button onClick={() => router.push('/login')}>Přihlásit se</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Detaily jízdenky</h2>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowConnectionSearch(true)}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Vyhledat spojení
                </Button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-2">
                <h2 className="font-semibold mb-3 flex items-center">
                  <Info className="mr-2 h-4 w-4 text-blue-500" />
                  Základní údaje
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transportType">Typ dopravy</Label>
                    <RadioGroup 
                      id="transportType"
                      value={formData.transportType} 
                      onValueChange={(value) => handleSelectChange('transportType', value)}
                      className="flex space-x-4 mt-1"
                    >
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="train" id="train" />
                        <Label htmlFor="train" className="font-normal">Vlak</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RadioGroupItem value="bus" id="bus" />
                        <Label htmlFor="bus" className="font-normal">Autobus</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="carrier">Dopravce</Label>
                    <Select 
                      value={formData.carrier} 
                      onValueChange={(value) => handleSelectChange('carrier', value)}
                    >
                      <SelectTrigger id="carrier">
                        <SelectValue placeholder="Vyberte dopravce" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cd">České dráhy</SelectItem>
                        <SelectItem value="regiojet">RegioJet</SelectItem>
                        <SelectItem value="flixbus">FlixBus</SelectItem>
                        <SelectItem value="other">Jiný</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="routeNumber">Číslo spoje</Label>
                  <Input 
                    id="routeNumber"
                    name="routeNumber" 
                    value={formData.routeNumber} 
                    onChange={handleChange} 
                    placeholder="např. EC 173, R 885, apod."
                    className={errors.routeNumber ? "border-red-500" : ""}
                  />
                  {errors.routeNumber && <p className="text-red-500 text-sm mt-1">{errors.routeNumber}</p>}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departureStation">Stanice odjezdu</Label>
                    <Input 
                      id="departureStation"
                      name="departureStation" 
                      value={formData.departureStation} 
                      onChange={handleChange} 
                      placeholder="Odkud"
                      className={errors.departureStation ? "border-red-500" : ""}
                    />
                    {errors.departureStation && <p className="text-red-500 text-sm mt-1">{errors.departureStation}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="arrivalStation">Stanice příjezdu</Label>
                    <Input 
                      id="arrivalStation"
                      name="arrivalStation" 
                      value={formData.arrivalStation} 
                      onChange={handleChange} 
                      placeholder="Kam"
                      className={errors.arrivalStation ? "border-red-500" : ""}
                    />
                    {errors.arrivalStation && <p className="text-red-500 text-sm mt-1">{errors.arrivalStation}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="departureDate">Datum odjezdu</Label>
                    <Input 
                      id="departureDate"
                      name="departureDate" 
                      type="date" 
                      max={today}
                      value={formData.departureDate} 
                      onChange={handleChange} 
                      className={errors.departureDate ? "border-red-500" : ""}
                    />
                    {errors.departureDate && <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="departureTime">Čas odjezdu</Label>
                    <Input 
                      id="departureTime"
                      name="departureTime" 
                      type="time" 
                      value={formData.departureTime} 
                      onChange={handleChange} 
                      className={errors.departureTime ? "border-red-500" : ""}
                    />
                    {errors.departureTime && <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="arrivalDate">Datum příjezdu</Label>
                    <Input 
                      id="arrivalDate"
                      name="arrivalDate" 
                      type="date" 
                      max={today}
                      value={formData.arrivalDate} 
                      onChange={handleChange} 
                      className={errors.arrivalDate ? "border-red-500" : ""}
                    />
                    {errors.arrivalDate && <p className="text-red-500 text-sm mt-1">{errors.arrivalDate}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="arrivalTime">Čas příjezdu</Label>
                    <Input 
                      id="arrivalTime"
                      name="arrivalTime" 
                      type="time" 
                      value={formData.arrivalTime} 
                      onChange={handleChange} 
                      className={errors.arrivalTime ? "border-red-500" : ""}
                    />
                    {errors.arrivalTime && <p className="text-red-500 text-sm mt-1">{errors.arrivalTime}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Cena jízdenky (Kč)</Label>
                    <Input 
                      id="price"
                      name="price" 
                      type="number" 
                      min="0"
                      value={formData.price || ''} 
                      onChange={handleChange} 
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="delayMinutes">Zpoždění (min)</Label>
                    <Input 
                      id="delayMinutes"
                      name="delayMinutes" 
                      type="number" 
                      min="0"
                      value={formData.delayMinutes || ''} 
                      onChange={handleChange} 
                      className={errors.delayMinutes ? "border-red-500" : ""}
                    />
                    {errors.delayMinutes && <p className="text-red-500 text-sm mt-1">{errors.delayMinutes}</p>}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="type">Typ jízdenky</Label>
                  <RadioGroup 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="digital" id="digital" />
                      <Label htmlFor="digital" className="font-normal">Elektronická jízdenka (bez nahrání)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scanned" id="scanned" />
                      <Label htmlFor="scanned" className="font-normal">Skenovaná jízdenka (s nahráním)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {formData.type === 'scanned' && (
                  <div>
                    <Label htmlFor="ticketFile" className="block mb-2">Nahrát sken jízdenky</Label>
                    <input 
                      type="file" 
                      id="ticketFile" 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    
                    {!filePreview ? (
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                        onClick={handleFileUploadClick}
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm font-medium text-gray-900">Klikněte pro výběr souboru</p>
                        <p className="mt-1 text-xs text-gray-500">PNG, JPG, PDF do 10MB</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">{ticketFile?.name}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleRemoveFile}
                            className="text-red-500 hover:text-red-700"
                          >
                            Odstranit
                          </Button>
                        </div>
                        
                        {ticketFile?.type.startsWith('image/') && (
                          <div className="mt-2 rounded border overflow-hidden">
                            <img 
                              src={filePreview} 
                              alt="Náhled jízdenky" 
                              className="max-h-40 w-auto mx-auto"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Dialog pro vyhledávání spojení */}
              <Dialog open={showConnectionSearch} onOpenChange={setShowConnectionSearch}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Vyhledání spojení</DialogTitle>
                    <DialogDescription>
                      Zadejte stanice a datum pro vyhledání spojení
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromStation">Z</Label>
                        <div className="relative">
                          <Input
                            id="fromStation"
                            placeholder="Zadejte stanici odjezdu"
                            value={searchFromQuery}
                            onChange={(e) => {
                              setSearchFromQuery(e.target.value)
                              searchLocations('from', e.target.value)
                            }}
                          />
                          {isSearchingLocations && (
                            <div className="absolute right-2 top-2">
                              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            </div>
                          )}
                        </div>
                        {fromLocations.length > 0 && !selectedFromLocation && (
                          <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto w-full">
                            {fromLocations.map((location) => (
                              <div
                                key={location.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setSelectedFromLocation(location)
                                  setSearchFromQuery(location.name)
                                  setFromLocations([])
                                }}
                              >
                                {location.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="toStation">Do</Label>
                        <div className="relative">
                          <Input
                            id="toStation"
                            placeholder="Zadejte stanici příjezdu"
                            value={searchToQuery}
                            onChange={(e) => {
                              setSearchToQuery(e.target.value)
                              searchLocations('to', e.target.value)
                            }}
                          />
                          {isSearchingLocations && (
                            <div className="absolute right-2 top-2">
                              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            </div>
                          )}
                        </div>
                        {toLocations.length > 0 && !selectedToLocation && (
                          <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto w-full">
                            {toLocations.map((location) => (
                              <div
                                key={location.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setSelectedToLocation(location)
                                  setSearchToQuery(location.name)
                                  setToLocations([])
                                }}
                              >
                                {location.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="searchDate">Datum odjezdu</Label>
                      <Input
                        id="searchDate"
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                      />
                    </div>
                    
                    <Button
                      type="button"
                      onClick={searchConnections}
                      disabled={!selectedFromLocation || !selectedToLocation || isSearchingConnections}
                    >
                      {isSearchingConnections ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Vyhledávám...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Vyhledat spojení
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {connections.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Nalezené spoje:</h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {connections.map((connection) => (
                          <Card 
                            key={connection.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => selectConnection(connection)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Train className="h-5 w-5 text-blue-500" />
                                  <span className="font-medium">
                                    {connection.trains[0].trainData.type}
                                    {connection.trains[0].trainData.number}
                                  </span>
                                </div>
                                
                                <div className="text-right">
                                  <span className="text-sm text-gray-500">Cena: </span>
                                  <span className="font-medium">
                                    {connection.priceOffers?.offers?.[0]?.price 
                                      ? Math.round(connection.priceOffers.offers[0].price / 100) 
                                      : "?"} Kč
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-x-4 mt-2">
                                <div>
                                  <p className="text-xs text-gray-500">Odjezd</p>
                                  <p className="font-medium">
                                    {connection.trains[0].trainData.from.time} - {connection.trains[0].trainData.from.name}
                                  </p>
                                </div>
                                
                                <div>
                                  <p className="text-xs text-gray-500">Příjezd</p>
                                  <p className="font-medium">
                                    {connection.trains[0].trainData.to.time} - {connection.trains[0].trainData.to.name}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowConnectionSearch(false)}
                    >
                      Zavřít
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ukládám...
                    </>
                  ) : (
                    "Uložit jízdenku"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 