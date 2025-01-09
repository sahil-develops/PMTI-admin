"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Calendar, Clock, Users, Building2, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { use } from "react";

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
}

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
    <div className="text-base text-zinc-900">{children}</div>
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="flex my-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 text-sm">
          <li>
            <Link href="/" className="text-zinc-500 hover:text-zinc-700">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </li>
          <li>
            <Link href="/classes" className="text-zinc-500 hover:text-zinc-700">
              Classes
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </li>
          <li className="text-zinc-900 font-medium">{classDetails.title}</li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow p-6 space-y-8">
        {/* Header */}
        <div className="border-b pb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold tracking-tight">{classDetails.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                classDetails.status === "1"
                  ? "bg-green-100 text-green-800"
                  : classDetails.status === "2"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {classDetails.status === "1"
                ? "Active"
                : classDetails.status === "2"
                ? "Pending"
                : "Inactive"}
            </span>
          </div>
          <p className="text-zinc-600">{classDetails.description}</p>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <DetailSection title="Schedule">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span>
                  {new Date(classDetails.startDate).toLocaleDateString()} - {new Date(classDetails.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span>{classDetails.classTime}</span>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Capacity">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500" />
              <span>
                Min: {classDetails.minStudent} / Max: {classDetails.maxStudent} students
              </span>
            </div>
          </DetailSection>

          <DetailSection title="Price">
            <span className="text-lg font-semibold">${classDetails.price}</span>
          </DetailSection>

          <DetailSection title="Location">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-500" />
              <span>{classDetails.address}</span>
            </div>
          </DetailSection>

          <DetailSection title="Course ID">
            <span>{classDetails.onlineCourseId}</span>
          </DetailSection>

          <DetailSection title="Class Type">
            <div className="space-x-2">
              {classDetails.onlineAvailable && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  Online Available
                </span>
              )}
              {classDetails.isCorpClass && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                  Corporate Class
                </span>
              )}
            </div>
          </DetailSection>
        </div>

        {/* Hotel Information */}
        {classDetails.hotel && (
          <div className="border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Travel & Accommodation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <DetailSection title="Hotel">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-500" />
                    <span>{classDetails.hotel}</span>
                  </div>
                  {classDetails.hotelEmailId && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-zinc-500" />
                      <a href={`mailto:${classDetails.hotelEmailId}`} className="text-blue-600 hover:underline">
                        {classDetails.hotelEmailId}
                      </a>
                    </div>
                  )}
                  {classDetails.hotelContactNo && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-zinc-500" />
                      <span>{classDetails.hotelContactNo}</span>
                    </div>
                  )}
                </div>
              </DetailSection>

              <DetailSection title="Confirmations">
                <div className="space-y-2">
                  {classDetails.hotelConfirmation && (
                    <div className="text-sm">Hotel: {classDetails.hotelConfirmation}</div>
                  )}
                  {classDetails.flightConfirmation && (
                    <div className="text-sm">Flight: {classDetails.flightConfirmation}</div>
                  )}
                  {classDetails.carConfirmation && (
                    <div className="text-sm">Car: {classDetails.carConfirmation}</div>
                  )}
                </div>
              </DetailSection>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}