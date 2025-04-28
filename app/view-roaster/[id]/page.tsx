"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Calendar, Clock, Users, MapPin, Mail, Phone, Download } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import EnrollmentTable from "@/app/components/ClassDetails/EnrollmentTable";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from "@/hooks/use-toast";

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

interface APIResponse {
  message: string;
  error: string;
  success: boolean;
  data: {
    classs: ClassDetails;
    enrollments: EnrollmentTableProps[];
  };
}

interface EnrollmentTableProps {
  enrollments: {
    id: number;
    enrollmentType: string;
    EnrollmentDate: string;
    student: {
      name: string;
      email: string;
    };
    Price: string;
    MealType: string;
    PaymentMode: string;
    PMPPass: boolean;
    pmbok: boolean;
    Comments: string;
  }[];
}

interface PerformanceData {
  classInfo: {
    classDate: string;
    trainingLocation: string;
    instructorName: string;
    title: string;
    days: number;
  };
  students: {
    id: number;
    name: string;
    days: {
      midDayExam: number | null;
      eveningExam: number | null;
    }[];
    studentAverage: number | null;
    simTests: (number | null)[];
    testDate: string | null;
  }[];
}

const DetailSection = ({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) => (
  <div className={`space-y-1 ${className}`}>
    <h3 className="text-xs uppercase tracking-wider text-zinc-500">{title}</h3>
    <div className="text-sm text-zinc-900">{children}</div>
  </div>
);

const calculateDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Add this helper function to calculate dates
const addDays = (dateString: string, days: number) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
};

