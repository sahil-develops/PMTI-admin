"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Eye,Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: number;
  courseName: string;
  shortName: string;
  courseDuration: number;
  price: string;
  extPrice: string;
  isGuestAccess: boolean;
  isVisible: boolean;
  description: string;
  enrollmentCount:string;
  isDelete: boolean;
  email?: string; // Optional email field for filtering
}

interface ApiResponse {
  message: string;
  error: string;
  success: boolean;
  data: {
    data: Course[];
    metadata: {
      total: number;
      totalPages: number;
      currentPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
      limit: number;
    };
  };
}

const TableSkeleton = () => (
  <div className="rounded-md border">
    <div className="relative overflow-x-auto">
      <div className="bg-gray-50 border-b">
        <div className="grid grid-cols-10 gap-4 px-6 py-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>

      <div className="divide-y">
        {[...Array(5)].map((_, rowIndex) => (
          <div key={rowIndex} className="bg-white hover:bg-gray-50">
            <div className="grid grid-cols-10 gap-4 px-6 py-4">
              {[...Array(10)].map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className={`h-4 ${colIndex === 1 ? 'w-32' : 'w-16'}`} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emailSearch, setEmailSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.4pmti.com/course`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data: ApiResponse = await response.json();
        if (data.success && data.data.data) {
          setCourses(data.data.data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesEmail = emailSearch === '' || 
      (course.email && course.email.toLowerCase().includes(emailSearch.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? !course.isDelete :
      course.isDelete;

    return matchesEmail && matchesStatus;
  });

  const handleViewDetails = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  const handleEditDetails = (courseId: number) => {
    router.push(`/courses/${courseId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return <div className="text-center p-4">No Data Found</div>;
  }

  return (
    <div className="space-y-4 bg-white px-4 py-6">
      <div className='flex justify-between items-center w-full'>
        <h2 className="text-2xl font-bold">Courses</h2>
        <Button 
          onClick={() => router.push('/courses/addCourses')}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4" /> Add Courses
        </Button>
      </div>
      <div className="flex gap-4 items-center  my-10 ">
        <div className="flex-1">
          <Input
            placeholder="Search by email..."
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-700 bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left font-medium">Type</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Title</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Location</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Start Date</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">End Date</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Instructor</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Status</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Enrolled</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Left</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-4">{!course.isDelete ? 'Active' : 'Inactive'}</td>
                  <td className="px-6 py-4">{course.courseName}</td>
                  <td className="px-6 py-4">New York City</td>
                  <td className="px-6 py-4">12/15/2024</td>
                  <td className="px-6 py-4">12/17/2024</td>
                  <td className="px-6 py-4">John Cena</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      !course.isDelete 
                        ? 'text-green-800 bg-green-100' 
                        : 'text-red-800 bg-red-100'
                    }`}>
                      {!course.isDelete ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{course.enrollmentCount}</td>
                  <td className="px-6 py-4">30</td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(course.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditDetails(course.id)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseList;