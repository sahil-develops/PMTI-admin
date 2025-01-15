"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Calendar, Clock, Users, Building2, Mail, Phone, Download } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePDF } from "react-to-pdf";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const unwrappedParams = await params;
        const response = await fetch(
          `https://api.4pmti.com/class/${unwrappedParams.id}`,
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
          setClassDetails(data.data);
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

  const { toPDF, targetRef } = usePDF({
    filename: classDetails ? `class-details-${classDetails.title.toLowerCase().replace(/\s+/g, '-')}.pdf` : 'class-details.pdf'
  });

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
      {/* Header with Download Button */}
      <div className="flex justify-between items-center mb-6">
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/" className="text-zinc-500 hover:text-zinc-700">Home</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <Link href="/classes" className="text-zinc-500 hover:text-zinc-700">Classes</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900">{classDetails.title}</span>
        </nav>
        <Button
          onClick={() => toPDF()}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <div ref={targetRef} className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold">{classDetails.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              classDetails.status === "1" ? "bg-green-100 text-green-800" :
              classDetails.status === "2" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {classDetails.status === "1" ? "Active" : classDetails.status === "2" ? "Pending" : "Inactive"}
            </span>
          </div>
          <p className="text-sm text-zinc-600">{classDetails.description}</p>
        </div>

        {/* Key Information */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <DetailSection title="Schedule">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>{new Date(classDetails.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>{classDetails.classTime}</span>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Location">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-zinc-400" />
                <span>{classDetails.location.location}</span>
              </div>
              <span className="text-xs text-zinc-500">{classDetails.country.CountryName}</span>
            </div>
          </DetailSection>

          <DetailSection title="Instructor">
            <div className="flex flex-col">
              <span className="font-medium">{classDetails.instructor.name}</span>
              <span className="text-xs text-zinc-500">{classDetails.instructor.emailID}</span>
            </div>
          </DetailSection>

          <DetailSection title="Class Details">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-zinc-400" />
                <span>{classDetails.minStudent}-{classDetails.maxStudent} students</span>
              </div>
              <span className="font-medium">${classDetails.price}</span>
            </div>
          </DetailSection>
        </div>

        {/* Additional Information */}
        <div className="border-t border-zinc-200">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-sm font-medium">Course Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <DetailSection title="Category">
                  {classDetails.category.name}
                </DetailSection>
                <DetailSection title="Type">
                  {classDetails.classType.name}
                </DetailSection>
                <DetailSection title="Course ID">
                  {classDetails.onlineCourseId}
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
                        Corporate
                      </span>
                    )}
                  </div>
                </DetailSection>
              </div>
            </div>

            {classDetails.hotel && (
              <div className="space-y-4">
                <h2 className="text-sm font-medium">Travel & Accommodation</h2>
                <div className="grid grid-cols-2 gap-4">
                  <DetailSection title="Hotel">
                    {classDetails.hotel}
                  </DetailSection>
                  {classDetails.hotelEmailId && (
                    <DetailSection title="Contact">
                      <a href={`mailto:${classDetails.hotelEmailId}`} className="text-blue-600 hover:underline">
                        {classDetails.hotelEmailId}
                      </a>
                    </DetailSection>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}