export default function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  // @ts-ignore
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const unwrappedParams = await params;
        const response = await fetch(
          `https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/class/${unwrappedParams.id}/detail`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch class details");
        }

        const data: APIResponse = await response.json();
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

  const handleDownloadPDF = () => {
    if (!classDetails) return;

    const classDays = calculateDays(classDetails.startDate, classDetails.endDate);
    
    const pdfData = {
      instructor: classDetails.instructor.name,
      location: `${classDetails.location.location}, ${classDetails.country.CountryName}`,
      startDate: new Date(classDetails.startDate).toLocaleDateString(),
      endDate: new Date(classDetails.endDate).toLocaleDateString(),
      title: classDetails.title,
      classTime: classDetails.classTime,
      days: Array.isArray(classDays) ? classDays.map((date: { toLocaleDateString: () => any; }, index: number) => ({
        dayNumber: index + 1,
        date: date.toLocaleDateString()
      })) : []
    };

    // Pass all enrollments to the PDF generator
    import('@/app/components/ClassDetails/GeneratePDF').then(module => {
      module.default(pdfData, enrollments);
    }).catch(err => {
      console.error('Error loading PDF generator:', err);
    });
  };

  const handleGeneratePerformanceTracker = async () => {
    if (!classDetails || !enrollments) return;

    try {
      // Create worksheet data
      const wsData = [];

      // Add logo placeholder (we'll add the image later)
      wsData.push(['', '', '', '', '', '', '', '', '4PMTI']);
      wsData.push([]); // Empty row for spacing

      // Add header information with more spacing
      wsData.push(['', '', 'Class Date :', `${classDetails.startDate} - ${classDetails.endDate}`]);
      wsData.push(['', '', 'Training Location :', `${classDetails.location.location}, ${classDetails.country.CountryName}`]);
      wsData.push(['', '', 'Instructor Name :', classDetails.instructor.name]);
      wsData.push([]); // Empty row for spacing
      wsData.push([]); // Extra empty row for better spacing

      const numDays = calculateDays(classDetails.startDate, classDetails.endDate);

      // Create headers based on number of days with more spacing
      const headers = ['', '#', 'Student Name'];
      for (let i = 0; i < numDays; i++) {
        headers.push("",`Day - ${i + 1}`);
        headers.push(''); // Empty cell that will be merged
      }
      headers.push('Student Average');
      headers.push('Sim Test 1');
      headers.push('Sim Test 2');
      headers.push('Sim Test 3');
      headers.push('Sim Test 4');
      headers.push('Test Date?');
      wsData.push(headers);

      // Add sub-headers for exams
      const subHeaders = ['', '', ''];
      for (let i = 0; i < numDays; i++) {
        subHeaders.push('Mid-day Exam');
        subHeaders.push('Evening Exam');
      }
      subHeaders.push('', '', '', '', '', ''); // Add empty cells for the remaining columns
      wsData.push(subHeaders);

      // Add student data with more spacing
      enrollments.forEach((enrollment, index) => {
        const row = [
          '', // Extra spacing at the start
          index + 1,
          enrollment.student.name,
          // Initialize empty exam scores for each day
          ...Array(numDays).fill(null).flatMap(() => ['', '']),
          '', // Student Average
          '', '', '', '', // Sim Tests
          '' // Test Date
        ];
        wsData.push(row);
      });

      // Create Excel workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      const colWidths: { [key: string]: { wch: number } } = {
        A: { wch: 5 },  // Spacing column
        B: { wch: 5 },  // # column
        C: { wch: 30 }, // Student Name
      };

      // Add widths for day columns and other columns
      let col = 'D';
      for (let i = 0; i < (numDays * 2) + 6; i++) {
        colWidths[col] = { wch: 15 };
        col = String.fromCharCode(col.charCodeAt(0) + 1);
      }

      ws['!cols'] = Object.values(colWidths);

      // Add merge cells configuration
      ws['!merges'] = [];
      // Merge Day headers
      for (let i = 0; i < numDays; i++) {
        ws['!merges'].push({
          s: { r: 7, c: i * 2 + 3 }, // Start cell (row 7, column D + offset)
          e: { r: 7, c: i * 2 + 4 }  // End cell (same row, next column)
        });
      }

      // Add some styling
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cell_address]) continue;
          
          // Basic cell styling
          ws[cell_address].s = {
            font: { name: 'Arial', sz: 11 },
            alignment: { 
              horizontal: 'center',
              vertical: 'center',
              wrapText: true
            },
            border: {
              top: { style: 'thin', color: { rgb: "000000" } },
              bottom: { style: 'thin', color: { rgb: "000000" } },
              left: { style: 'thin', color: { rgb: "000000" } },
              right: { style: 'thin', color: { rgb: "000000" } }
            }
          };

          // Header information styling (Class Date, Training Location, Instructor Name)
          if (R >= 2 && R <= 4) {
            if (C === 2 || C === 3) { // Columns for headers and their values
              ws[cell_address].s.fill = {
                fgColor: { rgb: "4C8092" },
                patternType: 'solid'
              };
              ws[cell_address].s.font.color = { rgb: "FFFFFF" }; // White text
              ws[cell_address].s.font.bold = true;
              ws[cell_address].s.alignment.horizontal = 'left';
            }
          }

          // Header row styling (Student names and days)
          if (R === 7) {
            ws[cell_address].s = {
              ...ws[cell_address].s,
              fill: {
                fgColor: { rgb: "ECF9FB" },
                patternType: 'solid'
              },
              font: {
                ...ws[cell_address].s.font,
                bold: true
              },
              alignment: {
                ...ws[cell_address].s.alignment,
                horizontal: 'center',
                vertical: 'center'
              }
            };
          }

          // Student data rows styling
          if (R > 7) {
            ws[cell_address].s.fill = {
              fgColor: { rgb: "ECF9FB" },
              patternType: 'solid'
            };
          }

          // Logo cell styling
          if (R === 0 && C === 8) {
            ws[cell_address].s.font.bold = true;
            ws[cell_address].s.font.color = { rgb: "4CAF50" };
            ws[cell_address].s.font.sz = 16;
            // Remove background color for logo cell
            delete ws[cell_address].s.fill;
          }
        }
      }

      // Set row heights
      ws['!rows'] = Array(range.e.r + 1).fill({ hpt: 25 }); // Set all rows to height 25
      ws['!rows'][0] = { hpt: 40 }; // Make the logo row taller
      ws['!rows'][6] = { hpt: 30 }; // Make the header row taller
      ws['!rows'][7] = { hpt: 30 }; // Make the sub-header row taller

      XLSX.utils.book_append_sheet(wb, ws, 'Performance Tracker');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `performance_tracker_${classDetails.id}.xlsx`);

    } catch (error) {
      console.error('Error generating performance tracker:', error);
      toast({
        title: "Error",
        description: "Failed to generate performance tracker",
        variant: "destructive",
      });
    }
  };

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
          <Link href="/" className="text-zinc-500 hover:text-zinc-700">Classes</Link>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-900">{classDetails.title}</span>
        </nav>
        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePerformanceTracker}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Performance Tracker
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div ref={componentRef} className="space-y-6">
        {/* Course Overview */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{classDetails.title}</CardTitle>
                <p className="text-sm text-zinc-500 mt-1">{classDetails.description}</p>
              </div>
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
                
                {/* Update the Daily Schedule section */}
                <DetailSection title="Daily Schedule">
                  <div className="space-y-2">
                    {Array.from(
                      { length: calculateDays(classDetails.startDate, classDetails.endDate) },
                      (_, index) => {
                        const currentDate = addDays(classDetails.startDate, index);
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-zinc-400" />
                            <span className="font-medium">Day {index + 1}:</span>
                            <span>{currentDate.toLocaleDateString()}</span>
                            <span className="text-zinc-500">({classDetails.classTime})</span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </DetailSection>

                <DetailSection title="Class Time">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{classDetails.classTime}</span>
                  </div>
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

        {/* Additional Class Information */}
        <Card>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
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
            <DetailSection title="Course ID">
              {classDetails.onlineCourseId}
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

        {/* Hotel Information */}
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
            <EnrollmentTable 
              enrollments={enrollments} 
              startDate={classDetails.startDate}
              endDate={classDetails.endDate}
              onReschedule={(studentId, enrollmentId) => {
                // Handle rescheduling logic here
                console.log(`Reschedule student ${studentId} enrollment ${enrollmentId}`);
                // You might want to implement actual rescheduling functionality
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}