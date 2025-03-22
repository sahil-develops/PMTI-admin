"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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
}

interface ApiResponse {
  message: string;
  error: string;
  success: boolean;
  data: Course[];
}

interface PageProps {
  params: { id: string };
}

export default function EditCourse({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string }>(params);
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsFetching(true);
      try {
        const response = await fetch(`https://api.4pmti.com/course/${resolvedParams.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        
        const data: ApiResponse = await response.json();
        if (data.success && data.data.length > 0) {
          setCourse(data.data[0]); // Set the first course from the array
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error || "Failed to fetch course details",
          });
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load course details. Please try again later.",
        });
        router.push('/courses');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourse();
  }, [resolvedParams, toast, router]);

  if (!resolvedParams) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`https://api.4pmti.com/course/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          courseName: course?.courseName,
          shortName: course?.shortName,
          description: course?.description,
          courseDuration: course?.courseDuration,
          price: course?.price,
          extPrice: course?.extPrice,
          isGuestAccess: course?.isGuestAccess,
          isVisible: course?.isVisible,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
        router.push(`/courses/${resolvedParams.id}`);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to update course",
        });
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update course. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-gray-500">
        <Link href="/courses" className="hover:text-gray-700">
          Courses
        </Link>
        <span>›</span>
        <span>Edit Course</span>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-2">Edit Course</h1>
          <p className="text-gray-500 mb-6">Make changes to the course details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={course.courseName}
                onChange={(e) => setCourse({ ...course, courseName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
              <input
                type="text"
                value={course.shortName}
                onChange={(e) => setCourse({ ...course, shortName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="text"
                value={course.price}
                onChange={(e) => setCourse({ ...course, price: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Duration (hours)</label>
                <input
                  type="number"
                  value={course.courseDuration}
                  onChange={(e) => setCourse({ ...course, courseDuration: Number(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">External Price</label>
                <input
                  type="text"
                  value={course.extPrice}
                  onChange={(e) => setCourse({ ...course, extPrice: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={course.isGuestAccess}
                  onChange={(e) => setCourse({ ...course, isGuestAccess: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-black text-white hover:bg-gray-800 px-4 py-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Course'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}