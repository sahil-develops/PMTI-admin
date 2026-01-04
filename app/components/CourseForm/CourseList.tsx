"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Eye, Plus, Trash } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Course {
  createdOn: string | number | Date;
  updatedOn: string | number | Date;
  id: number;
  courseName: string;
  shortName: string;
  courseDuration: number;
  price: string;
  extPrice: string;
  isGuestAccess: boolean;
  isVisible: boolean;
  description: string;
  enrollmentCount: string;
  isDelete: boolean;
  email?: string; // Optional email field for filtering
  category?: {
    id: number;
    name: string;
    description: string;
    isDelete: boolean;
    active: boolean;
  };
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

const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return date.toLocaleDateString('en-US', options);
};
const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emailSearch, setEmailSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const router = useRouter();
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.projectmanagementtraininginstitute.com/course?page=${currentPage}&limit=10`, {
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
          setTotalPages(data.data.metadata.totalPages);
          setHasNext(data.data.metadata.hasNext);
          setHasPrevious(data.data.metadata.hasPrevious);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/course/${courseToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      // Remove the deleted course from the list
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseToDelete.id));

      // Show success toast notification
      toast({
        title: "Success!",
        description: `Course "${courseToDelete.courseName}" has been successfully deleted.`,
        variant: "default",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCourseToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
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
                <th scope="col" className="px-6 py-4 text-left font-medium">Start Date</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">End Date</th>
                {/* <th scope="col" className="px-6 py-4 text-left font-medium">Instructor</th> */}
                {/* <th scope="col" className="px-6 py-4 text-left font-medium">Status</th> */}
                <th scope="col" className="px-6 py-4 text-left font-medium">Enrolled</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Left</th>
                <th scope="col" className="px-6 py-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-4">{course.category?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4">{course.courseName}</td>
                  <td className="px-6 py-4">
                    {course.createdOn ? formatDate(new Date(course.createdOn)) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {course.updatedOn ? formatDate(new Date(course.updatedOn)) : 'N/A'}
                  </td>
                  {/* <td className="px-6 py-4">John Cena</td> */}
                  {/* <td className="px-6 py-4">
                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                      !course.isDelete 
                        ? 'text-green-800 bg-green-100' 
                        : 'text-red-800 bg-red-100'
                    }`}>
                      {!course.isDelete ? 'Active' : 'Inactive'}
                    </span>
                  </td> */}
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
                        {/* Only show delete option if no enrollments */}
                        {(!course.enrollmentCount || parseInt(course.enrollmentCount) === 0) && (
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(course)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Course
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add pagination controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevious}
            variant="outline"
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md"
          >
            Previous
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNext}
            variant="outline"
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md"
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-center">
          <nav className="inline-flex items-center space-x-4 rounded-md shadow-sm" aria-label="Pagination">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevious}
              variant="outline"
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </Button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Show first page, last page, current page, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                        ? "z-10 bg-gray-900 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                  >
                    {pageNumber}
                  </Button>
                );
              } else if (
                pageNumber === currentPage - 2 ||
                pageNumber === currentPage + 2
              ) {
                return (
                  <span
                    key={pageNumber}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
              variant="outline"
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </Button>
          </nav>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the course{" "}
              <strong>{courseToDelete?.courseName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseList;