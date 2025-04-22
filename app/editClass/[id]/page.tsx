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

interface Country {
  id: number;
  CountryName: string;
  currency: string;
  isActive: boolean;
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
  updateAt: string;
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

// Update the helper function to format dates as MM/DD/YY
const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
};

// Add this new helper function
const formatForDateInput = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
};

// Update the formatDateForInput function to format as MM/DD/YY
const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
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
        router.push('/classes');
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

  const validateDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      setDateError('End date cannot be before start date');
      return false;
    }
    
    setDateError('');
    return true;
  };

  // Validate form fields
  const validateForm = (): boolean => {
    clearAllErrors();
    let isValid = true;

    if (classData && !classData.title?.trim()) {
      setError('title', 'Title is required');
      isValid = false;
    }

    if (classData && !classData.startDate) {
      setError('startDate', 'Start date is required');
      isValid = false;
    }

    if (classData && !classData.endDate) {
      setError('endDate', 'End date is required');
      isValid = false;
    }

    if (classData && !classData.instructor?.id) {
      setError('instructor', 'Please select an instructor');
      isValid = false;
    }

    return isValid;
  };

  // Convert status string to boolean
  const convertStatusToBoolean = (status: string): boolean => {
    // Return true if status is "1", false for any other value
    return status === "1";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (classData && !validateForm() || classData && !validateDates(classData.startDate, classData.endDate)) {
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
        // Convert status from string to boolean
        status: classData ? convertStatusToBoolean(classData.status as string) : false,
        startDate: classData ? new Date(classData.startDate).toISOString() : '',
        endDate: classData ? new Date(classData.endDate).toISOString() : '',
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

      const data = await response.json();
      if (data.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push(`/class-details/${id}`);
          router.refresh();
        }, 1500);
      } else {
        const errorMessage = Array.isArray(data.error) 
          ? data.error.join(', ') 
          : data.error || 'Failed to update class';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error updating class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to update class. Please try again later.",
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
        <Link href="/classes" className="hover:text-gray-700">
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

              <div>
                <Label>Start Date</Label>
                <div className="flex flex-col gap-1">
                  <Input
                    type="date"
                    value={formatForDateInput(classData.startDate)}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      selectedDate.setHours(12); // Set to noon to avoid timezone issues
                      setClassData({ ...classData, startDate: selectedDate.toISOString() });
                    }}
                    required
                  />
                  <div className="text-sm text-gray-500">
                    {formatDateForDisplay(classData.startDate)}
                  </div>
                </div>
              </div>

              <div>
                <Label>End Date</Label>
                <div className="flex flex-col gap-1">
                  <Input
                    type="date"
                    value={formatForDateInput(classData.endDate)}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      selectedDate.setHours(12); // Set to noon to avoid timezone issues
                      setClassData({ ...classData, endDate: selectedDate.toISOString() });
                    }}
                    required
                  />
                  <div className="text-sm text-gray-500">
                    {formatDateForDisplay(classData.endDate)}
                  </div>
                </div>
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
                  value={typeof classData.status === 'boolean' 
                    ? (classData.status ? "1" : "0") 
                    : classData.status}
                  onValueChange={(value) => setClassData({ ...classData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
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
                  <Label>Location</Label>
                  <Input
                    value={classData.location?.location || ''}
                    disabled
                  />
                </div>

                <div>
                  <Label>Country</Label>
                  <Input
                    value={classData.country?.CountryName || ''}
                    disabled
                  />
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
                  <Input
                    value={classData.category?.description || ''}
                    disabled
                  />
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
                    value={new Date(classData.updateAt).toLocaleString()}
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