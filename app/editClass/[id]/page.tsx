"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {SuccessModal} from "../../components/SuccessModal";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Country {
  id: number;
  CountryName: string;
  currency: string;
  isActive: boolean;
  addedBy: number;
  updatedBy: number | null;
  __locations__: Location[];
}

interface ClassType {
  id: number;
  name: string;
  description: string | null;
  isDelete: boolean;
  active: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
  isDelete: boolean;
  active: boolean;
}

interface Location {
  id: number;
  location: string;
  addedBy: string;
  updatedBy: string;
  isDelete: boolean;
  createdAt: string;
  updateAt: string;
}

interface ClassData {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  address: string;
  maxStudent: number;
  minStudent: number;
  price: string | number;
  status: string | boolean;
  onlineAvailable: boolean;
  isCancel: boolean;
  isDelete: boolean;
  classTime: string;
  onlineCourseId: string;
  isCorpClass: boolean;
  hotel: string;
  hotelEmailId: string;
  hotelContactNo: string;
  flightConfirmation: string;
  carConfirmation: string;
  hotelConfirmation: string;
  createdAt: string;
  updatedAt?: string;
  updateAt?: string;
  instructor: {
    id: number;
    name: string;
    emailID: string;
    mobile: string;
    telNo: string;
  };
  participants?: {
    id: number;
    name: string;
    email: string;
  }[];
  location: Location;
  country: Country;
  classType: ClassType;
  category: Category;
}

interface ApiResponse {
  message: string;
  error: string | string[];
  success: boolean;
  data: ClassData;
}

interface PageProps {
  params: {
    id: string;
  };
}

interface Instructor {
  id: number;
  name: string;
  emailID: string;
  mobile: string;
  telNo: string;
}

const LoadingSkeleton = () => (
  <div className="w-full h-full">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-4 w-16" />
      <span>›</span>
      <Skeleton className="h-4 w-16" />
      <span>›</span>
      <Skeleton className="h-4 w-24" />
    </div>

    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="p-6 h-full">
        <Skeleton className="h-7 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Add loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center space-x-3 bg-zinc-50/50 rounded-md px-3 py-2 border border-zinc-200">
    <div className="flex space-x-1">
      <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce"></div>
    </div>
    <span className="text-sm text-zinc-500 font-medium">Loading...</span>
  </div>
);

// Custom hook for form error handling
const useFormErrors = () => {
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});

  const setError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => setErrors({});

  return { errors, setError, clearError, clearAllErrors };
};

// Fix timezone issues by creating a proper date normalization function
// This function creates a new Date object using local year, month, and day
// to avoid timezone conversion issues that cause dates to shift by one day
const normalizeDate = (date: Date | undefined) => {
  if (!date) return undefined;
  
  // Create a new date using the local year, month, and day to avoid timezone issues
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create date in local timezone (no timezone conversion)
  return new Date(year, month, day);
};

// Fix the date formatting to use toLocaleString properly
// This function formats dates as MM-dd-YYYY using toLocaleString
const formatDateForAPI = (date: Date | undefined): string => {
  if (!date) return '';
  
  // Use toLocaleString with local timezone to get the correct date
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-'); // Replace / with -
};

// Convert backend date format (YYYY-MM-DD) to Date object
const parseBackendDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  
  // Handle backend date format (YYYY-MM-DD)
  if (dateString.includes('-') && dateString.split('-').length === 3) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
  }
  
  // Fallback for ISO string format
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
};

