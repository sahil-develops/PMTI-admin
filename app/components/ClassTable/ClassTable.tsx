"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  User,
  Eye,
  CalendarIcon,
} from "lucide-react"; 
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useToast } from "@/hooks/use-toast";
import ClassTypeDropdown1 from "@/app/components/DropDown/ClassTypeDropdown1";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import router from "next/router";



interface Metadata {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ClassType {
  id: number;
  name: string;
  description: string;
  isDelete: boolean;
  active: boolean;
  category: {
    id: number;
    name: string;
  };
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

// Add new state interface
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

interface ClassData {
  minStudent: number;
  maxStudent: number;
  enrolledStudents: number;
  category: any;
  id: number;
  title: string;
  classType: ClassType;
  startDate: string;
  endDate: string;
  location: Location;
  instructor: string | null;
  status: string;  // Add this line
  locationId: string;
  instructorId: string;
  courseCategoryId: string;
  classTypeId: string;
  showClass: string;
  globalSearch: string;
  enrollmentCount:string
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}


// Update SearchParams interface
interface SearchParams {
  startFrom: string;
  dateTo: string;
  countryId: string;
  locationId: string;
  instructorId: string;
  courseCategoryId: string;
  classTypeId: string;
  showClass: string;
  globalSearch: string;
}

// Custom Alert Component
const Alert = ({
  message,
  type = "error",
  onClose,
}: {
  message: string;
  type?: "error" | "success";
  onClose: () => void;
}) => (
  <div
    className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
      type === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
    }`}
  >
    <div className="flex justify-between items-center">
      <p>{message}</p>
      <button onClick={onClose} className="ml-4 text-sm hover:text-opacity-75">
        ×
      </button>
    </div>
  </div>
);

// Custom Dropdown Component
const ActionDropdown = ({
  classId,
  refreshData,
  classItem,
  onDelete,
}: {
  classId: number;
  refreshData: () => void;
  classItem: ClassData;
  onDelete: (id: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Get enrolled count from either enrollmentCount or enrolledStudents
  const enrolledCount = classItem.enrollmentCount 
    ? parseInt(classItem.enrollmentCount, 10) 
    : classItem.enrolledStudents || 0;

  const handleViewRoster = (id: string) => {
    router.push(`/view-roaster/${id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(
        `https://api.4pmti.com/class/${classId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete class");
      }

      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      
      // First remove the class locally for immediate UI update
      onDelete(classId);
      
      // Then refresh the data from the server
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setIsOpen(false);
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case "edit":
        router.push(`/editClass/${classId}`);
        break;
      case "delete":
        setShowDeleteModal(true);
        break;
      case "details":
        router.push(`/class-details/${classId}`);
        break;
      case "roster":
        router.push(`/view-roaster/${classId}`);
        break;
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-zinc-100"
          disabled={isDeleting}
        >
          <MoreVertical size={20} className="text-zinc-600" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white z-20 py-1">
              <button
                onClick={() => handleAction("details")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2"
                disabled={isDeleting}
              >
                <Eye size={16} />
                View details
              </button>
              <button
                onClick={() => handleAction("edit")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2"
                disabled={isDeleting}
              >
                <Edit2 size={16} />
                Edit details
              </button>
              <button
                onClick={() => handleAction("roster")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2"
                disabled={isDeleting}
              >
                <User size={16} />
                View roster
              </button>
              {enrolledCount === 0 && (
                <button
                  onClick={() => handleAction("delete")}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <Trash2 size={16} />
                  {isDeleting ? "Deleting..." : "Delete class"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Class"
        message={`Are you sure you want to delete the class "${classItem.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
};

// const TableHeader = ({ children }: { children: React.ReactNode }) => (
//   <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">
//     {children}
//   </th>
// );

const TableCell = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td className={`px-4 py-4 text-sm text-zinc-600 ${className}`}>{children}</td>
);

// First, add this Loader component at the top with other components
const Loader = () => (
  <div className="flex items-center space-x-3 bg-zinc-50/50 rounded-md px-3 py-2 border border-zinc-200">
    <div className="flex space-x-1">
      <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce"></div>
    </div>
    <span className="text-sm text-zinc-500 font-medium">Loading...</span>
  </div>
);

// Add the missing TableShimmer component
const TableShimmer = () => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="border-b border-zinc-200 h-16 bg-zinc-50" />
    ))}
  </div>
);

