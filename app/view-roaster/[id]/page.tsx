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
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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

interface AvailableClass {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  location: {
    location: string;
  };
}

interface CountryOption {
  id: number;
  CountryName: string;
  currency: string;
}

interface LocationOption {
  id: number;
  location: string;
}

interface ClassListResponse {
  isCancel: any;
  isDelete: any;
  id: number;
  title: string;
  startDate: string;
}

interface PaginationMetadata {
  total: number;
  totalPages: number;
  currentPage: string;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: string;
}

interface ClassListApiResponse {
  message: string;
  error: string;
  success: boolean;
  data: {
    data: ClassListResponse[];
    metadata: PaginationMetadata;
  };
}

interface PaymentDetails {
  billingName: string;
  ccNo: string;
  CVV: string;
  CCExpiry: string;
  amount: number | '';
}

interface ValidationErrors {
  billingName?: string;
  ccNo?: string;
  CVV?: string;
  CCExpiry?: string;
  amount?: string;
}

interface EnrollmentTableProps {
  status: boolean;
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
const addDays = (dateString: string, days: number): string => {
  const [year, month, day] = dateString.split("-").map(Number);
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

  let d = day + days;
  let m = month;
  let y = year;

  while (true) {
    const dim = m === 2 && isLeap(y) ? 29 : daysInMonth[m];
    if (d <= dim) break;
    d -= dim;
    m++;
    if (m > 12) { m = 1; y++; }
  }

  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

export default function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  // @ts-ignore
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reschedule modal state
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    studentId: number;
    enrollmentId: number;
  } | null>(null);
  const [availableClasses, setAvailableClasses] = useState<AvailableClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("52");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    billingName: '',
    ccNo: '',
    CVV: '',
    CCExpiry: '',
    amount: ''
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const unwrappedParams = await params;
        const response = await fetch(
          `https://api.projectmanagementtraininginstitute.com/class/${unwrappedParams.id}/detail`,
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

          // Filter out enrollments with status: false
          const activeEnrollments = data.data.enrollments.filter(
            enrollment => enrollment.status !== false
          );
          setEnrollments(activeEnrollments);
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

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://api.projectmanagementtraininginstitute.com/country', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      if (data.success) {
        setCountries(data.data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchLocationsForCountry = async (countryId: string) => {
    try {
      setLocations([]);
      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/location/?countryId=${countryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      if (data.success) {
        const activeLocations = data.data.filter((loc: { isDelete: boolean }) => !loc.isDelete);
        const sortedLocations = activeLocations.sort((a: { location: string }, b: { location: string }) =>
          a.location.localeCompare(b.location)
        );
        setLocations(sortedLocations);
      } else {
        throw new Error(data.error || 'Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching locations for country:', error);
      setLocations([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load locations. Please try again.",
      });
    }
  };

  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedLocation("");
    setAvailableClasses([]);
    if (countryId) {
      fetchLocationsForCountry(countryId);
    }
  };

  const handleRescheduleClick = async (studentId: number, enrollmentId: number) => {
    setSelectedStudent({ studentId, enrollmentId });
    setAvailableClasses([]);
    await fetchCountries();
    await fetchLocationsForCountry("52");
    setIsRescheduleModalOpen(true);
  };

  const fetchAvailableClasses = async (page: number = 1, append: boolean = false) => {
    if (!selectedCountry || !selectedLocation) return;
    try {
      setIsLoadingMore(true);
      const response = await fetch(
        `https://api.projectmanagementtraininginstitute.com/class/admin/all?page=${page}&limit=10&countryId=${selectedCountry}&locationId=${selectedLocation}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch available classes');
      const data: ClassListApiResponse = await response.json();
      if (data.success) {
        const classes = data.data.data.filter(cls => !cls.isDelete && !cls.isCancel);
        if (append) {
          // @ts-ignore
          setAvailableClasses(prev => [...prev, ...classes]);
        } else {
          // @ts-ignore
          setAvailableClasses(classes);
        }
        setHasMore(data.data.metadata.hasNext);
        setCurrentPage(Number(data.data.metadata.currentPage));
      } else {
        throw new Error(data.error || 'Failed to fetch classes');
      }
    } catch (err) {
      console.error('Error fetching available classes:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchAvailableClasses(currentPage + 1, true);
    }
  };

  const validatePaymentDetails = (): boolean => {
    const errors: ValidationErrors = {};
    if (!paymentDetails.billingName.trim()) {
      errors.billingName = "Billing name should not be empty";
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(paymentDetails.billingName)) {
      errors.billingName = "Please enter a valid name (2-50 characters, letters only)";
    }
    if (!paymentDetails.ccNo.trim()) {
      errors.ccNo = "Credit Card number is required";
    } else if (!/^\d{16}$/.test(paymentDetails.ccNo.replace(/\s/g, ''))) {
      errors.ccNo = "Please enter a valid 16-digit credit card number";
    }
    if (!paymentDetails.CVV.trim()) {
      errors.CVV = "CVV is required";
    } else if (!/^\d{3,4}$/.test(paymentDetails.CVV)) {
      errors.CVV = "Please enter a valid CVV (3-4 digits)";
    }
    if (!paymentDetails.CCExpiry.trim()) {
      errors.CCExpiry = "CCExpiry should not be empty";
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentDetails.CCExpiry)) {
      errors.CCExpiry = "Please enter a valid expiry date (MM/YY)";
    } else {
      const [month, year] = paymentDetails.CCExpiry.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        errors.CCExpiry = "Card has expired";
      }
    }
    if (paymentDetails.amount === '') {
      errors.amount = "Amount is required";
    } else if (isNaN(Number(paymentDetails.amount)) || Number(paymentDetails.amount) <= 0) {
      errors.amount = "Please enter a valid amount";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReschedule = async () => {
    if (!selectedStudent || !selectedClassId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required fields",
      });
      return;
    }
    if (isPaid && !validatePaymentDetails()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check payment details and try again",
      });
      return;
    }
    setIsRescheduling(true);
    try {
      const requestBody = {
        classId: selectedClassId,
        enrollmentId: selectedStudent.enrollmentId,
        studentId: selectedStudent.studentId,
        isPaid: isPaid,
        ...(isPaid && {
          billingName: paymentDetails.billingName,
          ccNo: paymentDetails.ccNo.replace(/\s/g, ''),
          CVV: paymentDetails.CVV,
          CCExpiry: paymentDetails.CCExpiry,
          amount: Number(paymentDetails.amount)
        })
      };
      const response = await fetch('https://api.projectmanagementtraininginstitute.com/enrollment/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reschedule');
      if (data.success) {
        toast({
          title: "Success",
          description: "Class has been rescheduled successfully",
          action: <ToastAction altText="Close">Close</ToastAction>,
        });
        setIsRescheduleModalOpen(false);
        setSelectedStudent(null);
        setSelectedClassId(null);
        setPaymentDetails({ billingName: '', ccNo: '', CVV: '', CCExpiry: '', amount: '' });
        // Refresh data
        try {
          const unwrappedParams = await params;
          const updatedResponse = await fetch(
            `https://api.projectmanagementtraininginstitute.com/class/${unwrappedParams.id}/detail`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } }
          );
          if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            if (updatedData.success) {
              setClassDetails(updatedData.data.classs);
              setEnrollments(updatedData.data.enrollments.filter((e: any) => e.status !== false));
            }
          }
        } catch {
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Rescheduling successful but failed to refresh data. Please reload the page.",
            action: (<ToastAction altText="Reload" onClick={() => window.location.reload()}>Reload</ToastAction>),
          });
        }
      } else {
        throw new Error(data.error || 'Failed to reschedule');
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to reschedule class",
        action: (<ToastAction altText="Try again">Try again</ToastAction>),
      });
    } finally {
      setIsRescheduling(false);
    }
  };

  // Fetch available classes when location changes
  useEffect(() => {
    if (selectedCountry && selectedLocation) {
      fetchAvailableClasses(1, false);
    }
  }, [selectedLocation]);

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
        headers.push("", `Day - ${i + 1}`);
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
              <span className={`px-3 py-1 rounded-full text-xs capitalie font-medium ${classDetails.status === "active" ? "bg-green-100 text-green-800" :
                  classDetails.status === "inactive" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                }`}>
                {classDetails.status}
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
                    <span>{(classDetails.startDate)} - {(classDetails.endDate)}</span>
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
                            <span>{currentDate}</span>
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
            <div className="flex justify-between items-center">
              <CardTitle>Class Enrollments</CardTitle>

              {enrollments.some(e => e.status === false) && (
                <div className="text-sm text-zinc-500">
                  Note: Inactive enrollments are hidden
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <EnrollmentTable
              enrollments={enrollments.filter(enrollment => enrollment.status !== false)}
              startDate={classDetails.startDate}
              endDate={classDetails.endDate}
              onReschedule={handleRescheduleClick}
            />
          </CardContent>
        </Card>
      </div>

      {/* Reschedule Modal */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Reschedule Class</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Country</label>
              <Select onValueChange={handleCountryChange} defaultValue="52">
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.CountryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Location</label>
              <Select
                onValueChange={(value) => {
                  setSelectedLocation(value);
                  if (selectedCountry && value) {
                    fetchAvailableClasses(1, false);
                  }
                }}
                disabled={!selectedCountry || locations.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    locations.length === 0 && selectedCountry
                      ? "No locations available"
                      : "Select a location"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between col-span-2">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Require Payment</label>
                <p className="text-sm text-gray-500">Toggle if payment is required for rescheduling</p>
              </div>
              <Switch checked={isPaid} onCheckedChange={setIsPaid} />
            </div>

            {isPaid && (
              <div className="space-y-4 col-span-2">
                <h3 className="text-sm font-medium">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-sm font-medium">Billing Name</label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded-md ${validationErrors.billingName ? 'border-red-500' : 'border-gray-300'}`}
                      value={paymentDetails.billingName}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, billingName: e.target.value }))}
                      placeholder="John Doe"
                    />
                    {validationErrors.billingName && <p className="text-xs text-red-500">{validationErrors.billingName}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Card Number</label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded-md ${validationErrors.ccNo ? 'border-red-500' : 'border-gray-300'}`}
                      value={paymentDetails.ccNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                        setPaymentDetails(prev => ({ ...prev, ccNo: formatted.slice(0, 19) }));
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {validationErrors.ccNo && <p className="text-xs text-red-500">{validationErrors.ccNo}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expiry Date</label>
                    <input
                      type="text"
                      className={`w-full p-2 border rounded-md ${validationErrors.CCExpiry ? 'border-red-500' : 'border-gray-300'}`}
                      value={paymentDetails.CCExpiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
                        setPaymentDetails(prev => ({ ...prev, CCExpiry: value.slice(0, 5) }));
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                    {validationErrors.CCExpiry && <p className="text-xs text-red-500">{validationErrors.CCExpiry}</p>}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium">CVV</label>
                    <input
                      type="password"
                      className={`w-full p-2 border rounded-md ${validationErrors.CVV ? 'border-red-500' : 'border-gray-300'}`}
                      value={paymentDetails.CVV}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPaymentDetails(prev => ({ ...prev, CVV: value.slice(0, 4) }));
                      }}
                      placeholder="123"
                      maxLength={4}
                    />
                    {validationErrors.CVV && <p className="text-xs text-red-500">{validationErrors.CVV}</p>}
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`w-full p-2 border rounded-md ${validationErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                      value={paymentDetails.amount}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, amount: e.target.value === '' ? '' : Number(e.target.value) }))}
                      placeholder="0.00"
                    />
                    {validationErrors.amount && <p className="text-xs text-red-500">{validationErrors.amount}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Class</label>
              <Select
                onValueChange={(value) => setSelectedClassId(Number(value))}
                disabled={!selectedLocation || isLoadingMore}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingMore && !availableClasses.length ? "Loading classes..." :
                      availableClasses.length === 0 ? "No classes available" :
                        "Select a class"
                  } />
                </SelectTrigger>
                <SelectContent onScroll={(e) => {
                  const element = e.currentTarget;
                  if (
                    element.scrollHeight - element.scrollTop === element.clientHeight &&
                    !isLoadingMore &&
                    hasMore
                  ) {
                    handleLoadMore();
                  }
                }}>
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.title} - {new Date(cls.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to {new Date(cls.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </SelectItem>
                  ))}
                  {isLoadingMore && (
                    <div className="p-2 text-center text-sm text-gray-500">Loading more...</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsRescheduleModalOpen(false);
                setSelectedCountry("");
                setSelectedLocation("");
                setSelectedClassId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!selectedClassId || isRescheduling}
              className="bg-primary"
            >
              {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}