'use client'
import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"

interface Country {
  id: number;
  CountryName: string;
  currency: string;
  isActive: boolean;
}

interface Location {
  __country__: any
  id: number
  location: string
  createdAt: string
  updateAt: string
  addedBy: string
  updatedBy: string
  isDelete: boolean
}

interface ApiResponse {
  message: string
  error: string
  success: boolean
  data: Location[]
}

export default function LocationPage() {
  const { toast } = useToast()
  const [locations, setLocations] = useState<Location[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingLocations, setUpdatingLocations] = useState<number[]>([])
  const [editingLocation, setEditingLocation] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [updatingName, setUpdatingName] = useState<number[]>([])

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://api.4pmti.com/country', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setCountries(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch countries:', err)
    }
  }

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://api.4pmti.com/location', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setLocations(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch locations')
      }
    } catch (err) {
      setError('Failed to fetch locations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
    fetchCountries()
  }, [])

  const handleStatusToggle = async (location: Location) => {
    setUpdatingLocations(prev => [...prev, location.id])
    
    try {
      const response = await fetch(`https://api.4pmti.com/location/${location.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          location: location.location,
          isDelete: !location.isDelete
        })
      })

      const data = await response.json()

      if (data.success) {
        setLocations(prevLocations =>
          prevLocations.map(loc =>
            loc.id === location.id
              ? { ...loc, isDelete: !loc.isDelete }
              : loc
          )
        )
        
        toast({
          title: "Status Updated",
          description: `Location status has been ${!location.isDelete ? 'activated' : 'deactivated'} successfully.`,
          duration: 3000,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || 'Failed to update location status',
          duration: 3000,
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to update location status',
        duration: 3000,
      })
    } finally {
      setUpdatingLocations(prev => prev.filter(id => id !== location.id))
    }
  }

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesActive = showActiveOnly ? !location.isDelete : true
    const matchesCountry = selectedCountry ? 
      location.__country__?.CountryName === selectedCountry : true
    return matchesSearch && matchesActive && matchesCountry
  })

  const LoadingSwitch = ({ checked, onChange, loading }: { checked: boolean; onChange: () => void; loading: boolean }) => (
    <div className="relative">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={loading}
        className={loading ? 'opacity-70' : ''}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-3 w-3 animate-spin" />
        </div>
      )}
    </div>
  )

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {error && (
        <div className="fixed top-4 right-4 p-4 rounded-lg shadow-lg bg-red-50 text-red-800">
          <div className="flex justify-between items-center">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-4 text-sm hover:text-opacity-75">
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold leading-none tracking-tight text-xl">
          Locations
        </p>
        <Link href="/location/addlocation">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Location
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-64">
          <Select
            value={selectedCountry}
            onValueChange={setSelectedCountry}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country?.id} value={country?.CountryName}>
                  {country?.CountryName || ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center whitespace-nowrap">
          <Switch
            id="active-only"
            checked={showActiveOnly}
            onCheckedChange={setShowActiveOnly}
            className="mr-2"
          />
          <label htmlFor="active-only">Show Active Only</label>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-zinc-200 h-16 bg-zinc-50" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.length > 0 ? (
                filteredLocations.map(location => (
                  <TableRow key={location.id}>
                    <TableCell>{location.__country__?.CountryName || ""}</TableCell>
                    <TableCell>
                      {editingLocation === location.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full"
                            autoFocus
                          />
                          {updatingName.includes(location.id) && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {location.location}
                          {updatingName.includes(location.id) && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <LoadingSwitch
                        checked={!location.isDelete}
                        onChange={() => handleStatusToggle(location)}
                        loading={updatingLocations.includes(location.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No locations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}