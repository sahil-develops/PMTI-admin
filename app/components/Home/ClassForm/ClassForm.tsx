'use client'
import React, {useState,useEffect} from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Define the form schema with Zod
const classFormSchema = z.object({
  // Basic Information
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),

  // IDs and Numbers
  categoryId: z.coerce.number().positive("Category ID is required"),
  classTypeId: z.coerce.number().positive("Class Type ID is required"),
  countryId: z.coerce.number().positive("Country ID is required"),
  locationId: z.coerce.number().positive("Location ID is required"),
  instructorId: z.coerce.number().positive("Instructor ID is required"),
  stateId: z.coerce.number().positive("State ID is required"),
  // Students and Price
  maxStudent: z.coerce.number()
    .min(1, "Maximum students must be at least 1")
    .max(100, "Maximum 100 students allowed"),
  minStudent: z.coerce.number()
    .min(1, "Minimum students must be at least 1"),
  price: z.coerce.number()
    .positive("Price must be greater than 0")
    .max(10000, "Price cannot exceed 10000"),

  // Address
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters")
    .regex(/^[a-zA-Z0-9\s,.-]+$/, "Please enter a valid address"),

  // Dates
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),

  // Time
  classTimeFrom: z.string().min(1, "Start time is required"),
  classTimeTo: z.string().min(1, "End time is required"),
  formattedTimeFrom: z.string(),
  formattedTimeTo: z.string(),

  // Course ID - remove validation requirements
  onlineCourseId: z.string().optional(),

  // Booleans
  onlineAvailable: z.boolean(),
  isCorpClass: z.boolean(),
  status: z.string().min(1, "Status is required"),
  isCancel: z.boolean().default(false),
  isDelete: z.boolean().default(false),

  // Added/Updated By
  addedBy: z.number().default(1),
  updatedBy: z.number().default(1),

  // Optional Hotel and Travel Information
  hotel: z.string().optional(),
  hotelEmailId: z.string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  hotelContactNo: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  
  // Updated confirmation fields without strict regex
  flightConfirmation: z.string()
    .optional()
    .or(z.literal("")),
  carConfirmation: z.string()
    .optional()
    .or(z.literal("")),
  hotelConfirmation: z.string()
    .optional()
    .or(z.literal("")),
}).refine(
  (data) => {
    // Validate that endDate is after startDate
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: "End date must be after start date",
    path: ["endDate"]
  }
).refine(
  (data) => {
    // Validate that classTimeTo is after classTimeFrom
    const from = new Date(`2000/01/01 ${data.classTimeFrom}`);
    const to = new Date(`2000/01/01 ${data.classTimeTo}`);
    return to > from;
  },
  {
    message: "End time must be after start time",
    path: ["classTimeTo"]
  }
).refine(
  (data) => {
    // Validate that minStudent is less than maxStudent
    return data.minStudent <= data.maxStudent;
  },
  {
    message: "Minimum students cannot exceed maximum students",
    path: ["minStudent"]
  }
).refine(
  (data) => {
    // Update the date validation
    return data.endDate >= data.startDate;
  },
  {
    message: "End date must be on or after start date",
    path: ["endDate"]
  }
);


type ClassFormData = z.infer<typeof classFormSchema>;


type State = {
  id: number;
  name: string;
  locations: Location[];
  country: Country;
};
// Add this type after your ClassFormData type
type Category = {
  id: number;
  name: string;
  description: string;
  isDelete: boolean;
  active: boolean;
};

// Add this type after the Category type
type ClassType = {
  id: number;
  name: string;
  description: null | string;
  isDelete: boolean;
  active: boolean;
  duration?: number;
};

// Add these types after your existing types
type Country = {
  id: number;
  CountryName: string;
  currency: string;
  isActive: boolean;
  addedBy: number;
  updatedBy: number | null;
  __locations__: Location[];
};

type Location = {
  id: number;
  location: string;
  isDelete: boolean;
  createdAt: string;
  updateAt: string;
  addedBy: string;
  updatedBy: string;
};

// Add this type with your other types
type Instructor = {
  id: number;
  uid: string;
  name: string;
  emailID: string;
  mobile: string;
  telNo: string;
  billingAddress: string;
  contactAddress: string;
  profile: string;
  isDelete: boolean;
  active: boolean;
};

