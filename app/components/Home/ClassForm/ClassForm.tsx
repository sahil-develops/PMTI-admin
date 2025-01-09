'use client'
import React, {useState,useEffect} from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Define the form schema with Zod
const classFormSchema = z.object({
  // Basic Information
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s]+$/, "Title must contain only letters, numbers and spaces"),
  
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),

  // IDs and Numbers
  categoryId: z.coerce.number().positive("Category ID is required"),
  classTypeId: z.coerce.number().positive("Class Type ID is required"),
  countryId: z.coerce.number().positive("Country ID is required"),
  locationId: z.coerce.number().positive("Location ID is required"),
  instructorId: z.coerce.number().positive("Instructor ID is required"),
  
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
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),

  // Time
  classTimeFrom: z.string().min(1, "Start time is required"),
  classTimeTo: z.string().min(1, "End time is required"),
  formattedTimeFrom: z.string(),
  formattedTimeTo: z.string(),

  // Course ID
  onlineCourseId: z.string()
    .regex(/^[A-Z]{2,}-\d{4}-[A-Z0-9]+$/, "Please enter a valid course ID (e.g., OC-2024-ADVJS)"),

  // Booleans
  onlineAvailable: z.boolean(),
  isCorpClass: z.boolean(),
  status: z.boolean().default(true),
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
  flightConfirmation: z.string()
    .regex(/^[A-Z]+-\d{6}$/, "Please enter a valid flight confirmation (e.g., FLIGHT-123456)")
    .optional()
    .or(z.literal("")),
  carConfirmation: z.string()
    .regex(/^[A-Z]+-\d{6}$/, "Please enter a valid car confirmation (e.g., CAR-123456)")
    .optional()
    .or(z.literal("")),
  hotelConfirmation: z.string()
    .regex(/^[A-Z]+-\d{6}$/, "Please enter a valid hotel confirmation (e.g., HOTEL-123456)")
    .optional()
    .or(z.literal(""))
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
);


type ClassFormData = z.infer<typeof classFormSchema>;

const ClassForm = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      countryId: 1,
      locationId: 2,
      maxStudent: 30,
      minStudent: 5,
      price: 150.0,
      status: true,
      onlineAvailable: true,
      isCancel: false,
      addedBy: 1,
      updatedBy: 1,
      isDelete: false,
      formattedTimeFrom: '',
      formattedTimeTo: ''
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

// Add this after your imports
const formatTime = (time: string) => {
  if (!time) return '';
  try {
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(/\s+/g, ''); // Remove space between time and AM/PM
  } catch (e) {
    return '';
  }
};

// Update your onSubmit function
const onSubmit = async (data: ClassFormData) => {
  setLoading(true);
  setShowError(false);

  try {
    // Format the times
    const formattedTimeFrom = formatTime(data.classTimeFrom);
    const formattedTimeTo = formatTime(data.classTimeTo);
    
    // Prepare the data for submission
    const submitData = {
      ...data,
      classTime: `${formattedTimeFrom} - ${formattedTimeTo}`,
      // Convert IDs to numbers
      categoryId: Number(data.categoryId),
      classTypeId: Number(data.classTypeId),
      countryId: Number(data.countryId),
      locationId: Number(data.locationId),
      maxStudent: Number(data.maxStudent),
      minStudent: Number(data.minStudent),
      price: Number(data.price),
      addedBy: Number(data.addedBy),
      updatedBy: Number(data.updatedBy),
      instructorId: Number(data.instructorId)
    };

    const response = await fetch(`https://api.4pmti.com/class`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify(submitData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create class");
    }

    setShowSuccess(true);
  } catch (error) {
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
  return (
    <div className="max-w-7xl mx-auto p-0">
      {/* Breadcrumb */}
      <nav className="flex my-4" aria-label="Breadcrumb">
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

      <h1 className="text-3xl font-bold tracking-tight mb-6">Add Class</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col lg:px-0 sm:px-2 px-4 pt-4 lg:flex-row gap-4 justify-center">
          {/* Left Column */}
          <div className="space-y-4 w-full lg:w-1/2">
            <FormField
              label="Title"
              name="title"
              placeholder="Enter class title"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 border ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                } focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Category ID"
                name="categoryId"
                type="number"
              />

              <FormField
                label="Class Type ID"
                name="classTypeId"
                type="number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Country ID"
                name="countryId"
                type="number"
              />

              <FormField
                label="Location ID"
                name="locationId"
                type="number"
              />
            </div>

            <FormField
              label="Address"
              name="address"
              placeholder="Enter complete address"
            />

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("onlineAvailable")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Online Available
                </label>
              </div>

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

          {/* Right Column */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Start Date"
                name="startDate"
                type="datetime-local"
              />

              <FormField
                label="End Date"
                name="endDate"
                type="datetime-local"
              />
            </div>

            {/* Time Input Section */}

<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Class Time <span className="text-red-500">*</span>
  </label>
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

            <FormField
              label="Online Course ID"
              name="onlineCourseId"
              placeholder="OC-2024-ADVJS"
            />

            <FormField
              label="Instructor ID"
              name="instructorId"
              type="number"
              placeholder="Enter instructor ID"
            />

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

            {/* Optional Fields */}
            <FormField
              label="Hotel"
              name="hotel"
              required={false}
              placeholder="Hotel name"
            />

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Flight Confirmation"
                name="flightConfirmation"
                required={false}
                placeholder="FLIGHT-123456"
              />

              <FormField
                label="Car Confirmation"
                name="carConfirmation"
                required={false}
                placeholder="CAR-123456"
              />

              <FormField
                label="Hotel Confirmation"
                name="hotelConfirmation"
                required={false}
                placeholder="HOTEL-123456"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading ? "bg-gray-400" : "bg-zinc-800 hover:bg-zinc-900"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {loading ? "Creating..." : "Create Class"}
        </button>
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