export default function EditClass({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [participants, setParticipants] = useState<ClassData['participants']>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateError, setDateError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);
  
  // Add new state variables for countries and locations
  const [countries, setCountries] = useState<Country[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const { errors, setError, clearError, clearAllErrors } = useFormErrors();

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await fetch(`https://api.4pmti.com/class/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch class');
        
        const data: ApiResponse = await response.json();
        if (data.success) {
          setClassData(data.data);
          // If the class has participants, set them
          if (data.data.participants) {
            setParticipants(data.data.participants);
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: Array.isArray(data.error) ? data.error[0] : data.error || "Failed to fetch class details",
          });
        }
      } catch (error) {
        console.error('Error fetching class:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load class details. Please try again later.",
        });
        router.push('/');
      } finally {
        setIsFetching(false);
      }
    };

    fetchClass();
  }, [id, toast, router]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch('https://api.4pmti.com/instructor', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch instructors');
        
        const data = await response.json();
        if (data.success) {
          const mappedInstructors = data.data.map((instructor: any) => ({
            id: instructor.id,
            name: instructor.name,
            emailID: instructor.emailID,
            mobile: instructor.mobile,
            telNo: instructor.telNo
          }));
          setInstructors(mappedInstructors);
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load instructors",
        });
      }
    };

    fetchInstructors();
  }, []);

  // Add useEffect for fetching countries
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch('https://api.4pmti.com/country', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setCountries(result.data);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load countries",
        });
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Add useEffect for updating locations when country changes
  useEffect(() => {
    const countryId = classData?.country?.id;
    const selectedCountry = countries.find(country => country.id === Number(countryId));
    if (selectedCountry) {
      const activeLocations = selectedCountry.__locations__.filter(loc => loc.isDelete === false);
      setLocations(activeLocations);
    } else {
      setLocations([]);
    }
  }, [classData?.country?.id, countries]);

  // Updated date validation using the new date handling logic
  const validateDates = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (!startDate || !endDate) {
      setDateError('Both start and end dates are required');
      return false;
    }
    
    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setDateError('Invalid date format');
      return false;
    }
    
    if (endDate < startDate) {
      setDateError('End date cannot be before start date');
      return false;
    }
    
    setDateError('');
    return true;
  };

  // Function to update category description
  const updateCategoryDescription = async (categoryId: number, name: string, description: string) => {
    setIsUpdatingCategory(true);
    try {
      const response = await fetch(`https://api.4pmti.com/category/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          name: name,
          description: description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Array.isArray(errorData.error) ? errorData.error[0] : errorData.error || 'Failed to update category');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Category description updated successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: Array.isArray(data.error) ? data.error[0] : data.error || "Failed to update category",
        });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred while updating category",
      });
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    clearAllErrors();
    let isValid = true;

    if (classData && !classData.title?.trim()) {
      setError('title', 'Title is required');
      isValid = false;
    }

    // Parse dates for validation
    const startDate = parseBackendDate(classData?.startDate || '');
    const endDate = parseBackendDate(classData?.endDate || '');

    if (!startDate) {
      setError('startDate', 'Start date is required');
      isValid = false;
    }

    if (!endDate) {
      setError('endDate', 'End date is required');
      isValid = false;
    }

    // Validate date relationship
    if (startDate && endDate && !validateDates(startDate, endDate)) {
      isValid = false;
    }

    if (classData && !classData.instructor?.id) {
      setError('instructor', 'Please select an instructor');
      isValid = false;
    }

    if (classData && !classData.country?.id) {
      setError('country', 'Please select a country');
      isValid = false;
    }

    if (classData && !classData.location?.id) {
      setError('location', 'Please select a location');
      isValid = false;
    }

    return isValid;
  };

  // Update the convertStatusToString function to handle the new status format
  const convertStatusToString = (status: string): string => {
    // Return the status as is since it's already in the correct format
    return status === "active" ? "active" : "inactive";
  };

  // Updated date change handlers using the new logic
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date || !classData) return;
    
    const localDate = normalizeDate(date);
    if (localDate) {
      // Format date as YYYY-MM-DD for backend compatibility
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setClassData({ ...classData, startDate: formattedDate });
      
      // Validate against end date if it exists
      const endDate = parseBackendDate(classData.endDate);
      if (endDate) {
        validateDates(localDate, endDate);
      }
      clearError('startDate');
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date || !classData) return;
    
    const localDate = normalizeDate(date);
    if (localDate) {
      // Format date as YYYY-MM-DD for backend compatibility
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setClassData({ ...classData, endDate: formattedDate });
      
      // Validate against start date
      const startDate = parseBackendDate(classData.startDate);
      if (startDate) {
        validateDates(startDate, localDate);
      }
      clearError('endDate');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!classData || !validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check all required fields and try again.",
      });
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Create a payload with proper data types
      const payload = {
        ...(classData || {}),
        // Convert price from string to number
        price: classData ? parseFloat(classData.price as string) : 0,
        // Status is already in the correct format ("active"/"inactive")
        status: classData ? classData.status : "inactive",
        // Send dates in the existing format (already YYYY-MM-DD)
        startDate: classData.startDate,
        endDate: classData.endDate,
        // Use the actual checkbox value from the form state
        isCorpClass: classData ? classData.isCorpClass : false,
        // Add country and location IDs
        countryId: classData ? classData.country?.id : 0,
        locationId: classData ? classData.location?.id : 0,
        // Include updated category information
        category: classData ? {
          id: classData.category?.id,
          name: classData.category?.name,
          description: classData.category?.description,
          isDelete: classData.category?.isDelete || false,
          active: classData.category?.active || true
        } : undefined,
      };
  
      console.log("Submitting payload:", payload);
  
      const response = await fetch(`https://api.4pmti.com/class/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Array.isArray(errorData.error) ? errorData.error[0] : errorData.error || 'Failed to update class');
      }
  
      const data = await response.json();
      if (data.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          router.push(`/class-details/${id}`);
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: Array.isArray(data.error) ? data.error[0] : data.error || "Failed to update class",
        });
      }
    } catch (error) {
      console.error('Error updating class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <LoadingSkeleton />;
  }

  if (!classData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Class not found or error loading class details
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4 text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <span>›</span>
        <Link href="/" className="hover:text-gray-700">
          Classes
        </Link>
        <span>›</span>
        <Link 
          href={`/class-details/${id}`} 
          className="hover:text-gray-700"
        >
          Class Details
        </Link>
        <span>›</span>
        <span>Edit Class</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-2">Edit Class</h1>
          <p className="text-gray-500 mb-6">Update class details and instructor information</p>

          <form onSubmit={handleSubmit} className="space-y-6 h-full">
            {/* Essential Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input
                  value={classData.title}
                  onChange={(e) => {
                    setClassData({ ...classData, title: e.target.value });
                    clearError('title');
                  }}
                  required
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Start Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        errors.startDate ? 'border-red-500' : 'border-gray-300',
                        !classData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {classData.startDate ? (
                        format(parseBackendDate(classData.startDate) || new Date(), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseBackendDate(classData.startDate)}
                      onSelect={handleStartDateChange}
                      disabled={
                        classData.endDate && parseBackendDate(classData.endDate)
                          ? (date) =>
                              date < new Date() ||
                              date > parseBackendDate(classData.endDate)!
                          : (date) => date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>End Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        errors.endDate ? 'border-red-500' : 'border-gray-300',
                        !classData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {classData.endDate ? (
                        format(parseBackendDate(classData.endDate) || new Date(), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parseBackendDate(classData.endDate)}
                      onSelect={handleEndDateChange}
                      disabled={
                        classData.startDate && parseBackendDate(classData.startDate)
                          ? (date) =>
                              date < new Date() ||
                              date < parseBackendDate(classData.startDate)!
                          : (date) => date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>

              <div>
                <Label>Class Time</Label>
                <Input
                  value={classData.classTime}
                  onChange={(e) => setClassData({ ...classData, classTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={typeof classData.price === 'string' ? classData.price : classData.price.toString()}
                  onChange={(e) => setClassData({ ...classData, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Online Course ID</Label>
                <Input
                  value={classData.onlineCourseId}
                  onChange={(e) => setClassData({ ...classData, onlineCourseId: e.target.value })}
                />
              </div>

              <div>
                <Label>Min Students</Label>
                <Input
                  type="number"
                  value={classData.minStudent}
                  onChange={(e) => setClassData({ ...classData, minStudent: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Max Students</Label>
                <Input
                  type="number"
                  value={classData.maxStudent}
                  onChange={(e) => setClassData({ ...classData, maxStudent: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={classData.status === "active" ? "active" : "inactive"}
                  onValueChange={(value) => setClassData({ ...classData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Address</Label>
                <Input
                  value={classData.address}
                  onChange={(e) => setClassData({ ...classData, address: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  value={classData.description}
                  onChange={(e) => setClassData({ ...classData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  required
                />
              </div>
            </div>

            {/* Checkboxes in a row */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={classData.isCorpClass}
                  onChange={(e) => setClassData({ ...classData, isCorpClass: e.target.checked })}
                  className="rounded border-gray-300"
                  id="isCorpClass"
                />
                <Label htmlFor="isCorpClass">Corporate Class</Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={classData.onlineAvailable}
                  onChange={(e) => setClassData({ ...classData, onlineAvailable: e.target.checked })}
                  className="rounded border-gray-300"
                  id="onlineAvailable"
                />
                <Label htmlFor="onlineAvailable">Online Available</Label>
              </div>
            </div>

            {/* Corporate Class Details - Shown only when isCorpClass is true */}
            {classData.isCorpClass && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div>
                  <Label>Hotel</Label>
                  <Input
                    value={classData.hotel}
                    onChange={(e) => setClassData({ ...classData, hotel: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Hotel Email</Label>
                  <Input
                    type="email"
                    value={classData.hotelEmailId}
                    onChange={(e) => setClassData({ ...classData, hotelEmailId: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Hotel Contact</Label>
                  <Input
                    value={classData.hotelContactNo}
                    onChange={(e) => setClassData({ ...classData, hotelContactNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Hotel Confirmation</Label>
                  <Input
                    value={classData.hotelConfirmation}
                    onChange={(e) => setClassData({ ...classData, hotelConfirmation: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Flight Confirmation</Label>
                  <Input
                    value={classData.flightConfirmation}
                    onChange={(e) => setClassData({ ...classData, flightConfirmation: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Car Confirmation</Label>
                  <Input
                    value={classData.carConfirmation}
                    onChange={(e) => setClassData({ ...classData, carConfirmation: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Location, Country, Class Type, and Category Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Country <span className="text-red-500">*</span></Label>
                  <Select
                    value={classData.country?.id?.toString()}
                    onValueChange={(value) => {
                      const selectedCountry = countries.find(country => country.id.toString() === value);
                      if (selectedCountry) {
                        setClassData({
                          ...classData,
                          country: selectedCountry,
                          location: { id: 0, location: '', addedBy: '', updatedBy: '', isDelete: false, createdAt: '', updateAt: '' } // Reset location when country changes
                        });
                        clearError('country');
                      }
                    }}
                  >
                    <SelectTrigger 
                      className={`mt-1 bg-white w-full ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {loadingCountries ? (
                        <LoadingSpinner />
                      ) : (
                        <SelectValue placeholder="Select a country" className="bg-white" />
                      )}
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
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500">{errors.country}</p>
                  )}
                </div>

                <div>
                  <Label>Location <span className="text-red-500">*</span></Label>
                  <Select
                    value={classData.location?.id?.toString()}
                    onValueChange={(value) => {
                      const selectedLocation = locations.find(location => location.id.toString() === value);
                      if (selectedLocation) {
                        setClassData({
                          ...classData,
                          location: selectedLocation
                        });
                        clearError('location');
                      }
                    }}
                    disabled={!classData.country?.id || locations.length === 0}
                  >
                    <SelectTrigger 
                      className={`mt-1 bg-white w-full ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <SelectValue placeholder={
                        !classData.country?.id 
                          ? "Please select a country first" 
                          : locations.length === 0 
                            ? "No locations available" 
                            : "Select a location"
                      } className="bg-white" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.length === 0 ? (
                        <SelectItem value="no-locations" disabled>
                          No locations available for this country
                        </SelectItem>
                      ) : (
                        locations
                          .sort((a, b) => a.location.localeCompare(b.location))
                          .map((location) => (
                            <SelectItem 
                              key={location.id} 
                              value={location.id.toString()}
                            >
                              {location.location}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                <div>
                  <Label>Currency</Label>
                  <Input
                    value={classData.country?.currency || ''}
                    disabled
                  />
                </div>

                <div>
                  <Label>Class Type</Label>
                  <Input
                    value={classData.classType?.name || ''}
                    disabled
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Input
                    value={classData.category?.name || ''}
                    disabled
                  />
                </div>

                <div>
                  <Label>Category Description</Label>
                  <div className="relative">
                    <textarea
                      value={classData.category?.description || ''}
                      onChange={(e) => setClassData({
                        ...classData,
                        category: {
                          ...classData.category!,
                          description: e.target.value
                        }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter category description"
                    />
                    {classData.category?.id && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (classData.category?.id && classData.category?.name && classData.category?.description) {
                            updateCategoryDescription(
                              classData.category.id,
                              classData.category.name,
                              classData.category.description
                            );
                          }
                        }}
                        disabled={isUpdatingCategory}
                        className="absolute top-2 right-2 h-6 px-2 text-xs"
                      >
                        {isUpdatingCategory ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Category'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Created At</Label>
                  <Input
                    value={new Date(classData.createdAt).toLocaleString()}
                    disabled
                  />
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <Input
                    value={classData.updatedAt || classData.updateAt ? new Date(classData.updatedAt || classData.updateAt!).toLocaleString() : 'Not available'}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Instructor Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Instructor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Select Instructor <span className="text-red-500">*</span></Label>
                  <Select
                    value={classData.instructor?.id?.toString()}
                    onValueChange={(value) => {
                      const selectedInstructor = instructors.find(i => i.id.toString() === value);
                      if (selectedInstructor) {
                        setClassData({
                          ...classData,
                          instructor: {
                            id: selectedInstructor.id,
                            name: selectedInstructor.name,
                            emailID: selectedInstructor.emailID,
                            mobile: selectedInstructor.mobile,
                            telNo: selectedInstructor.telNo
                          }
                        });
                        clearError('instructor');
                      }
                    }}
                  >
                    <SelectTrigger className={errors.instructor ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor.id} value={instructor.id.toString()}>
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.instructor && (
                    <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>
                  )}
                </div>

                {/* Read-only instructor details */}
                {classData.instructor && (
                  <>
                    <div>
                      <Label>Email</Label>
                      <Input value={classData.instructor.emailID} disabled />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={classData.instructor.mobile} disabled />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Participants Section */}
            {participants && participants.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Class Participants</h3>
                  <div className="w-64">
                    <Input
                      placeholder="Search participants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left bg-gray-50">
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants
                        .filter(p => 
                          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((participant) => (
                          <tr key={participant.id} className="border-t">
                            <td className="p-2">{participant.name}</td>
                            <td className="p-2">{participant.email}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dateError && (
              <div className="text-red-500 text-sm mt-2">
                {dateError}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Class'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      <SuccessModal 
        isOpen={showSuccessModal}
        message="Class has been updated successfully! Redirecting..."
        className="sm:max-w-[425px]"
      />
    </div>
  );
}