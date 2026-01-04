"use client";
import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the form schema with Zod
const adminFormSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),

  designation: z.string()
    .min(2, "Designation must be at least 2 characters")
    .max(100, "Designation must not exceed 100 characters"),

  phone: z.string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),

  email: z.string()
    .email("Please enter a valid email address"),

  countryId: z.coerce.number().positive("Country is required"),

  isSuperAdmin: z.boolean(),
  isActive: z.boolean(),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

interface Country {
  id: number;
  CountryName: string;
  currency: string;
  isActive: boolean;
  addedBy: number;
  updatedBy: number | null;
}

// Loading spinner component
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

const EditAdmin = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema)
  });

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch(`https://api.projectmanagementtraininginstitute.com/admin/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const result = await response.json();
        if (result.success && result.data) {
          // Pre-fill the form with existing data
          reset({
            name: result.data.name,
            designation: result.data.designation,
            phone: result.data.phone,
            email: result.data.email,
            countryId: result.data.countryId,
            isSuperAdmin: result.data.isSuperAdmin,
            isActive: result.data.isActive,
          });
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setErrorMessage('Failed to load admin data');
        setShowError(true);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAdminData();
  }, [params.id, reset]);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch('https://api.projectmanagementtraininginstitute.com/country', {
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

  const onSubmit = async (data: AdminFormData) => {
    setLoading(true);
    setShowError(false);

    try {
      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/admin/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to update admin');
      }

      setShowSuccess(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-4">
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
          <li>
            <Link href="/admin" className="text-zinc-500 hover:text-zinc-700">
              Admins
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </li>
          <li className="text-zinc-900 font-medium">Edit Admin</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit Administrator</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Name <span className="text-red-500">*</span></Label>
            <Input
              {...register("name")}
              placeholder="Enter full name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Designation <span className="text-red-500">*</span></Label>
            <Input
              {...register("designation")}
              placeholder="Enter designation"
              className={errors.designation ? 'border-red-500' : ''}
            />
            {errors.designation && (
              <p className="mt-1 text-sm text-red-500">{errors.designation.message}</p>
            )}
          </div>

          <div>
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input
              {...register("email")}
              type="email"
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label>Phone <span className="text-red-500">*</span></Label>
            <Input
              {...register("phone")}
              placeholder="Enter phone number"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label>Country <span className="text-red-500">*</span></Label>
            <Select
              onValueChange={(value) => setValue("countryId", Number(value))}
              defaultValue={watch("countryId")?.toString()}
            >
              <SelectTrigger className={errors.countryId ? 'border-red-500' : ''}>
                {loadingCountries ? (
                  <LoadingSpinner />
                ) : (
                  <SelectValue placeholder="Select a country" />
                )}
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    {country.CountryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.countryId && (
              <p className="mt-1 text-sm text-red-500">{errors.countryId.message}</p>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-700">Permissions</h2>
          <div className="flex gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("isSuperAdmin")}
                className="h-4 w-4 rounded border-gray-300 text-zinc-600 focus:ring-zinc-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Super Admin
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("isActive")}
                className="h-4 w-4 rounded border-gray-300 text-zinc-600 focus:ring-zinc-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active Account
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? "bg-gray-400" : "bg-zinc-800 hover:bg-zinc-900"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500`}
          >
            {loading ? "Updating..." : "Update Administrator"}
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
            <p className="text-gray-500 text-center">Administrator account has been updated successfully.</p>
            <button
              onClick={() => {
                setShowSuccess(false);
                router.push('/admin');
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
};

export default EditAdmin; 