const ClassForm = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingClassTypes, setLoadingClassTypes] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  const [states, setStates] = useState<State[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      categoryId: 1,
      classTypeId: 2,
      countryId: 52,
      stateId: 1,
      maxStudent: 30,
      minStudent: 5,
      price: 150.0,
      status: "active",
      onlineAvailable: true,
      isCancel: false,
      isCorpClass: false,
      addedBy: 1,
      updatedBy: 1,
      isDelete: false,
      formattedTimeFrom: '',
      formattedTimeTo: '',
      startDate: undefined,
      endDate: undefined,
    }
  });

  // Watch classTimeFrom and classTimeTo to combine them
  const classTimeFrom = watch("classTimeFrom");
  const classTimeTo = watch("classTimeTo");

  useEffect(() => {
    if (classTimeFrom && classTimeTo) {
      // @ts-ignore
      setValue("classTime", `${classTimeFrom} - ${classTimeTo}`);
    }
  }, [classTimeFrom, classTimeTo, setValue]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('https://api.4pmti.com/category', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const countryId = watch('countryId');
    const selectedCountry = countries.find(country => country.id === Number(countryId));
    if (selectedCountry) {
      const activeLocations = selectedCountry.__locations__.filter(loc => loc.isDelete === false);
      setLocations(activeLocations);
    } else {
      setLocations([]);
    }
  }, [watch('countryId'), countries]);

  // Add a helper function to extract duration from class type name
  const extractDuration = (classTypeName: string): number => {
    const match = classTypeName.match(/(\d+)\s*Day/i);
    return match ? parseInt(match[1], 10) : 1; // Default to 1 if no match
  };

  // Process class types to include duration
  useEffect(() => {
    const fetchClassTypes = async () => {
      setLoadingClassTypes(true);
      try {
        const response = await fetch('https://api.4pmti.com/classtype', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch class types');
        }

        const result = await response.json();
        if (result.success && result.data) {
          // Process each class type to extract duration from name
          const processedClassTypes = result.data.map((classType: ClassType) => ({
            ...classType,
            duration: extractDuration(classType.name)
          }));
          setClassTypes(processedClassTypes);
        }
      } catch (error) {
        console.error('Error fetching class types:', error);
      } finally {
        setLoadingClassTypes(false);
      }
    };

    fetchClassTypes();
  }, []);

  // Add handler for class type selection to update end date
  const handleClassTypeChange = (value: string) => {
    const classTypeId = Number(value);
    setValue("classTypeId", classTypeId);
    
    // Get the selected class type
    const selectedClassType = classTypes.find(ct => ct.id === classTypeId);
    
    // If we have a start date and class type with duration, calculate end date
    if (selectedClassType?.duration && watch("startDate")) {
      const startDate = new Date(watch("startDate"));
      const endDate = new Date(startDate);
      
      // Add duration-1 days (since start date counts as day 1)
      endDate.setDate(startDate.getDate() + (selectedClassType.duration - 1));
      
      // Set the end date
      setValue("endDate", endDate);
    }
  };

  // Also update the start date change handler to recalculate end date if class type is selected
  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    const localDate = normalizeDate(date);
    // @ts-ignore
    setValue("startDate", localDate);
    
    // Get the selected class type
    const classTypeId = watch("classTypeId");
    const selectedClassType = classTypes.find(ct => ct.id === classTypeId);
    
    // If we have a class type with duration, calculate end date
    if (selectedClassType?.duration && localDate) {
      const endDate = new Date(localDate);
      
      // Add duration-1 days (since start date counts as day 1)
      endDate.setDate(localDate.getDate() + (selectedClassType.duration - 1));
      // Set the end date
      // @ts-ignore
      setValue("endDate", endDate);
    } else if (watch("endDate") && localDate && watch("endDate") < localDate) {
      // Reset end date if it's before new start date
      // @ts-ignore
      setValue("endDate", undefined);
    }
  };

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
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchInstructors = async () => {
      setLoadingInstructors(true);
      try {
        const response = await fetch('https://api.4pmti.com/instructor', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch instructors');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setInstructors(result.data);
        }
      } catch (error) {
        console.error('Error fetching instructors:', error);
      } finally {
        setLoadingInstructors(false);
      }
    };

    fetchInstructors();
  }, []);

// Add this after your imports
const formatTime = (time: string) => {
  if (!time) return '';
  try {
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(/\s+/g, ''); // Remove space between time and AM/PM
  } catch (e) {
    return '';
  }
};

// Update the normalizeDate function
const normalizeDate = (date: Date | undefined) => {
  if (!date) return undefined;
  return date;
};

