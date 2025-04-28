"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Edit2, FileInput } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check } from 'lucide-react';
import { Loader2 } from 'lucide-react';


interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StudentData {
  id: number;
  uid: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  companyName: string;
  profession: string;
  referredBy: string;
  signupDate: string;
  downloadedInfoPac: boolean;
  isDelete: boolean;
  active: boolean;
  lastLogin: string;
  locationId?: string;
}

interface StudentResponse {
  message: string;
  error: string;
  success: boolean;
  data: StudentData[];
}

interface EditStudentModalProps {
  student: StudentData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: number, data: Partial<StudentData>) => Promise<void>;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <AlertDialogTitle>Success!</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Student information has been successfully updated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<StudentData>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countries, setCountries] = useState<{ id: number; CountryName: string }[]>([]);
  const [states, setStates] = useState<{ id: number; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; location: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  
  // Add new states for city search functionality
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [citySearchFocused, setCitySearchFocused] = useState(false);
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (student) {
      // Extract proper values from nested objects
      const countryId = student.country && typeof student.country === 'object' 
        ? (student.country as { id: number }).id.toString() 
        : student.country || "";
        
      const stateId = student.state && typeof student.state === 'object' 
        ? (student.state as { id: number }).id.toString() 
        : student.state || "";
      const cityValue = student.city && typeof student.city === 'object' 
        ? (student.city as { location: string }).location 
        : student.city || "";

      setFormData({
        name: student.name,
        address: student.address,
        city: cityValue,
        state: stateId, 
        country: countryId,
        zipCode: student.zipCode,
        phone: student.phone,
        email: student.email,
        companyName: student.companyName,
        profession: student.profession,
      });
      
      setSelectedCountry(countryId);
      setSelectedState(stateId);
      setCitySearch(cityValue);
    }
  }, [student]);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    }
  }, [selectedState]);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/country`);
      const data = await response.json();
      setCountries(data.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      const response = await fetch(`https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/state/?countryId=${countryId}`);
      const data = await response.json();
      setStates(data.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const response = await fetch(`https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/location?stateId=${stateId}`);
      const data = await response.json();
      const sortedLocations = [...data.data].sort((a, b) => 
        a.location.localeCompare(b.location)
      );
      setCities(sortedLocations);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Only validate fields that have been modified
    if (formData.name !== undefined && formData.name.trim() === '') {
      newErrors.name = "Name is required";
    }
    
    if (formData.email !== undefined && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    
    // Check if we have a state but no city
    if (selectedState && !formData.locationId && (formData.city === '' || formData.city === undefined)) {
      newErrors.city = "Please select or create a city";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await onSave(student.id, formData);
      setShowSuccess(true);
      onClose();
    } catch (error) {
      // Error is handled in the onSave function
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user makes a change
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleCountryChange = async (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedState("");
    setCities([]);
    setFormData(prev => ({ 
      ...prev, 
      country: countryId,
      state: '',
      city: '',
      locationId: ''
    }));
    
    // Fetch states for selected country
    fetchStates(countryId);
  };

  const handleStateChange = async (stateId: string) => {
    setSelectedState(stateId);
    setFormData(prev => ({ 
      ...prev, 
      state: stateId,
      city: '',
      locationId: ''
    }));
    setCitySearch(""); // Clear city search when state changes

    // Fetch cities for the selected state
    fetchCities(stateId);
  };

  const handleCitySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setCitySearch(searchValue);
    setFormData(prev => ({
      ...prev,
      city: searchValue // Update city value directly
    }));

    if (searchValue.trim() === '') {
      setFilteredCities([]);
    } else {
      const filtered = cities.filter((city: any) => 
        city.location.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  };

  const selectCity = (city: any) => {
    setCitySearch(city.location);
    setFormData(prev => ({
      ...prev,
      city: city.location,
      locationId: city.id.toString()
    }));
    setFilteredCities([]);
    setCitySearchFocused(false);
  };

  const createNewLocation = async () => {
    if (!selectedCountry || !selectedState || !citySearch.trim()) {
      return;
    }

    setCreatingLocation(true);
    try {
      const response = await fetch('https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          country: parseInt(selectedCountry),
          state: parseInt(selectedState),
          location: citySearch.trim(),
          addedBy: localStorage.getItem("userEmail"),
          updatedBy: localStorage.getItem("userEmail"),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          const newLocation = data.data;
          
          // Add the new location to the cities list
          setCities(prev => [...prev, newLocation]);
          
          // Update form data with the new location info
          setFormData(prev => ({
            ...prev,
            locationId: newLocation.id.toString(),
            city: newLocation.location
          }));
          
          setFilteredCities([]);
          setCitySearchFocused(false);
        }
      }
    } catch (error) {
      console.error("Error creating location:", error);
    } finally {
      setCreatingLocation(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            
            {/* Country selection */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.CountryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* State selection */}
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={selectedState}
                onValueChange={handleStateChange}
                disabled={!selectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCountry ? "Select State" : "Select Country First"} />
                </SelectTrigger>
                <SelectContent>
                  {states.length > 0 ? (
                    states.map((state) => (
                      <SelectItem key={state.id} value={state.id.toString()}>
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
            </div>
            
            {/* City search with dropdown */}
            <div className="space-y-2 relative">
              <Label>City</Label>
              <Input
                value={citySearch}
                onChange={handleCitySearch}
                onFocus={() => setCitySearchFocused(true)}
                onBlur={() => {
                  // Delayed blur to allow clicking on the dropdown items
                  setTimeout(() => setCitySearchFocused(false), 200);
                }}
                placeholder={
                  !selectedCountry 
                    ? "Select Country First" 
                    : !selectedState 
                      ? "Select State First"
                      : "Type to search or create city"
                }
                disabled={!selectedState}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city}</p>
              )}
              
              {/* City dropdown */}
              {citySearchFocused && citySearch && filteredCities.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border max-h-60 overflow-auto">
                  {filteredCities.map((city) => (
                    <div 
                      key={city.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectCity(city)}
                    >
                      {city.location}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Create new location button */}
              {selectedState && 
                citySearch && 
                !loading && 
                filteredCities.length === 0 && 
                !cities.some((city: any) => city.location.toLowerCase() === citySearch.toLowerCase()) && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-2 w-full text-sm"
                    onClick={createNewLocation}
                    disabled={creatingLocation}
                  >
                    {creatingLocation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      `Create "${citySearch}" as new location`
                    )}
                  </Button>
                )
              }
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode || ''}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName || ''}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={formData.profession || ''}
                onChange={(e) => handleInputChange('profession', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
      />
    </Dialog>
  );
};

const Students = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [professionFilter, setProfessionFilter] = useState("all");
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const uniqueStates = Array.from(new Set(
    students.map(student => {
      if (student.state && typeof student.state === 'string') {
        return student.state;
      }
      return 'Unknown';
    })
  )).filter(Boolean).sort();
  const uniqueProfessions = Array.from(new Set(students.map(student => student.profession))).sort();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, statusFilter, stateFilter, professionFilter, students]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data: StudentResponse = await response.json();
      if (data.success) {
        setStudents(data.data);
        setFilteredStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        (student.companyName && student.companyName.toLowerCase().includes(searchLower)) ||
        student.uid.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(student => 
        statusFilter === "active" ? student.active : !student.active
      );
    }

    if (stateFilter !== "all") {
      filtered = filtered.filter(student => {
        if (typeof student.state === 'object' && student.state) {
          return (student.state as { name: string }).name === stateFilter;
        }
        return student.state === stateFilter;
      });
    }

    if (professionFilter !== "all") {
      filtered = filtered.filter(student => student.profession === professionFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleEditStudent = async (studentId: number, updatedData: Partial<StudentData>) => {
    try {
      // Create a payload object that will be sent to the API
      const payload: any = { ...updatedData };
      
      // If we have locationId in the data, use it for the city field and convert to integer
      if (updatedData.locationId) {
        payload.city = parseInt(updatedData.locationId);
        // Remove locationId from payload as it's not needed in the API
        delete payload.locationId;
      }
      
      // Convert state and country to integers if they exist
      if (updatedData.state && !isNaN(Number(updatedData.state))) {
        payload.state = parseInt(updatedData.state);
      }
      
      if (updatedData.country && !isNaN(Number(updatedData.country))) {
        payload.country = parseInt(updatedData.country);
      }

      console.log("Sending payload to API:", payload);

      const response = await fetch(`https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Get specific error message if available
        const errorMessage = data.error || data.message || 'Failed to update student';
        throw new Error(errorMessage);
      }

      // Update local state with the updated data we got back from the API
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId ? { ...student, ...updatedData } : student
        )
      );

      setShowSuccess(true);
      
      // Refresh student list to make sure we have the latest data
      fetchStudents();
      
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
    }
  };


  const handleAddStudent = () => {
    router.push('/students/add');
  };

  // Helper function to safely get city, state, country values
  const getLocationInfo = (student: StudentData) => {
    let cityName = 'N/A';
    let stateName = 'N/A';
    let countryName = 'N/A';

    // Check if city exists and is an object before using 'in' operator
    if (student.city && typeof student.city === 'object' && student.city !== null) {
      // Use type assertion with optional chaining to safely access location
      const cityObj = student.city as any;
      cityName = cityObj.location || 'N/A';
    } else if (typeof student.city === 'string' && student.city) {
      cityName = student.city;
    }

    // Check if state exists and is an object before accessing properties
    if (student.state && typeof student.state === 'object' && student.state !== null) {
      // Use type assertion with optional chaining to safely access name
      const stateObj = student.state as any;
      stateName = stateObj.name || 'N/A';
    } else if (typeof student.state === 'string' && student.state) {
      stateName = student.state;
    }

    // Check if country exists and is an object before accessing properties
    if (student.country && typeof student.country === 'object' && student.country !== null) {
      // Use type assertion with optional chaining to safely access CountryName
      const countryObj = student.country as any;
      countryName = countryObj.CountryName || 'N/A';
    } else if (typeof student.country === 'string' && student.country) {
      countryName = student.country;
    }

    return { cityName, stateName, countryName };
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-full mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle>Students Management</CardTitle>
        <Button onClick={handleAddStudent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, company, or UID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={professionFilter} onValueChange={setProfessionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Profession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Professions</SelectItem>
                  {uniqueProfessions.map(profession => (
                    <SelectItem key={profession} value={profession}>{profession}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredStudents.length} of {students.length} students
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Company</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Last Login</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const { cityName, stateName } = getLocationInfo(student);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{student.id}</td>
                        <td className="px-4 py-3 text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-gray-500">{student.email}</td>
                        <td className="px-4 py-3 text-gray-500">{student.companyName || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {`${cityName}, ${stateName}`}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{student.phone || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {student.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingStudent(student);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                               router.push(`students/classEnrollment/${student.id}`);
                                }}
                              >
                                <FileInput className="mr-2 h-4 w-4" />
                          Class  Enrollment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                               router.push(`students/courseEnrolllment/${student.id}`);
                                }}
                              >
                                <FileInput className="mr-2 h-4 w-4" />
                          Course  Enrollment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Edit Student Modal */}
      <EditStudentModal
        student={editingStudent}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleEditStudent}
      />
  <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
      />
    </Card>
  );
};

export default Students;