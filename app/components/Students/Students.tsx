"use client";

import React, { useState } from 'react';
import { User, MapPin, Phone, Briefcase, Mail, Lock } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const cityData = [
  {
    country: "USA",
    state: "NY",
    cities: ["New York", "Buffalo", "Albany", "Rochester"]
  },
  {
    country: "USA",
    state: "CA",
    cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose"]
  },
  {
    country: "USA",
    state: "TX",
    cities: ["Houston", "Austin", "Dallas", "San Antonio"]
  }
];

const Students = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
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
  });

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
    if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Invalid zip code";
    }
    if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format (XXX-XXX-XXXX)";
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

  const handleCitySelect = (city: string) => {
    const locationData = cityData.find((item) => 
      item.cities.includes(city)
    );
    
    if (locationData) {
      setFormData(prev => ({
        ...prev,
        city,
        state: locationData.state,
        country: locationData.country
      }));
    }
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
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}auth/signup/student`, {
        ...formData,
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
          description: "Check your email for a booking confirmation. We'll see you soon!",
          variant: "default",
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
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Student Registration</CardTitle>
        <CardDescription>Register a new student account</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Student</TabsTrigger>
            <TabsTrigger value="edit">Edit Student</TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Full Name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Address"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleCitySelect(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityData.flatMap(item => 
                        item.cities.map(city => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      readOnly
                      className="pl-10 bg-gray-50"
                      placeholder="State"
                    />
                  </div>
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      readOnly
                      className="pl-10 bg-gray-50"
                      placeholder="Country"
                    />
                  </div>
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Zip Code (e.g., 12345 or 12345-6789)"
                    />
                  </div>
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Phone (XXX-XXX-XXXX)"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Company Name"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-sm text-red-500">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Profession"
                    />
                  </div>
                  {errors.profession && (
                    <p className="text-sm text-red-500">{errors.profession}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referredBy">Referred By</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="referredBy"
                      name="referredBy"
                      value={formData.referredBy}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Referred By (Optional)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Adding Student..." : "Add Student"}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="edit">
            <div className="text-center text-gray-500 py-10">
              Edit Student functionality coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Students;