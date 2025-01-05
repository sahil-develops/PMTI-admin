"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MoreVertical,Edit2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  isDelete: boolean;
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
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}course`, {
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

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!courses || courses.length === 0) {
    return <div className="text-center p-4">No Data Found</div>;
  }

  const handleViewDetails = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  const handleEditDetails = (courseId: number) => {
    router.push(`/courses/${courseId}/edit`);
  };

  return (
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
            {courses.map((course) => (
              <tr key={course.id} className="bg-white hover:bg-gray-50">
                <td className="px-6 py-4">Active</td>
                <td className="px-6 py-4">{course.courseName}</td>
                <td className="px-6 py-4">New York City</td>
                <td className="px-6 py-4">12/15/2024</td>
                <td className="px-6 py-4">12/17/2024</td>
                <td className="px-6 py-4">John Cena</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">0</td>
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
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditDetails(course.id)}
                      >
                        <Edit2 className="h-4 w-4" />
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
  );
};

export default CourseList;