// Update this function to format dates properly
// Replace the existing formatDateForAPI function with this improved version
const formatDateForAPI = (date: Date | undefined): string => {
  if (!date) return '';
  
  // Format as MM-dd-YYYY using toLocaleString
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-'); // Replace / with -
};
// Update the onSubmit function
const onSubmit = async (data: ClassFormData) => {
  setLoading(true);
  setShowError(false);

  try {
    // Format the times
    const formattedTimeFrom = formatTime(data.classTimeFrom);
    const formattedTimeTo = formatTime(data.classTimeTo);
    
    // Format dates properly in MM-dd-YYYY format
    const startDateFormatted = formatDateForAPI(data.startDate);
    const endDateFormatted = formatDateForAPI(data.endDate);

    // Prepare the data for submission
    const submitData = {
      title: data.title,
      description: data.description,
      categoryId: Number(data.categoryId),
      classTypeId: Number(data.classTypeId),
      countryId: Number(data.countryId),
      locationId: Number(data.locationId),
      instructorId: Number(data.instructorId),
      stateId: Number(data.stateId) || 1, // Add default value if not set
      maxStudent: Number(data.maxStudent),
      minStudent: Number(data.minStudent),
      price: Number(data.price),
      address: data.address,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      classTimeFrom: formattedTimeFrom,
      classTimeTo: formattedTimeTo,
      classTime: `${formattedTimeFrom} - ${formattedTimeTo}`,
      onlineCourseId: data.onlineCourseId || "",
      onlineAvailable: Boolean(data.onlineAvailable),
      isCorpClass: Boolean(data.isCorpClass),
      status: data.status,
      isCancel: Boolean(data.isCancel),
      isDelete: Boolean(data.isDelete),
      addedBy: Number(data.addedBy),
      updatedBy: Number(data.updatedBy),
      hotel: data.hotel || "",
      hotelEmailId: data.hotelEmailId || "",
      hotelContactNo: data.hotelContactNo || "",
      flightConfirmation: data.flightConfirmation || "",
      carConfirmation: data.carConfirmation || "",
      hotelConfirmation: data.hotelConfirmation || "",
      coverImage: coverImageUrl || ""
    };

    console.log('Submitting data:', submitData); // For debugging

    const response = await fetch('https://api.4pmti.com/class', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(submitData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create class');
    }

    const result = await response.json();
    console.log('Success:', result); // For debugging
    setShowSuccess(true);
  } catch (error) {
    console.error('Error:', error); // For debugging
    setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    setShowError(true);
  } finally {
    setLoading(false);
  }
};

  // Reusable form field component
  const FormField = ({ label, name, type = "text", required = true, ...props }: { label: string; name: keyof ClassFormData; type?: string; required?: boolean; [key: string]: any }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name)}
        className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 border ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        } focus:border-blue-500 focus:ring-blue-500`}
        {...props}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name]?.message}</p>
      )}
    </div>
  );

  // Add this loading component
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

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [isCoverImageUploading, setIsCoverImageUploading] = useState(false);
  const [coverImageError, setCoverImageError] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const handleCoverImageUpload = async (file: File) => {
    const allowedTypes = ['png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setCoverImageError('Only PNG, JPG, and JPEG files are allowed.');
      return;
    }

    setIsCoverImageUploading(true);
    setCoverImageError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://api.4pmti.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setCoverImageUrl(data.data.url); // Assuming the API returns the image URL in this format
      setIsPreviewVisible(true); // Automatically show the preview
    } catch (error) {
      setCoverImageError('Failed to upload cover image. Please try again.');
    } finally {
      setIsCoverImageUploading(false);
    }
  };

  return (
    <div className="max-w-full bg-white mx-auto p-4">
      {/* Breadcrumb */}
      <nav className="flex mb-2" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 text-sm">
          <li>
            <Link href="/" className="text-zinc-500 hover:text-zinc-700">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </li>
          <li className="text-zinc-900 font-medium">Add Class</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight mb-4">Add Class</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
  <label className="block text-sm font-medium text-gray-700">
    Cover Image <span className="text-red-500">*</span>
  </label>
  <input
    type="file"
    accept="image/png, image/jpeg"
    onChange={(e) => {
      if (e.target.files && e.target.files[0]) {
        setCoverImage(e.target.files[0]);
        handleCoverImageUpload(e.target.files[0]);
      }
    }}
    className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 border ${
      coverImageError ? 'border-red-500' : 'border-gray-300'
    } focus:border-blue-500 focus:ring-blue-500`}
  />
  {coverImageError && (
    <p className="mt-1 text-sm text-red-500">{coverImageError}</p>
  )}
  {isCoverImageUploading && (
    <p className="mt-1 text-sm text-gray-500">Uploading cover image...</p>
  )}

  {isPreviewVisible && coverImageUrl && (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700">Image Preview:</h3>
      <img
        src={coverImageUrl}
        alt="Cover Preview"
        className="mt-2 w-1/3 h-auto rounded-md border border-gray-300"
      />
      <button
        type="button"
        onClick={() => {
          setCoverImage(null);
          setCoverImageUrl('');
          setIsPreviewVisible(false);
        }}
        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Delete Image
      </button>
    </div>
  )}