// Alternative version with a pulse effect if you prefer


// Update this helper function to handle dates consistently
const formatDateFromAPI = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    // Create a date object without converting to UTC
    // Add 'T00:00:00' to ensure consistent local date interpretation
    const date = new Date(`${dateString.split('T')[0]}T00:00:00`);
    
    // Format the date components from the local date
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}, ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Update this helper function as well
const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    // Create a date object without converting to UTC
    const date = new Date(`${dateString.split('T')[0]}T00:00:00`);
    
    // Format the date components from the local date
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}, ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Update the getUTCDate function to preserve the exact selected date
const getUTCDate = (date: Date | null): string => {
  if (!date) return "";
  // Format the date in YYYY-MM-DD format while preserving the local date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Add this helper function
const normalizeDate = (date: Date | undefined) => {
  if (!date) return undefined;
  // Create new date object with the same year, month, and day in local timezone
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export function ClassTable() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [originalClasses, setOriginalClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);


  interface Instructor {
    id: number;
    name: string;
  }
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  interface CourseCategory {
    id: number;
    name: string;
  }

  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>(
    []
  );
  interface ClassType {
    id: number;
    name: string;
  }

  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  interface Country {
    id: number;
    CountryName: string;
    currency: string;
    isActive: boolean;
    addedBy: number;
    updatedBy: number | null;
    __locations__: Location[];
  }

  const [countries, setCountries] = useState<Country[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<string>("52"); // Default to US
  const [cities, setCities] = useState<Location[]>([]);
  
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startFrom: "",
    dateTo: "",
    countryId: "52",
    locationId: "",
    instructorId: "",
    courseCategoryId: "",
    classTypeId: "",
    showClass: "",
    globalSearch: "",
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

// Effect to set initial US locations
useEffect(() => {
  if (countries.length > 0) {
    const unitedStates = countries.find(country => country.id === 52);
    if (unitedStates && unitedStates.__locations__) {
      const sortedLocations = [...unitedStates.__locations__].sort((a, b) => 
        a.location.localeCompare(b.location)
      );
      setCities(sortedLocations);
    }
  }
}, [countries]);

  const fetchDropdownData = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      };

      const [instructorsRes, categoriesRes, classTypesRes, countriesRes] =
        await Promise.all([
          fetch(`https://api.4pmti.com/instructor`, { headers }),
          fetch(`https://api.4pmti.com/category`, { headers }),
          fetch(`https://api.4pmti.com/classtype`, { headers }),
          fetch(`https://api.4pmti.com/country`, { headers }),
        ]);

      const [instructorsData, categoriesData, classTypesData, countriesData] =
        await Promise.all([
          instructorsRes.json(),
          categoriesRes.json(),
          classTypesRes.json(),
          countriesRes.json(),
        ]);

      setInstructors(
        instructorsData.data.map((instructor: any) => ({
          id: instructor.id,
          name: instructor.name,
        }))
      );
      setCourseCategories(categoriesData.data);
      setClassTypes(classTypesData.data);
      setCountries(
        countriesData.data.map((country: any) => ({
          id: country.id,
          CountryName: country.CountryName,
          currency: country.currency,
          isActive: country.isActive,
          addedBy: country.addedBy,
          updatedBy: country.updatedBy,
          __locations__: country.__locations__,
        }))
      );
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setIsLoadingDropdowns(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const [globalSearch, setGlobalSearch] = useState("");

  const calculateAvailableSpots = (classItem: ClassData) => {
    // Get enrolled count from enrollmentCount (preferred) or enrolledStudents
    // Convert to number and default to 0 if null/undefined
    const enrolled = classItem.enrollmentCount 
      ? parseInt(classItem.enrollmentCount, 10) 
      : classItem.enrolledStudents || 0;
      
    // Calculate remaining spots
    return classItem.maxStudent - enrolled;
  };

  // Initial data fetch
  useEffect(() => {
    async function fetchInitialClasses() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.4pmti.com/class`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }

        const data = await response.json();
        setClasses(data.data.data);
        setMetadata(data.data.metadata);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchInitialClasses();
  }, []); // Empty dependency array for initial load only

  // Add this function to handle pagination
  const paginateData = (data: ClassData[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Update the handleSearch function to use normalized dates
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', itemsPerPage.toString());
      
      // Add date parameters without time components
      if (searchParams.startFrom) {
        // Keep date as is without any timezone adjustments
        queryParams.append('startFrom', searchParams.startFrom);
      }
      
      if (searchParams.dateTo) {
        // Keep date as is without any timezone adjustments
        queryParams.append('dateTo', searchParams.dateTo);
      }
      
      // Add other search parameters
      if (searchParams.countryId) queryParams.append('countryId', searchParams.countryId);
      if (searchParams.locationId) queryParams.append('locationId', searchParams.locationId);
      if (searchParams.instructorId) queryParams.append('instructorId', searchParams.instructorId);
      if (searchParams.courseCategoryId) queryParams.append('courseCategory', searchParams.courseCategoryId);
      if (searchParams.classTypeId) queryParams.append('classType', searchParams.classTypeId);
      
      // Add status parameters based on showClass value
      switch (searchParams.showClass) {
        case "active":
          queryParams.append('status', 'active');
          break;
        case "inactive":
          queryParams.append('status', 'inactive');
          break;
        case "cancelled":
          queryParams.append('isCancel', 'true');
          break;
        case "corporate":
          queryParams.append('isCorpClass', 'true');
          break;
        case "non-corporate":
          queryParams.append('isCorpClass', 'false');
          break;
        // For "all", don't append any status params
      }

      const response = await fetch(
        `https://api.4pmti.com/class?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      
      setOriginalClasses(data.data.data);
      setClasses(data.data.data);
      setMetadata(data.data.metadata);

    } catch (error) {
      console.error('Error fetching classes:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update the pagination handlers
  const handlePreviousPage = () => {
    if (metadata && metadata.hasPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (metadata && metadata.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Add useEffect to trigger search when page changes
  useEffect(() => {
    handleSearch();
  }, [currentPage]); // Add currentPage as dependency

  // Country change handler
  const handleCountryChange = async (countryId: string) => {
    setSelectedCountry(countryId);
    setSearchParams(prev => ({ 
      ...prev, 
      countryId, 
      locationId: '' 
    }));
    
    // Reset cities
    setCities([]);
    
    // Find and set cities for the selected country
    if (countries.length > 0) {
      const selectedCountry = countries.find(country => country.id.toString() === countryId);
      if (selectedCountry && selectedCountry.__locations__) {
        const sortedLocations = [...selectedCountry.__locations__]
          .sort((a, b) => a.location.localeCompare(b.location))
          .filter(location => !location.isDelete); // Filter out deleted locations
        setCities(sortedLocations);
      }
    }
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = event.target.value;
    setSearchParams((prev) => ({ ...prev, locationId }));
  };

  // Update handleReset function
  async function handleReset(event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    setSearchParams({
      startFrom: '',
      dateTo: '',
      countryId: '52',
      locationId: '',
      instructorId: '',
      courseCategoryId: '',
      classTypeId: '',
      showClass: '',
      globalSearch: ''
    });
    // ... rest of reset function
  }

  // Update this function to properly refresh data
  const refreshClassData = () => {
    handleSearch(); // Call the search function to fetch fresh data with current filters
  };
  
  // Add the missing handleBulkDelete function
  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch('https://api.4pmti.com/class/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ ids: selectedClasses })
      });

      if (!response.ok) {
        throw new Error('Failed to delete classes');
      }

      toast({
        title: "Success",
        description: "Selected classes deleted successfully",
      });

      // Refresh the data and reset selections
      setSelectedClasses([]);
      handleSearch(); // Refresh the table data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete classes",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  // Add this function to handle the "select all" checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // If the checkbox is checked, select all visible classes
      setSelectedClasses(classes.map(c => c.id));
    } else {
      // If the checkbox is unchecked, clear all selections
      setSelectedClasses([]);
    }
  };

  // Make sure you also have the handleSelectClass function
  const handleSelectClass = (classId: number) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        // If the class is already selected, remove it from selections
        return prev.filter(id => id !== classId);
      } else {
        // If the class is not selected, add it to selections
        return [...prev, classId];
      }
    });
  };

  // Add this function to handle local deletion of a class
  const deleteClassLocally = (classId: number) => {
    setClasses((prevClasses) => prevClasses.filter((c) => c.id !== classId));
    setOriginalClasses((prevClasses) => prevClasses.filter((c) => c.id !== classId));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {error && (
        <Alert message={error} type="error" onClose={() => setError(null)} />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold leading-none tracking-tight text-xl">
          Classes
        </p>
        <button
          onClick={() => router.push("/addclass")}
          className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700"
        >
          <Plus size={20} />
          Add Class
        </button>
      </div>

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !searchParams.startFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.startFrom ? (
                  format(new Date(searchParams.startFrom), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={searchParams.startFrom ? new Date(`${searchParams.startFrom}T00:00:00`) : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Format date as YYYY-MM-DD without timezone adjustment
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;
                    
                    setSearchParams((prev) => ({
                      ...prev,
                      startFrom: formattedDate,
                      dateTo: prev.dateTo && new Date(prev.dateTo + 'T00:00:00') < date ? "" : prev.dateTo
                    }));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !searchParams.dateTo && "text-muted-foreground",
                  !searchParams.startFrom && "cursor-not-allowed opacity-50"
                )}
                disabled={!searchParams.startFrom}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.dateTo ? (
                  format(new Date(searchParams.dateTo), "PPP")
                ) : (
                  <span>
                    {!searchParams.startFrom ? "Select start date first" : "Pick a date"}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={searchParams.dateTo ? new Date(`${searchParams.dateTo}T00:00:00`) : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Format date as YYYY-MM-DD without timezone adjustment
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;
                    
                    setSearchParams((prev) => ({
                      ...prev,
                      dateTo: formattedDate
                    }));
                  }
                }}
                disabled={(date) => {
                  return date < (searchParams.startFrom ? new Date(`${searchParams.startFrom}T00:00:00`) : new Date());
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Country</Label>
          {isLoadingDropdowns ? (
            <Loader />
          ) : (
            <Select
              value={searchParams.countryId}
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
        </div>

        {/* Location Dropdown */}
        <div className="flex flex-col gap-2">
          <Label>Location</Label>
          {isLoadingDropdowns ? (
            <Loader />
          ) : (
            <Select
              value={searchParams.locationId}
              onValueChange={(value) => {
                setSearchParams(prev => ({ ...prev, locationId: value }));
              }}
              disabled={!searchParams.countryId}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !searchParams.countryId 
                    ? "Select Country First"
                    : "Select Location"
                } />
              </SelectTrigger>
              <SelectContent>
                {cities && cities.length > 0 ? (
                  cities
                    .filter(city => !city.isDelete) // Only show active locations
                    .map((city) => (
                      <SelectItem 
                        key={city.id} 
                        value={city.id.toString()}
                      >
                        {city.location}
                      </SelectItem>
                    ))
                ) : (
                  <SelectItem value="no-locations" disabled>
                    No locations available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Instructor</Label>
          {isLoadingDropdowns ? (
            <Loader />
          ) : (
            <Select
              value={searchParams.instructorId}
              onValueChange={(value) =>
                setSearchParams({ ...searchParams, instructorId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructors.length > 0 ? (
                  instructors?.map((instructor) => (
                    <SelectItem
                      key={instructor.id}
                      value={instructor.id.toString()}
                    >
                      {instructor.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="text-center text-zinc-500 text-sm p-4">
                    <p>
                      No Instructors Found.{" "}
                      <Link
                        href={"/instructors"}
                        className="hover:underline text-black hover:scale-105"
                      >
                        Create One
                      </Link>
                    </p>
                  </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Course Category</Label>
          {isLoadingDropdowns ? (
            <Loader />
          ) : (
            <Select
              value={searchParams.courseCategoryId}
              onValueChange={(value) =>
                setSearchParams({ ...searchParams, courseCategoryId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {courseCategories.length > 0
                  ? courseCategories?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))
                  : "Data not found"}
              </SelectContent>
            </Select>
          )}
        </div>

        {isLoadingDropdowns ? (
          <div className="flex flex-col gap-2">
            <Label>Class Type</Label>
            <Loader />
          </div>
        ) : (
          <ClassTypeDropdown1
            searchParams={searchParams}
            // @ts-ignore
            setSearchParams={setSearchParams}
            classTypes={classTypes}
          />
        )}

        <div className="flex flex-col gap-2">
          <Label>Show Class</Label>
          <Select
            value={searchParams.showClass}
            onValueChange={(value) => {
              // Only update the searchParams without making an API call
              setSearchParams((prev) => ({ ...prev, showClass: value }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="active">Active Classes</SelectItem>
              <SelectItem value="inactive">Inactive Classes</SelectItem>
              <SelectItem value="cancelled">Cancelled Classes</SelectItem>
              <SelectItem value="corporate">Corporate Classes</SelectItem>
              <SelectItem value="non-corporate">Non-Corporate Classes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between w-full items-center mb-6">
        <div className="flex items-center w-full justify-between gap-4">
          {/* Global Search */}
         <div className="flex items-center gap-4">


          <button
            onClick={handleSearch}
            className="bg-zinc-800 text-white px-6 py-2 rounded hover:bg-zinc-700"
            >
            Search
          </button>
          <button
            onClick={handleReset}
            className="border border-zinc-300 px-6 py-2 rounded hover:bg-zinc-50"
            >
            Reset
          </button>
            </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
            <Input
              placeholder="Search classes..."
              className="pl-9 h-10"
              value={searchParams.globalSearch}
              onChange={async (e) => {
                const searchTerm = e.target.value;
                setSearchParams(prev => ({ ...prev, globalSearch: searchTerm }));
                
                if (searchTerm) {
                  // Filter classes locally when there's a search term
                  const filteredClasses = classes.filter(classItem => 
                    classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    classItem.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    classItem.location?.location?.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  setClasses(filteredClasses);
                } else {
                  // When search is cleared, call handleSearch instead of direct fetch
                  // This will preserve all other filter parameters
                  handleSearch();
                }
              }}
            />
          </div>
        </div>
        
        {selectedClasses.length > 0 && (
          <button
            onClick={() => setShowBulkDeleteModal(true)}
            className="flex items-center ml-3 gap-2 text-red-600 hover:text-red-700 px-4 py-2 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            <span className="text-sm font-medium whitespace-nowrap">
              Delete {selectedClasses.length} selected
            </span>
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <TableShimmer />
      ) : (
        <div className="overflow-x-auto pb-40">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedClasses.length === classes.length && classes.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Start Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">End Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Instructor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Enrolled</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Left</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {classes && classes.length > 0 ? (
                classes.map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-zinc-50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(classItem.id)}
                        onChange={() => handleSelectClass(classItem.id)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                      />
                    </TableCell>
                    <TableCell>
                      {classItem.category?.name || "N/A"}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-900">
                      {classItem.title}
                    </TableCell>
                    <TableCell>
                      {classItem.location?.location || "1"}
                    </TableCell>
                    <TableCell>
                      {formatDateFromAPI(classItem.startDate)}
                    </TableCell>
                    <TableCell>
                      {formatDateFromAPI(classItem.endDate)}
                    </TableCell>
                    <TableCell>
                      {/* This line is really important */}
                      {/* @ts-ignore */}
                      {classItem?.instructor?.name || "Not assigned"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          classItem.status === "active"
                            ? "bg-green-100 text-green-800"
                            : classItem.status === "inactive"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {classItem.status === "active"
                          ? "Active"
                          : classItem.status === "inactive"
                          ? "Inactive"
                          : "Cancelled"}
                      </span>
                    </TableCell>
                    <TableCell>{classItem.enrollmentCount || "N/A"}</TableCell>
                    <TableCell>{calculateAvailableSpots(classItem)}</TableCell>
                    <TableCell>
                      <ActionDropdown
                        classId={classItem.id}
                        refreshData={refreshClassData}
                        classItem={classItem}
                        onDelete={deleteClassLocally}
                      />
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-4">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {metadata && (
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-zinc-600">
            Showing page {metadata.currentPage} of {metadata.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={!metadata.hasPrevious}
              className="px-4 py-2 border border-zinc-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 hover:bg-zinc-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!metadata.hasNext}
              className="px-4 py-2 border border-zinc-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 hover:bg-zinc-200"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Classes"
        message={`Are you sure you want to delete ${selectedClasses.length} selected classes? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default ClassTable;
