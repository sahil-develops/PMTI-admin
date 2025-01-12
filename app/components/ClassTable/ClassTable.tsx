"use client";
import React, { useState, useEffect, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
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
import SearchSelect from '../DropDown/SearchSelect';
import ClassTypeDropdown1 from "@/app/components/DropDown/ClassTypeDropdown1";
import { ClassSearchForm } from './ClassSearchForm';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

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

interface ClassData {
  category: any;
  id: number;
  title: string;
  classType: ClassType;
  startDate: string;
  endDate: string;
  location: Location;
  instructor: string | null;
  status: string;
  maxStudent: number;
  minStudent: number;
  enrolledStudents?: number;
  description: string;
  onlineAvailable: boolean;
  isCancel: boolean;
  isDelete: boolean;
  price: string;
  address: string;
}

interface Metadata {
  total: number;
  totalPages: number;
  currentPage: string;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: string;
}

interface SearchParams {
  startDateFrom: string;
  startDateTo: string;
  countryId: string;
  locationId: string;
  instructorId: string;
  courseCategoryId: string;
  classTypeId: string;
  showClass: string;
  globalSearch: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
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

  const handleDelete = async () => {
    setIsDeleting(true);
    onDelete(classId);

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
      
      // Refresh the data
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
        router.push(`/class-details/${classId}`);
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
              <button
                onClick={() => handleAction("delete")}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                {isDeleting ? "Deleting..." : "Delete class"}
              </button>
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

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">
    {children}
  </th>
);

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

// Alternative version with a pulse effect if you prefer
const LoaderAlt = () => (
  <div className="flex items-center justify-between bg-zinc-50/50 rounded-md px-3 py-2 border border-zinc-200">
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-4 h-4 bg-zinc-300 rounded-full animate-pulse"></div>
        <div className="absolute top-0 -start-1 w-4 h-4 bg-zinc-300 rounded-full animate-ping"></div>
      </div>
      <span className="text-sm text-zinc-500 font-medium animate-pulse">Loading...</span>
    </div>
  </div>
);

// Or a spinner version
const LoaderSpinner = () => (
  <div className="flex items-center justify-between bg-zinc-50/50 rounded-md px-3 py-2 border border-zinc-200">
    <div className="flex items-center gap-2">
      <svg 
        className="animate-spin h-4 w-4 text-zinc-400" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="text-sm text-zinc-500 font-medium">Loading...</span>
    </div>
  </div>
);

export function ClassTable() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [currentPage, setCurrentPage] = useState(1);


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

  const [cities, setCities] = useState<Location[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startDateFrom: "",
    startDateTo: "",
    countryId: "",
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
    const enrolled = classItem.enrolledStudents || 0;
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

  // Modified handleSearch function
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Remove global search from API call
      if (searchParams.startDateFrom) queryParams.append('startDateFrom', searchParams.startDateFrom);
      if (searchParams.startDateTo) queryParams.append('startDateTo', searchParams.startDateTo);
      if (searchParams.countryId) queryParams.append('countryId', searchParams.countryId);
      if (searchParams.locationId) queryParams.append('locationId', searchParams.locationId);
      if (searchParams.instructorId) queryParams.append('instructorId', searchParams.instructorId);
      if (searchParams.courseCategoryId) queryParams.append('courseCategory', searchParams.courseCategoryId);
      if (searchParams.classTypeId) queryParams.append('classType', searchParams.classTypeId);
      if (searchParams.showClass) queryParams.append('showClass', searchParams.showClass);
      
      // Add pagination
      queryParams.append('page', currentPage.toString());
      queryParams.append('limit', '10');

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
      
      // If there's an active search term, filter the new data
      if (searchParams.globalSearch) {
        const filteredClasses = filterClasses(data.data.data, searchParams.globalSearch);
        setClasses(filteredClasses);
      } else {
        setClasses(data.data.data);
      }
      
      setMetadata(data.data.metadata);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Modified handleReset function
  const handleReset = async () => {
    setSearchParams({
      startDateFrom: "",
      startDateTo: "",
      countryId: "",
      locationId: "",
      instructorId: "",
      courseCategoryId: "",
      classTypeId: "",
      showClass: "",
      globalSearch: "",
    });
    setCities([]);
    setCurrentPage(1);
    await handleSearch();
  };

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = event.target.value;
    setSelectedCountry(countryId);
    setSearchParams((prev) => ({ ...prev, countryId }));

    const selectedCountryData = countries.find(
      (country) => country.id.toString() === countryId
    );
    if (selectedCountryData) {
      // @ts-ignore
      setCities(selectedCountryData.locations);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = event.target.value;
    setSearchParams((prev) => ({ ...prev, locationId }));
  };

  // Loading shimmer component
  const TableShimmer = () => (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-zinc-200 h-16 bg-zinc-50" />
      ))}
    </div>
  );

  const deleteClassLocally = (classId: number) => {
    setClasses((prevClasses) => prevClasses.filter((c) => c.id !== classId));
  };

  const refreshClassTypes = async () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };
    const response = await fetch(
      `https://api.4pmti.com/classtype`,
      { headers }
    );
    const data = await response.json();
    setClassTypes(data.data);
  };

  const router = useRouter();

  const handleSort = (key: string) => {
    setSortConfig((currentSort) => {
      if (currentSort.key === key) {
        return {
          key,
          direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });

    setClasses(prevClasses => {
      const sortedClasses = [...prevClasses].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (key) {
          case 'category':
            aValue = a.classType?.category?.name;
            bValue = b.classType?.category?.name;
            break;
          case 'location':
            aValue = a.location?.location;
            bValue = b.location?.location;
            break;
          case 'instructor':
            // @ts-ignore
            aValue = a.instructor?.name;
            // @ts-ignore
            bValue = b.instructor?.name;
            break;
          default:
            // @ts-ignore
            aValue = a[key];
            // @ts-ignore
            bValue = b[key];
        }

        // Handle null/undefined values
        if (!aValue) return 1;
        if (!bValue) return -1;

        // Compare the values
        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        const comparison = aValue > bValue ? 1 : -1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });

      return sortedClasses;
    });
  };

  const SortableTableHeader = ({ children, sortKey }: { children: React.ReactNode; sortKey: string }) => (
    <th 
      className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap cursor-pointer hover:bg-zinc-100"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortConfig.key === sortKey && (
          <span className="text-xs">
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedClasses(classes.map(c => c.id));
    } else {
      setSelectedClasses([]);
    }
  };

  const handleSelectClass = (classId: number) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

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

  // Add this function after the handleSort function
  const filterClasses = (classes: ClassData[], searchTerm: string) => {
    if (!searchTerm) return classes;
    
    const searchLower = searchTerm.toLowerCase();
    return classes.filter(classItem => {
      return (
        classItem.title?.toLowerCase().includes(searchLower) ||
        classItem.category?.name?.toLowerCase().includes(searchLower) ||
        classItem.location?.location?.toLowerCase().includes(searchLower) ||
        // @ts-ignore
        classItem.instructor?.name?.toLowerCase().includes(searchLower) ||
        classItem.status?.toLowerCase().includes(searchLower)
      );
    });
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
                  !searchParams.startDateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.startDateFrom ? (
                  format(new Date(searchParams.startDateFrom), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={searchParams.startDateFrom ? new Date(searchParams.startDateFrom) : undefined}
                onSelect={(date) => {
                  setSearchParams((prev) => ({
                    ...prev,
                    startDateFrom: date ? format(date, "yyyy-MM-dd") : "",
                    // Clear end date if it's before new start date
                    startDateTo: prev.startDateTo && date && new Date(prev.startDateTo) < date 
                      ? "" 
                      : prev.startDateTo
                  }));
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
                  !searchParams.startDateTo && "text-muted-foreground",
                  !searchParams.startDateFrom && "cursor-not-allowed opacity-50"
                )}
                disabled={!searchParams.startDateFrom}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.startDateTo ? (
                  format(new Date(searchParams.startDateTo), "PPP")
                ) : (
                  <span>
                    {!searchParams.startDateFrom ? "Select start date first" : "Pick a date"}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={searchParams.startDateTo ? new Date(searchParams.startDateTo) : undefined}
                onSelect={(date) => {
                  setSearchParams((prev) => ({
                    ...prev,
                    startDateTo: date ? format(date, "yyyy-MM-dd") : ""
                  }));
                }}
                disabled={(date) => {
                  // Disable dates before start date
                  return date < (searchParams.startDateFrom ? new Date(searchParams.startDateFrom) : new Date());
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
              onValueChange={(value) => {
                setSearchParams(prev => ({ ...prev, countryId: value, locationId: '' }));
                const selectedCountry = countries.find(c => c.id.toString() === value);
                if (selectedCountry) {
                  setCities(selectedCountry.__locations__);
                } else {
                  setCities([]);
                }
              }}
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
              disabled={!searchParams.countryId || cities.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !searchParams.countryId 
                    ? "Select Country First" 
                    : cities.length === 0 
                      ? "No Locations Available" 
                      : "Select Location"
                } />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem 
                    key={city.id} 
                    value={city.id.toString()}
                  >
                    {city.location}
                  </SelectItem>
                ))}
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
            onValueChange={(value) =>
              setSearchParams({ ...searchParams, showClass: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="all">All</SelectItem>
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
                  const filteredClasses = filterClasses(classes, searchTerm);
                  setClasses(filteredClasses);
                } else {
                  // When search is cleared, fetch fresh data from API
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
                <SortableTableHeader sortKey="category">Category</SortableTableHeader>
                <SortableTableHeader sortKey="title">Title</SortableTableHeader>
                <SortableTableHeader sortKey="location">Location</SortableTableHeader>
                <SortableTableHeader sortKey="startDate">Start Date</SortableTableHeader>
                <SortableTableHeader sortKey="endDate">End Date</SortableTableHeader>
                <SortableTableHeader sortKey="instructor">Instructor</SortableTableHeader>
                <SortableTableHeader sortKey="status">Status</SortableTableHeader>
                <SortableTableHeader sortKey="enrolledStudents">Enrolled</SortableTableHeader>
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
                      {new Date(classItem.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(classItem.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {/* This line is really important */}
                      {/* @ts-ignore */}
                      {classItem?.instructor?.name || "Not assigned"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          classItem.status === "1"
                            ? "bg-green-100 text-green-800"
                            : classItem.status === "2"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {classItem.status === "1"
                          ? "Active"
                          : classItem.status === "2"
                          ? "Pending"
                          : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{classItem.minStudent || 0}</TableCell>
                    <TableCell>{calculateAvailableSpots(classItem)}</TableCell>
                    <TableCell>
                      <ActionDropdown
                        classId={classItem.id}
                        refreshData={() => setClasses([])}
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
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={!metadata.hasPrevious}
              className="px-4 py-2 border border-zinc-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 hover:bg-zinc-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
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