</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Basic Information Section */}
          <div className="md:col-span-2">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Title"
                name="title"
                placeholder="Enter class title"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
  onValueChange={(value) => {
    setValue("status", value);
  }}
  defaultValue="active" // This correctly sets the visual default
>
  <SelectTrigger 
    className={`mt-1 bg-white w-full ${
      errors.status ? 'border-red-500' : 'border-gray-300'
    }`}
  >
    <SelectValue placeholder="Select status" className="bg-white" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
  </SelectContent>
</Select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description")}
                  rows={1}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 border ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Category and Class Type */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) => {
                    setValue("categoryId", Number(value));
                  }}
                  defaultValue={watch("categoryId")?.toString()}
                >
                  <SelectTrigger 
                    className={`mt-1 bg-white w-full ${
                      errors.categoryId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {loadingCategories ? (
                      <LoadingSpinner />
                    ) : (
                      <SelectValue placeholder="Select a category" className="bg-white" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">{errors.categoryId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Class Type <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={handleClassTypeChange}
                  defaultValue={watch("classTypeId")?.toString()}
                >
                  <SelectTrigger 
                    className={`mt-1 bg-white w-full ${
                      errors.classTypeId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {loadingClassTypes ? (
                      <LoadingSpinner />
                    ) : (
                      <SelectValue placeholder="Select a class type" className="bg-white" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {classTypes?.map((classType) => (
                      <SelectItem 
                        key={classType.id} 
                        value={classType.id.toString()}
                      >
                        {classType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classTypeId && (
                  <p className="mt-1 text-sm text-red-500">{errors.classTypeId.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) => {
                    setValue("countryId", Number(value));
                    setValue("locationId", 0); // Reset location when country changes
                  }}
                  defaultValue="52" // Set United States as default
                >
                  <SelectTrigger 
                    className={`mt-1 bg-white w-full ${
                      errors.countryId ? 'border-red-500' : 'border-gray-300'
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
                {errors.countryId && (
                  <p className="mt-1 text-sm text-red-500">{errors.countryId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) => {
                    setValue("locationId", Number(value));
                  }}
                  disabled={!watch('countryId') || locations.length === 0}
                >
                  <SelectTrigger 
                    className={`mt-1 bg-white w-full ${
                      errors.locationId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <SelectValue placeholder="Select a location" className="bg-white" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem 
                        key={location.id} 
                        value={location.id.toString()}
                      >
                        {location.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.locationId && (
                  <p className="mt-1 text-sm text-red-500">{errors.locationId.message}</p>
                )}
              </div>
            </div>

            <FormField
              label="Address"
              name="address"
              placeholder="Enter complete address"
            />
          </div>

          {/* Class Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild className="w-full justify-start text-left font-normal bg-white"  >
                    <button
                      type="button"
                      className={cn(
                        "w-full justify-start text-left font-normal ",
                        "rounded-md border p-2",
                        errors.startDate ? 'border-red-500' : 'border-gray-300',
                        !watch("startDate") && "text-gray-500"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {watch("startDate") ? (
                          format(watch("startDate"), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch("startDate")}
                      onSelect={handleStartDateChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild className="w-full justify-start text-left font-normal bg-white"  >
                    <button
                      type="button"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        "rounded-md border p-2",
                        errors.endDate ? 'border-red-500' : 'border-gray-300',
                        !watch("endDate") && "text-gray-500"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {watch("endDate") ? (
                          format(watch("endDate"), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch("endDate")}
                      onSelect={(date) => {
                        if (date) {
                          const localDate = normalizeDate(date);
                          // @ts-ignore
                          setValue("endDate", localDate);
                        }
                      }}
                      disabled={(date) => 
                        date < new Date() || // Can't select past dates
                        (watch("startDate") && date < watch("startDate")) // Can't select dates before start date
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate.message}</p>
                )}
              </div>
            </div>
            {/* Time inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">From</label>
                <input
                  type="time"
                  {...register("classTimeFrom", {
                    onChange: (e) => {
                      const formattedTime = formatTime(e.target.value);
                      setValue("formattedTimeFrom", formattedTime);
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 border ${
                    errors.classTimeFrom ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors.classTimeFrom && (
                  <p className="mt-1 text-sm text-red-500">{errors.classTimeFrom.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600">To</label>
                <input
                  type="time"
                  {...register("classTimeTo", {
                    onChange: (e) => {
                      const formattedTime = formatTime(e.target.value);
                      setValue("formattedTimeTo", formattedTime);
                    }
                  })}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 border ${
                    errors.classTimeTo ? 'border-red-500' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors.classTimeTo && (
                  <p className="mt-1 text-sm text-red-500">{errors.classTimeTo.message}</p>
                )}
              </div>
            </div>
            {/* Show formatted time for preview */}
            {watch('formattedTimeFrom') && watch('formattedTimeTo') && (
              <p className="text-sm text-gray-500">
                Class Time: {watch('formattedTimeFrom')} - {watch('formattedTimeTo')}
              </p>
            )}
          </div>

          {/* Instructor and Course Info */}
          <div className="space-y-4">
            <FormField
              label="Online Course ID"
              name="onlineCourseId"
              placeholder="OC-2024-ADVJS"
              required={false}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Instructor <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(value) => {
                  setValue("instructorId", Number(value));
                }}
                defaultValue={watch("instructorId")?.toString()}
              >
                <SelectTrigger 
                  className={`bg-white w-full ${
                    errors.instructorId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {loadingInstructors ? (
                    <LoadingSpinner />
                  ) : (
                    <SelectValue placeholder="Select an instructor" className="bg-white" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {instructors?.map((instructor) => (
                    <SelectItem 
                      key={instructor.id} 
                      value={instructor.id.toString()}
                    >
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.instructorId && (
                <p className="mt-1 text-sm text-red-500">{errors.instructorId.message}</p>
              )}
              <div className="mt-2 text-sm flex items-center gap-1">
                <span className="text-gray-600">Didn't find instructor?</span>
                <Link 
                  href="/instructors" 
                  className="text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  Create One
                </Link>
              </div>
            </div>
          </div>

          {/* Student and Price Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Max Students"
                name="maxStudent"
                type="number"
              />
              <FormField
                label="Min Students"
                name="minStudent"
                type="number"
              />
            </div>
            <FormField
              label="Price"
              name="price"
              type="number"
              step="0.01"
            />
          </div>

          {/* Optional Information */}
          <div className="md:col-span-2">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Additional Information (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                label="Hotel"
                name="hotel"
                required={false}
                placeholder="Hotel name"
              />
              <FormField
                label="Hotel Email"
                name="hotelEmailId"
                type="email"
                required={false}
                placeholder="hotel@example.com"
              />
              <FormField
                label="Hotel Contact"
                name="hotelContactNo"
                required={false}
                placeholder="+1234567890"
              />
            </div>
            
            {/* Add confirmation numbers section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Flight Confirmation"
                name="flightConfirmation"
                required={false}
                placeholder="Enter flight confirmation number"
              />
              <FormField
                label="Car Confirmation"
                name="carConfirmation"
                required={false}
                placeholder="Enter car confirmation number"
              />
              <FormField
                label="Hotel Confirmation"
                name="hotelConfirmation"
                required={false}
                placeholder="Enter hotel confirmation number"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="md:col-span-2 flex gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("isCorpClass")}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Corporate Class
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? "bg-gray-400" : "bg-zinc-800 hover:bg-zinc-900"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? "Creating..." : "Create Class"}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Success!</h3>
            <p className="text-gray-500 text-center">Class has been created successfully.</p>
            <button
              onClick={() => {
                setShowSuccess(false);
                window.location.href = '/';
              }}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-600 text-center mb-2">Error</h3>
            <p className="text-gray-500 text-center">
              {errorMessage || "Something went wrong. Please try again."}
            </p>
            <button
              onClick={() => setShowError(false)}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassForm;