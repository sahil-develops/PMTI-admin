'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Course {
  id: number;
  courseName: string;
  shortName: string;
  description: string;
  isGuestAccess: boolean;
  isVisible: boolean;
  courseDuration: number;
  classType: number;
  price: number;
  extPrice: number;
  categoryId: number;
  createdAt: string;
}

const ActionDropdown = ({ courseId, refreshData }: { courseId: number; refreshData: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete course');
      refreshData();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-zinc-100">
        <MoreVertical size={20} className="text-zinc-600" />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white z-20 py-1">
            <button onClick={() => router.push(`/course/${courseId}`)} className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2">
              <Eye size={16} />
              View details
            </button>
            <button onClick={() => router.push(`/course/edit/${courseId}`)} className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2">
              <Edit2 size={16} />
              Edit details
            </button>
            <button onClick={handleDelete} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Trash2 size={16} />
              {isDeleting ? 'Deleting...' : 'Delete course'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">{children}</th>
);

const TableCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-4 text-sm text-zinc-600 ${className}`}>{children}</td>
);

const CourseList = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({ category: '', type: '', status: '' });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockCourses: Course[] = [
        {
          id: 1,
          courseName: "Introduction to Programming",
          shortName: "IntroProg",
          description: "Beginner-level programming course",
          isGuestAccess: false,
          isVisible: true,
          courseDuration: 40,
          classType: 2,
          price: 199.99,
          extPrice: 299.99,
          categoryId: 3,
          createdAt: "2024-01-01"
        },
        {
          id: 2,
          courseName: "Advanced Web Development",
          shortName: "AdvWeb",
          description: "Advanced web techniques",
          isGuestAccess: true,
          isVisible: true,
          courseDuration: 60,
          classType: 1,
          price: 299.99,
          extPrice: 399.99,
          categoryId: 2,
          createdAt: "2024-02-01"
        },
        
        {
          id: 5,
          courseName: "Advanced Web Development",
          shortName: "AdvWeb",
          description: "Advanced web techniques",
          isGuestAccess: true,
          isVisible: true,
          courseDuration: 60,
          classType: 1,
          price: 299.99,
          extPrice: 399.99,
          categoryId: 2,
          createdAt: "2024-02-01"
        },
        {
          id: 4,
          courseName: "Advanced Web Development",
          shortName: "AdvWeb",
          description: "Advanced web techniques",
          isGuestAccess: true,
          isVisible: true,
          courseDuration: 60,
          classType: 1,
          price: 299.99,
          extPrice: 399.99,
          categoryId: 2,
          createdAt: "2024-02-01"
        },
        {
          id: 3,
          courseName: "Advanced Web Development",
          shortName: "AdvWeb",
          description: "Advanced web techniques",
          isGuestAccess: true,
          isVisible: true,
          courseDuration: 60,
          classType: 1,
          price: 299.99,
          extPrice: 399.99,
          categoryId: 2,
          createdAt: "2024-02-01"
        },
        {
          id: 9,
          courseName: "Advanced Web Development",
          shortName: "AdvWeb",
          description: "Advanced web techniques",
          isGuestAccess: true,
          isVisible: true,
          courseDuration: 60,
          classType: 1,
          price: 299.99,
          extPrice: 399.99,
          categoryId: 2,
          createdAt: "2024-02-01"
        }

      ];
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const TableShimmer = () => (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-zinc-200 h-16 bg-zinc-50" />
      ))}
    </div>
  );

  return (
    <div className=" rounded-lg shadow">




      {loading ? (
        <TableShimmer />
      ) : (
        <div className="overflow-x-auto pb-40">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <TableHeader>Course Name</TableHeader>
                <TableHeader>Short Name</TableHeader>
                <TableHeader>Duration</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Ext. Price</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Guest Access</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-zinc-50">
                  <TableCell className="font-medium text-zinc-900">{course.courseName}</TableCell>
                  <TableCell>{course.shortName}</TableCell>
                  <TableCell>{course.courseDuration} hrs</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>${course.extPrice}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      course.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {course.isVisible ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      course.isGuestAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {course.isGuestAccess ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ActionDropdown courseId={course.id} refreshData={fetchCourses} />
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseList;