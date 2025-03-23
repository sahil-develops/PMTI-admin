"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  isDelete: boolean;
  active: boolean;
}

interface ClassType {
  id: number;
  name: string;
  description: null | string;
  isDelete: boolean;
  active: boolean;
}

interface Course {
  id: number;
  courseName: string;
  shortName: string;
  description: string;
  isGuestAccess: boolean;
  createdOn: string;
  updatedOn: string;
  isVisible: boolean;
  isDelete: boolean;
  courseDuration: number;
  price: string;
  extPrice: string;
  updatedBy: User;
  createdBy: User;
  category: Category;
  classType: ClassType;
  coverImage: string;
}

interface ApiResponse {
  message: string;
  error: string;
  success: boolean;
  data: Course[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const SkeletonCard = () => (
  <div className="border rounded-lg">
    <div className="bg-gray-50 px-4 py-2 border-b">
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="p-4 space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-2"></div>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-2"></div>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
      </div>
 
);

const LoadingSkeleton = () => (
  <div className="w-full">
    {/* Breadcrumb Skeleton */}
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-4 w-16" />
      <span>›</span>
      <Skeleton className="h-4 w-16" />
      <span>›</span>
      <Skeleton className="h-4 w-24" />
    </div>

    {/* Main Content Skeleton */}
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <Skeleton className="h-7 w-48 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Information Skeleton */}
          <SkeletonCard />

          {/* Pricing Information Skeleton */}
          <SkeletonCard />

          {/* Category Information Skeleton */}
          <SkeletonCard />

          {/* Description Skeleton - Full Width */}
          <div className="border rounded-lg md:col-span-2 lg:col-span-3">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="p-4">
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          {/* Management Information Skeleton */}
          <div className="border rounded-lg md:col-span-2 lg:col-span-3">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function CourseDetails({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`https://api.4pmti.com/course/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        
        const data: ApiResponse = await response.json();
        if (data.success && data.data.length > 0) {
          setCourse(data.data[0]);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error || "Failed to fetch course details",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
// @ts-ignore

          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
// @ts-ignore
  }, [params.id, toast]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Course not found or error loading course details
        </div>
      </div>
    );
  }

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-3 px-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-sm">{value || '-'}</div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <span>›</span>
        <Link href="/courses" className="hover:text-gray-700">
          Courses
        </Link>
        <span>›</span>
        <span>Course Details</span>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-6">Course Details</h1>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cover Image - New Section */}
            <div className="space-y-0 border rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h2 className="font-medium">Course Image</h2>
              </div>
              <div className="p-4">
                {course.coverImage ? (
                  <img 
                    src={course.coverImage} 
                    alt={course.courseName}
                    className="w-full h-auto rounded-md"
                  />
                ) : (
                  <div className="bg-gray-100 h-48 rounded-md flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-0 border rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h2 className="font-medium">Basic Information</h2>
              </div>
              {/* <DetailRow label="Course ID" value={course.id} /> */}
              <DetailRow label="Title" value={course.courseName} />
              <DetailRow label="Short Name" value={course.shortName} />
              <DetailRow label="Course Duration" value={`${course.courseDuration} hours`} />
            </div>

            {/* Pricing Information - Updated */}
            <div className="space-y-0 border rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h2 className="font-medium">Pricing Details</h2>
              </div>
              <DetailRow 
                label="Regular Price" 
                value={
                  <span className="font-semibold text-green-600">
                    ${parseFloat(course.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                } 
              />
              <DetailRow 
                label="External Price" 
                value={
                  <span className="font-semibold text-blue-600">
                    ${parseFloat(course.extPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                } 
              />
              <DetailRow 
                label="Status" 
                value={
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    course.isGuestAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {course.isGuestAccess ? 'Active' : 'Inactive'}
                  </span>
                } 
              />
            </div>

            {/* Category Information */}
            <div className="space-y-0 border rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h2 className="font-medium">Category Information</h2>
              </div>
              <DetailRow label="Category" value={course.category.name} />
              <DetailRow label="Category Description" value={course.category.description} />
              <DetailRow label="Class Type" value={course && course?.classType?.name} />
            </div>

            {/* Description - Full Width */}
            <div className="space-y-0 border rounded-lg md:col-span-2 lg:col-span-2">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h2 className="font-medium">Description</h2>
              </div>
              <DetailRow label="Course Description" value={course.description} />
            </div>

            {/* Management Information */}
            <div className="space-y-0 border rounded-lg md:col-span-2 lg:col-span-3">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h2 className="font-medium">Management Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <DetailRow 
                  label="Created By" 
                  value={`${course.createdBy.name}`} 
                />
                <DetailRow 
                  label="Created On" 
                  value={new Date(course.createdOn).toLocaleDateString()} 
                />
                <DetailRow 
                  label="Updated By" 
                  value={`${course.updatedBy.name}`} 
                />
                <DetailRow 
                  label="Updated On" 
                  value={new Date(course.updatedOn).toLocaleDateString()} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}