"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassType {
  id: number;
  name: string;
  description: string;
  isDelete: boolean;
  active: boolean;
}

interface Location {
  id: number;
  location: string;
  addedBy: string;
  updatedBy: string;
  isDelete: boolean;
  createdAt: string;
  updateAt: string;
}

interface ClassData {
  id: number;
  title: string;
  classType: ClassType;
  startDate: string;
  endDate: string;
  location: Location;
  instructor: string | null;
  status: string;
  maxStudent: number;
  minStudent: number;
  enrolledStudents?: number;
  description: string;
  onlineAvailable: boolean;
  isCancel: boolean;
  isDelete: boolean;
  price: string;
  address: string;
}

interface ApiResponse {
  message: string;
  error: string;
  success: boolean;
  data: ClassData[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

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
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function EditClass({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}class/${resolvedParams.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch class');
        
        const data: ApiResponse = await response.json();
        if (data.success && data.data.length > 0) {
          setClassData(data.data[0]);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.error || "Failed to fetch class details",
          });
        }
      } catch (error) {
        console.error('Error fetching class:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load class details. Please try again later.",
        });
        router.push('/classes');
      } finally {
        setIsFetching(false);
      }
    };

    fetchClass();
  }, [resolvedParams.id, toast, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}class/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          title: classData?.title,
          description: classData?.description,
          startDate: classData?.startDate,
          endDate: classData?.endDate,
          maxStudent: classData?.maxStudent,
          minStudent: classData?.minStudent,
          price: classData?.price,
          address: classData?.address,
          onlineAvailable: classData?.onlineAvailable,
          status: classData?.status,
        }),
      });

      if (!response.ok) throw new Error('Failed to update class');

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Class updated successfully",
        });
        router.push(`/class-details/${resolvedParams.id}`);
        router.refresh();
      } else {
        throw new Error(data.error || 'Failed to update class');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update class. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <LoadingSkeleton />;
  }

  if (!classData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          Class not found or error loading class details
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <span>›</span>
        <Link href="/classes" className="hover:text-gray-700">
          Classes
        </Link>
        <span>›</span>
        <span>Edit Class</span>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-2">Edit Class</h1>
          <p className="text-gray-500 mb-6">Make changes to the class details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={classData.title}
                    onChange={(e) => setClassData({ ...classData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={classData.startDate.split('T')[0]}
                    onChange={(e) => setClassData({ ...classData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={classData.endDate.split('T')[0]}
                    onChange={(e) => setClassData({ ...classData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <Label>Price</Label>
                  <Input
                    type="text"
                    value={classData.price}
                    onChange={(e) => setClassData({ ...classData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Min Students</Label>
                  <Input
                    type="number"
                    value={classData.minStudent}
                    onChange={(e) => setClassData({ ...classData, minStudent: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label>Max Students</Label>
                  <Input
                    type="number"
                    value={classData.maxStudent}
                    onChange={(e) => setClassData({ ...classData, maxStudent: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Full Width Fields */}
            <div>
              <Label>Address</Label>
              <Input
                value={classData.address}
                onChange={(e) => setClassData({ ...classData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={classData.description}
                onChange={(e) => setClassData({ ...classData, description: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={classData.onlineAvailable}
                onChange={(e) => setClassData({ ...classData, onlineAvailable: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label>Online Available</Label>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={classData.status}
                onValueChange={(value) => setClassData({ ...classData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="2">Pending</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Class'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 