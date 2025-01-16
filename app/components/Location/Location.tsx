'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
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

interface Location {
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
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingLocations, setUpdatingLocations] = useState<number[]>([])
  const [editingLocation, setEditingLocation] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [updatingName, setUpdatingName] = useState<number[]>([])

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

  const handleDoubleClick = (location: Location) => {
    setEditingLocation(location.id)
    setEditValue(location.location)
  }

  const handleUpdateLocation = async (locationId: number) => {
    if (editValue.trim() === '') return

    setUpdatingName(prev => [...prev, locationId])
    
    try {
      const response = await fetch(`https://api.4pmti.com/location/${locationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          location: editValue.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        setLocations(prevLocations =>
          prevLocations.map(loc =>
            loc.id === locationId
              ? { ...loc, location: editValue.trim() }
              : loc
          )
        )
        
        toast({
          title: "Location Updated",
          description: "Location name has been updated successfully.",
          duration: 3000,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || 'Failed to update location name',
          duration: 3000,
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to update location name',
        duration: 3000,
      })
    } finally {
      setUpdatingName(prev => prev.filter(id => id !== locationId))
      setEditingLocation(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, locationId: number) => {
    if (e.key === 'Enter') {
      handleUpdateLocation(locationId)
    } else if (e.key === 'Escape') {
      setEditingLocation(null)
    }
  }

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesActive = showActiveOnly ? !location.isDelete : true
    return matchesSearch && matchesActive
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
          <button className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700">
            <Plus className="text-white w-8" />
            Add Location
          </button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search locations..."
          className="border border-zinc-300 rounded px-4 py-2 w-11/12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <label className="flex items-center ml-4 whitespace-nowrap">
          <input
            type="checkbox"
            className="mr-2"
            checked={showActiveOnly}
            onChange={() => setShowActiveOnly(!showActiveOnly)}
          />
          Show Active Only
        </label>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-zinc-200 h-16 bg-zinc-50" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-40">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Added By</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Updated By</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Created At</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Updated At</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredLocations.length > 0 ? (
                filteredLocations.map(location => (
                  <tr key={location.id} className="hover:bg-zinc-50">
                    <td 
                      className="px-4 py-4 text-sm text-zinc-600"
                      onDoubleClick={() => handleDoubleClick(location)}
                    >
                      {editingLocation === location.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, location.id)}
                            onBlur={() => handleUpdateLocation(location.id)}
                            className="border border-zinc-300 rounded px-2 py-1 w-full"
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
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-600">{location.addedBy}</td>
                    <td className="px-4 py-4 text-sm text-zinc-600">{location.updatedBy}</td>
                    <td className="px-4 py-4 text-sm text-zinc-600">{formatDate(location.createdAt)}</td>
                    <td className="px-4 py-4 text-sm text-zinc-600">{formatDate(location.updateAt)}</td>
                    <td className="px-4 py-4 text-sm text-zinc-600">
                      <div className="flex items-center justify-between gap-2">
                        <LoadingSwitch
                          checked={!location.isDelete}
                          onChange={() => handleStatusToggle(location)}
                          loading={updatingLocations.includes(location.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}