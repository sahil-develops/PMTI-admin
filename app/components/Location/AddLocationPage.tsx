'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'

interface Country {
  id: number
  CountryName: string
  currency: string
  isActive: boolean
}

interface State {
  id: number;
  name: string;
  locations: Location[];
  country: {
    id: number;
    CountryName: string;
    currency: string;
    isActive: boolean;
  };
}

interface FormData {
  location: string
  country: string
  state: string
  addedBy: string
  updatedBy: string
  isDelete: boolean
}


export default function AddLocationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    location: '',
    country: '',
    state: '',
    addedBy: '',
    updatedBy: '',
    isDelete: false
  })

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(`https://api.4pmti.com/country`)
        const data = await response.json()
        if (data.success) {
          // Filter only active countries and sort by name
          const activeCountries = data.data
            .filter((country: Country) => country.isActive)
            .sort((a: Country, b: Country) => a.CountryName.localeCompare(b.CountryName))
          setCountries(activeCountries)
        } else {
          setError('Failed to fetch countries')
        }
      } catch (err) {
        setError('Failed to fetch countries')
      }
    }

    fetchCountries()
  }, [])

  const validateForm = () => {
    if (!formData.location.trim()) {
      setError('Location name is required')
      return false
    }
    if (!formData.country) {
      setError('Please select a country')
      return false
    }
    if (!formData.state.trim()) {
      setError('State is required')
      return false
    }
    if (!formData.addedBy.trim()) {
      setError('Added by is required')
      return false
    }
    if (!formData.updatedBy.trim()) {
      setError('Updated by is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch(`https://api.4pmti.com/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          location: formData.location,
          state: parseInt(formData.state),
          addedBy: formData.addedBy,
          updatedBy: formData.updatedBy,
          isDelete: formData.isDelete,
          country: parseInt(formData.country)
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Location added successfully",
          duration: 3000,
        })
        router.push('/location') // Redirect to locations list
      } else {
        setError(data.error || 'Failed to add location')
      }
    } catch (err) {
      setError('Failed to add location')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = async (value: string) => {
    setFormData(prev => ({ ...prev, country: value, state: '' }))
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/state/?countryId=${value}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch states');
      }

      const data = await response.json();
      if (data.success) {
        setStates(data.data);
      } else {
        setError('Failed to fetch states');
      }
    } catch (err) {
      setError('Failed to fetch states');
    }
  }

  const handleStateChange = (value: string) => {
    setFormData(prev => ({ ...prev, state: value }));
  }

  return (
    <div className="p-2">
      <Card className="max-w-full mx-auto">
        <CardHeader>
          <CardTitle>Add New Location</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

        

            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem 
                      key={country.id} 
                      value={country.id.toString()}
                    >
                      {country.CountryName} ({country.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select
                value={formData.state}
                onValueChange={handleStateChange}
                disabled={!formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.country ? "Select a state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem 
                      key={state.id} 
                      value={state.id.toString()}
                    >
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium">Location Name</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location name"
                className="w-full"
              />
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium">Added By</label>
              <Input
                name="addedBy"
                value={formData.addedBy}
                onChange={handleInputChange}
                placeholder="Enter creator name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Updated By</label>
              <Input
                name="updatedBy"
                value={formData.updatedBy}
                onChange={handleInputChange}
                placeholder="Enter updater name"
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Location'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}