"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Calendar, Clock, Users, MapPin, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import EnrollmentTable from "@/app/components/ClassDetails/EnrollmentTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Instructor {
  id: number;
  uid: string;
  name: string;
  emailID: string;
  mobile: string;
  telNo: string;
  billingAddress: string;
  contactAddress: string;
  profile: string;
  active: boolean;
}

interface Location {
  id: number;
  location: string;
}

interface Country {
  id: number;
  CountryName: string;
  currency: string;
}

interface ClassType {
  id: number;
  name: string;
  description: string | null;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface ClassDetails {
  id: number;
  title: string;
  description: string;
  address: string;
  maxStudent: number;
  minStudent: number;
  startDate: string;
  endDate: string;
  price: string;
  status: string;
  onlineAvailable: boolean;
  isCorpClass: boolean;
  classTime: string;
  onlineCourseId: string;
  hotel?: string;
  hotelEmailId?: string;
  hotelContactNo?: string;
  flightConfirmation?: string;
  carConfirmation?: string;
  hotelConfirmation?: string;
  instructor: Instructor;
  location: Location;
  country: Country;
  classType: ClassType;
  category: Category;
  createdAt: string;
  updateAt: string;
  isCancel: boolean;
  isDelete: boolean;
}

const DetailSection = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`space-y-1 ${className}`}>
    <h3 className="text-xs uppercase tracking-wider text-zinc-500">{title}</h3>
    <div className="text-sm text-zinc-900">{children}</div>
  </div>
);

export default function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const unwrappedParams = await params;
        const response = await fetch(
          `https://api.4pmti.com/class/${unwrappedParams.id}/detail`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch class details");
        }

        const data = await response.json();
        if (data.success) {
          setClassDetails(data.data.classs);
          setEnrollments(data.data.enrollments);
        } else {
          throw new Error(data.error || "Failed to fetch class details");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [params]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!classDetails) return null;

  return (
    <div className="max-w-full mx-auto p-4 sm:p-6">
      <nav className="flex items-center space-x-2 text-sm mb-6">
        <Link href="/" className="text-zinc-500 hover:text-zinc-700">Home</Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <Link href="/classes" className="text-zinc-500 hover:text-zinc-700">Classes</Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <span className="text-zinc-900">{classDetails.title}</span>
      </nav>

      <div className="space-y-6">
        {/* Course Overview */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{classDetails.title}</CardTitle>
                <p className="text-sm text-zinc-500 mt-1">{classDetails.description}</p>
              </div>
          {/* // ... (previous code remains the same until the status span) */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                classDetails.status === "1" ? "bg-green-100 text-green-800" :
                classDetails.status === "2" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {classDetails.status === "1" ? "Active" : classDetails.status === "2" ? "Pending" : "Inactive"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {/* Schedule Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Schedule Details</h3>
              <div className="space-y-3">
                <DetailSection title="Date Range">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>{new Date(classDetails.startDate).toLocaleDateString()} - {new Date(classDetails.endDate).toLocaleDateString()}</span>
                  </div>
                </DetailSection>
                <DetailSection title="Class Time">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{classDetails.classTime}</span>
                  </div>
                </DetailSection>
                <DetailSection title="Course ID">
                  {classDetails.onlineCourseId}
                </DetailSection>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Location Details</h3>
              <div className="space-y-3">
                <DetailSection title="Location">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <span>{classDetails.location.location}, {classDetails.country.CountryName}</span>
                  </div>
                </DetailSection>
                <DetailSection title="Address">
                  {classDetails.address}
                </DetailSection>
                <DetailSection title="Currency">
                  {classDetails.country.currency}
                </DetailSection>
              </div>
            </div>

            {/* Instructor Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Instructor Details</h3>
              <div className="space-y-3">
                <DetailSection title="Name">
                  {classDetails.instructor.name}
                </DetailSection>
                <DetailSection title="Contact">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      <span>{classDetails.instructor.emailID}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-zinc-400" />
                      <span>{classDetails.instructor.mobile}</span>
                    </div>
                  </div>
                </DetailSection>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Details */}
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailSection title="Category">
              <div className="space-y-1">
                <div className="font-medium">{classDetails.category.name}</div>
                <div className="text-sm text-zinc-500">{classDetails.category.description}</div>
              </div>
            </DetailSection>
            <DetailSection title="Class Type">
              {classDetails.classType.name}
            </DetailSection>
            <DetailSection title="Student Capacity">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>{classDetails.minStudent} - {classDetails.maxStudent} students</span>
              </div>
            </DetailSection>
            <DetailSection title="Price">
              ${classDetails.price}
            </DetailSection>
            <DetailSection title="Features">
              <div className="flex flex-wrap gap-2">
                {classDetails.onlineAvailable && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                    Online Available
                  </span>
                )}
                {classDetails.isCorpClass && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs">
                    Corporate Class
                  </span>
                )}
              </div>
            </DetailSection>
          </CardContent>
        </Card>

        {/* Hotel Information (if available) */}
        {(classDetails.hotel || classDetails.hotelEmailId || classDetails.hotelContactNo) && (
          <Card>
            <CardHeader>
              <CardTitle>Hotel & Travel Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classDetails.hotel && (
                <DetailSection title="Hotel Name">
                  {classDetails.hotel}
                </DetailSection>
              )}
              {classDetails.hotelEmailId && (
                <DetailSection title="Hotel Email">
                  <a href={`mailto:${classDetails.hotelEmailId}`} className="text-blue-600 hover:underline">
                    {classDetails.hotelEmailId}
                  </a>
                </DetailSection>
              )}
              {classDetails.hotelContactNo && (
                <DetailSection title="Hotel Contact">
                  {classDetails.hotelContactNo}
                </DetailSection>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enrollments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Class Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentTable enrollments={enrollments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}