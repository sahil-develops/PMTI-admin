"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://api.4pmti.com/category', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchClassTypes = async () => {
    try {
      const response = await fetch('https://api.4pmti.com/classtype', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch class types');
      const data = await response.json();
      setClassTypes(data.data || []);
    } catch (error) {
      console.error('Error fetching class types:', error);
      setClassTypes([]);
    }
  };

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
    fetchCategories();
    fetchClassTypes();
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
          categoryId: course?.category?.id,
          classType: course?.classType?.id,
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select
                value={course.category?.id?.toString()}
                onValueChange={(value) => setCourse({
                  ...course,
                  category: { ...course.category, id: Number(value) }
                })}
              >
                <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="Select Category" />
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Type</label>
              <Select
                value={course.classType?.id?.toString()}
                onValueChange={(value) => setCourse({
                  ...course,
                  classType: { ...course.classType, id: Number(value) }
                })}
              >
                <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="Select Class Type" />
                </SelectTrigger>
                <SelectContent>
                  {classTypes.map((classType) => (
                    <SelectItem 
                      key={classType.id} 
                      value={classType.id.toString()}
                    >
                      {classType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2">
                <div 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    course.isGuestAccess ? 'bg-gray-500' : 'bg-green-500'
                  }`}
                  onClick={() => setCourse({ ...course, isGuestAccess: !course.isGuestAccess })}
                >
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      course.isGuestAccess ? 'translate-x-1' : 'translate-x-6'
                    }`} 
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {course.isGuestAccess ? 'Inactive' : 'Active'}
                </span>
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