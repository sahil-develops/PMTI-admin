"use client";

import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Briefcase, Mail, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Interfaces
interface Location {
  id: number;
  location: string;
  addedBy: string;
  updatedBy: string;
  isDelete: boolean;
  createdAt: string;
  updateAt: string;
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
    addedBy: number;
    updatedBy: number | null;
  };
}

interface Country {
  id: number;
  CountryName: string;
  currency: string;
  isActive: boolean;
  addedBy: number;
  updatedBy: number | null;
  __locations__: Location[];
}

interface FormData {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  companyName: string;
  profession: string;
  referredBy: string;
  email: string;
  password: string;
  countryId: string;
  stateId: string;
  locationId: string;
}

const AddStudent = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State for location data
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<Location[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
    companyName: "",
    profession: "",
    referredBy: "",
    email: "",
    password: "",
    countryId: "52", // Default to US
    stateId: "",
    locationId: "",
  });

  // Initial data fetch
  useEffect(() => {
    fetchDropdownData();
    fetchStates("52"); // Fetch US states by default
  }, []);

  const fetchDropdownData = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      };

      const response = await fetch(`https://api.4pmti.com/country`, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }

      const countriesData = await response.json();

      setCountries(countriesData.data.map((country: any) => ({
        id: country.id,
        CountryName: country.CountryName,
        currency: country.currency,
        isActive: country.isActive,
        addedBy: country.addedBy,
        updatedBy: country.updatedBy,
        __locations__: country.__locations__,
      })));

      // Set initial US locations
      const unitedStates = countriesData.data.find((country: any) => country.id === 52);
      if (unitedStates && unitedStates.__locations__) {
        const sortedLocations = [...unitedStates.__locations__].sort((a, b) => 
          a.location.localeCompare(b.location)
        );
        setCities(sortedLocations);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast({
        title: "Error",
        description: "Failed to load location data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDropdowns(false);
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      const response = await fetch(
        `https://api.4pmti.com/state/?countryId=${countryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch states');
      }

      const data = await response.json();
      setStates(data.data);
    } catch (error) {
      console.error('Error fetching states:', error);
      toast({
        title: "Error",
        description: "Failed to load states",
        variant: "destructive",
      });
    }
  };

  const handleCountryChange = async (countryId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      countryId, 
      stateId: '', 
      locationId: '',
      country: countries.find(c => c.id.toString() === countryId)?.CountryName || '',
      state: '',
      city: ''
    }));
    
    // Reset states and cities
    setStates([]);
    setCities([]);
    
    // Fetch states for selected country
    fetchStates(countryId);
  };

  const handleStateChange = async (stateId: string) => {
    const selectedState = states.find(s => s.id.toString() === stateId);
    setFormData(prev => ({ 
      ...prev, 
      stateId, 
      locationId: '',
      state: selectedState?.name || '',
      city: ''
    }));

    try {
      const response = await fetch(
        `https://api.4pmti.com/location?countryId=${formData.countryId}&stateId=${stateId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      const sortedLocations = [...data.data].sort((a, b) => 
        a.location.localeCompare(b.location)
      );
      setCities(sortedLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to load cities",
        variant: "destructive",
      });
      setCities([]);
    }
  };

  const handleLocationChange = (locationId: string) => {
    const selectedLocation = cities.find(c => c.id.toString() === locationId);
    setFormData(prev => ({ 
      ...prev, 
      locationId,
      city: selectedLocation?.location || ''
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (formData.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (!formData.state) {
      newErrors.state = "State is required";
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
    }
    if (!formData.zipCode) {
      newErrors.zipCode = "Zip code is required";
    }
    if (!formData.companyName) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.profession) {
      newErrors.profession = "Profession is required";
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (formData.password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters and contain both letters and numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`https://api.4pmti.com/auth/signup/student`, {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        phone: formData.phone,
        companyName: formData.companyName,
        profession: formData.profession,
        referredBy: formData.referredBy,
        email: formData.email.toLowerCase(),
        signupDate: new Date().toISOString(),
        downloadedInfoPac: true,
        addedBy: 'admin',
        updatedBy: 'admin',
        isDelete: false,
        active: true,
        lastLogin: new Date().toISOString(),
      });

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Success",
          description: "Student added successfully!",
        });
        // Reset form
        setFormData({
          name: "",
          address: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          phone: "",
          companyName: "",
          profession: "",
          referredBy: "",
          email: "",
          password: "",
          countryId: "52",
          stateId: "",
          locationId: "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.status === 500 && error.response?.data?.error === 'This Email Already Exists'
          ? 'This email is already registered. Please try another email address.'
          : 'Something went wrong. Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading component
  const Loader = () => (
    <div className="h-9 bg-zinc-100 rounded animate-pulse" />
  );

  return (
    <Card className="w-full max-w-full mx-auto">
      <CardHeader>
        <CardTitle>Add New Student</CardTitle>
        <CardDescription>Fill in the student details to create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Personal Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-9 h-9"
                  placeholder="Full Name"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9 h-9"
                  placeholder="Email"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9 h-9"
                  placeholder="Password"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Location Information */}
            <div className="space-y-2">
              <Label>Country</Label>
              {isLoadingDropdowns ? (
                <Loader />
              ) : (
                <Select
                  value={formData.countryId}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem 
                        key={country.id} 
                        value={country.id.toString()}
                      >
                        {country.CountryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.country && (
                <p className="text-xs text-red-500">{errors.country}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>State</Label>
              {isLoadingDropdowns ? (
  <Loader />
) : (
  <Select
    value={formData.stateId}
    onValueChange={handleStateChange}
    disabled={!formData.countryId}
  >
    <SelectTrigger>
      <SelectValue placeholder={formData.countryId ? "Select State" : "Select Country First"} />
    </SelectTrigger>
    <SelectContent>
      {states.length > 0 ? (
        states.map((state) => (
          <SelectItem 
            key={state.id} 
            value={state.id.toString()}
          >
            {state.name}
          </SelectItem>
        ))
      ) : (
        <SelectItem value="no-states" disabled>
          No states available
        </SelectItem>
      )}
    </SelectContent>
  </Select>
)}
{errors.state && (
  <p className="text-xs text-red-500">{errors.state}</p>
)}
</div>

<div className="space-y-2">
<Label>City</Label>
{isLoadingDropdowns ? (
  <Loader />
) : (
  <Select
    value={formData.locationId}
    onValueChange={handleLocationChange}
    disabled={!formData.stateId}
  >
    <SelectTrigger>
      <SelectValue placeholder={
        !formData.countryId 
          ? "Select Country First" 
          : !formData.stateId 
            ? "Select State First"
            : "Select City"
      } />
    </SelectTrigger>
    <SelectContent>
      {cities && cities.length > 0 ? (
        cities.map((city) => (
          <SelectItem 
            key={city.id} 
            value={city.id.toString()}
            className={city.isDelete ? 'text-zinc-400' : ''}
          >
            {city.location}
            {city.isDelete && ' (Inactive)'}
          </SelectItem>
        ))
      ) : (
        <SelectItem value="no-locations" disabled>
          No cities available
        </SelectItem>
      )}
    </SelectContent>
  </Select>
)}
{errors.city && (
  <p className="text-xs text-red-500">{errors.city}</p>
)}
</div>

<div className="space-y-2">
<Label htmlFor="address">Address</Label>
<div className="relative">
  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    id="address"
    name="address"
    value={formData.address}
    onChange={handleChange}
    className="pl-9 h-9"
    placeholder="Address"
  />
</div>
{errors.address && (
  <p className="text-xs text-red-500">{errors.address}</p>
)}
</div>

<div className="space-y-2">
<Label htmlFor="zipCode">Zip Code</Label>
<div className="relative">
  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    id="zipCode"
    name="zipCode"
    value={formData.zipCode}
    onChange={handleChange}
    className="pl-9 h-9"
    placeholder="Zip Code"
  />
</div>
{errors.zipCode && (
  <p className="text-xs text-red-500">{errors.zipCode}</p>
)}
</div>

<div className="space-y-2">
<Label htmlFor="phone">Phone</Label>
<div className="relative">
  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    id="phone"
    name="phone"
    value={formData.phone}
    onChange={handleChange}
    className="pl-9 h-9"
    placeholder="XXX-XXX-XXXX"
  />
</div>
{errors.phone && (
  <p className="text-xs text-red-500">{errors.phone}</p>
)}
</div>

<div className="space-y-2">
<Label htmlFor="companyName">Company</Label>
<div className="relative">
  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    id="companyName"
    name="companyName"
    value={formData.companyName}
    onChange={handleChange}
    className="pl-9 h-9"
    placeholder="Company Name"
  />
</div>
{errors.companyName && (
  <p className="text-xs text-red-500">{errors.companyName}</p>
)}
</div>

<div className="space-y-2">
<Label htmlFor="profession">Profession</Label>
<div className="relative">
  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    id="profession"
    name="profession"
    value={formData.profession}
    onChange={handleChange}
    className="pl-9 h-9"
    placeholder="Profession"
  />
</div>
{errors.profession && (
  <p className="text-xs text-red-500">{errors.profession}</p>
)}
</div>

<div className="space-y-2">
<Label htmlFor="referredBy">Referred By (Optional)</Label>
<div className="relative">
  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    id="referredBy"
    name="referredBy"
    value={formData.referredBy}
    onChange={handleChange}
    className="pl-9 h-9"
    placeholder="Referred By"
  />
</div>
</div>
</div>

<div className="flex justify-end pt-4">
<Button type="submit" disabled={loading} className="w-auto px-8">
  {loading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Adding Student...
    </>
  ) : (
    "Add Student"
  )}
</Button>
</div>
</form>
</CardContent>
</Card>
);
};

export default AddStudent;