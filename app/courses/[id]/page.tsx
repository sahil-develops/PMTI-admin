"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  description: string | null;
  isDelete: boolean;
  active: boolean;
}

interface CourseDetails {
  createdAt: string;
  updateAt: string;
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

interface CourseDetailsResponse {
  message: string;
  error: string;
  success: boolean;
  data: CourseDetails[];
}

export default function CourseDetailsPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}course/${params.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch course details");
        }

        const data: CourseDetailsResponse = await response.json();
        if (data.data.length > 0) {
          setCourseDetails(data.data[0]);
        } else {
          throw new Error("Course not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCourseDetails();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="p-4">
        <Alert>
          <AlertDescription>No course details found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{courseDetails.courseName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Course Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Short Name:</span> {courseDetails.shortName}</p>
                <p><span className="font-medium">Duration:</span> {courseDetails.courseDuration} hours</p>
                <p><span className="font-medium">Category:</span> {courseDetails.category.name}</p>
                <p><span className="font-medium">Class Type:</span> {courseDetails.classType.name}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Pricing</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Regular Price:</span> ${courseDetails.price}</p>
                <p><span className="font-medium">External Price:</span> ${courseDetails.extPrice}</p>
              </div>
            </div>

            <div className="col-span-2">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{courseDetails.description}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Access Settings</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Guest Access:</span>{" "}
                  {courseDetails.isGuestAccess ? "Enabled" : "Disabled"}
                </p>
                <p>
                  <span className="font-medium">Visibility:</span>{" "}
                  {courseDetails.isVisible ? "Visible" : "Hidden"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Management Information</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Created By:</span>{" "}
                  {courseDetails.createdBy.name} on{" "}
                  {formatDate(courseDetails.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Last Updated By:</span>{" "}
                  {courseDetails.updatedBy.name} on{" "}
                  {formatDate(courseDetails.updateAt)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}