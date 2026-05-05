import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from 'lucide-react';

import Loader from "@/components/ui/Loader";

// Custom Tooltip Component
const CustomTooltip = ({
  children,
  content,
  className = ""
}: {
  children: React.ReactNode;
  content: string;
  className?: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    // Add a small delay to allow moving to tooltip
    setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  const handleTooltipMouseEnter = () => {
    setIsVisible(true);
  };

  const handleTooltipMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && content && (
        <div
          className="absolute z-50 px-3 py-2 lg:w-72 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-pre-wrap max-w-md max-h-32 overflow-y-auto break-words -top-1 left-1/2 transform -translate-x-1/2 -translate-y-full"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{ marginTop: '8px' }}
        >
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

interface Enrollment {
  ID: number; // Changed from id: string to ID: number based on ClassDetailsPage usage
  day4Input?: string;
  day2Input?: string;
  day1Input?: string;
  day3Input?: string;
  signatureInput?: string;
  student: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  EnrollmentDate: string;
  PaymentMode?: string;
  PMPPass?: boolean;
  pmbok?: boolean;
  MealType?: string;
  Price?: number;
  Comments?: string;
  status?: boolean;
  [key: string]: any; // This allows for dynamic day input properties
  testDate?: string;
  enrollmentProgress?: string;
}

interface EnrollmentTableProps {
  enrollments: Enrollment[];
  onUpdate?: () => void;
  startDate?: string;
  endDate?: string;
  onReschedule: (studentId: number, enrollmentId: number) => void; // Added this prop
}

interface UpdatePayload {
  MealType?: string;
  enrollmentProgress?: string;
  status?: boolean;
  pmbok?: boolean;
  day1Input?: string;
  day2Input?: string;
  day3Input?: string;
  day4Input?: string;
  signatureInput?: string;
  testDate?: string;
}

const StyledTableHeader = ({ children, sortable = false, onClick }: {
  children: React.ReactNode;
  sortable?: boolean;
  onClick?: () => void;
}) => (
  <th className={`bg-zinc-100 whitespace-nowrap px-3 py-2 text-left text-sm font-medium text-black ${sortable ? 'cursor-pointer hover:bg-zinc-800' : ''
    }`} onClick={onClick}>
    {children}
  </th>
);

const StyledTableCell = ({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td className={`px-3 py-2 text-sm border-b border-zinc-200 ${className}`}>
    {children}
  </td>
);

const CompactSelect = ({ value, onChange, options, loading = false }: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; }[];
  loading?: boolean;
}) => (
  <Select value={value} onValueChange={onChange} disabled={loading}>
    <SelectTrigger className="h-8 min-h-8 text-xs px-2 py-0">
      {loading ? (
        <span className="flex items-center justify-center w-full h-full"><Loader size={16} /></span>
      ) : (
        <SelectValue />
      )}
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value} className="text-xs">
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const CompactInput = ({
  value,
  onChange,
  loading = false,
  placeholder = ""
}: {
  value: string;
  onChange: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
}) => (
  <Input
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    disabled={loading}
    placeholder={placeholder}
    className="h-8 text-xs px-2 py-0"
  />
);

const updateEnrollment = async (studentId: number, payload: UpdatePayload) => {
  const baseUrl = 'https://api.projectmanagementtraininginstitute.com';

  try {
    const response = await fetch(`${baseUrl}/enrollment/${studentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Added token for auth
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Update failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating enrollment:', error);
    throw error;
  }
};

const updateStudentActiveStatus = async (
  studentId: number,
  active: boolean,
  studentInfo: { name: string; email: string; phone: string }
) => {
  const baseUrl = 'https://api.projectmanagementtraininginstitute.com';
  try {
    const response = await fetch(`${baseUrl}/students/${studentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ active, ...studentInfo }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Student status update failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating student active status:', error);
    throw error;
  }
};

const getDaysBetweenDates = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: Date[] = [];

  let currentDate = new Date(start);
  while (currentDate <= end) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

const ViewStudentModal = ({
  studentId,
  isOpen,
  onClose,
}: {
  studentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && studentId) {
      setLoadingStudent(true);
      setFetchError(null);
      fetch(`https://api.projectmanagementtraininginstitute.com/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch student details');
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            setStudentData(data.data);
          } else {
            setFetchError(data.error || data.message || 'Failed to fetch student details');
          }
        })
        .catch((err) => setFetchError(err.message || 'Failed to fetch student details'))
        .finally(() => setLoadingStudent(false));
    }
  }, [isOpen, studentId]);

  const getLocationInfo = (student: any) => {
    let cityName = 'N/A', stateName = 'N/A', countryName = 'N/A';
    if (student?.city && typeof student.city === 'object') cityName = (student.city as any).location || 'N/A';
    else if (typeof student?.city === 'string' && student.city) cityName = student.city;
    if (student?.state && typeof student.state === 'object') stateName = (student.state as any).name || 'N/A';
    else if (typeof student?.state === 'string' && student.state) stateName = student.state;
    if (student?.country && typeof student.country === 'object') countryName = (student.country as any).CountryName || 'N/A';
    else if (typeof student?.country === 'string' && student.country) countryName = student.country;
    return { cityName, stateName, countryName };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>
        {loadingStudent ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : fetchError ? (
          <div className="p-4 text-center text-red-500">{fetchError}</div>
        ) : studentData ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Student ID</p>
                  <p>{studentData.student.uid || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{studentData.student.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{studentData.student.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{studentData.student.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p>{studentData.student.companyName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Profession</p>
                  <p>{studentData.student.profession || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${studentData.student.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {studentData.student.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Last Login</p>
                  <p>{studentData.student.lastLogin ? new Date(studentData.student.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Address Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p>{studentData.student.address || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p>
                    {(() => {
                      const { cityName, stateName, countryName } = getLocationInfo(studentData.student);
                      return [cityName, stateName, countryName].filter(v => v !== 'N/A').join(', ') || 'N/A';
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Zip Code</p>
                  <p>{studentData.student.zipCode || 'N/A'}</p>
                </div>
              </div>
            </div>
            {studentData.enrollments && studentData.enrollments.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Enrollment History</h3>
                <div className="space-y-6">
                  {studentData.enrollments.map((enrollment: any) => (
                    <div key={enrollment.ID} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Course/Class Title</p>
                          <p className="font-medium">
                            {enrollment.course ? enrollment.course.courseName : (enrollment.class ? enrollment.class.title : 'N/A')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Type</p>
                          <p>{enrollment.enrollmentType || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Enrollment Date</p>
                          <p>{enrollment.EnrollmentDate ? new Date(enrollment.EnrollmentDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Payment</p>
                          <p>${parseFloat(enrollment.Price).toFixed(2)}{enrollment.PaymentMode && ` (${enrollment.PaymentMode})`}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Progress</p>
                          <p className="capitalize">{enrollment.enrollmentProgress || 'Ongoing'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${enrollment.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {enrollment.status ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      {enrollment.Comments && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <h4 className="text-md font-medium mb-2">Comments</h4>
                          <p className="text-sm">{enrollment.Comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center">No student data available</div>
        )}
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const EnrollmentTable = ({
  enrollments: initialEnrollments,
  onUpdate,
  startDate,
  endDate,
  onReschedule
}: EnrollmentTableProps) => {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // Changed from string[] to number[]
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const classdays = startDate && endDate ? getDaysBetweenDates(startDate, endDate) : [];

  const handleUpdate = async (studentId: number, payload: UpdatePayload) => {

    const loadingKey = `${studentId}-${Object.keys(payload)[0]}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    setError(null);

    try {
      const response = await updateEnrollment(studentId, payload);

      // When status changes, also update the student's own active field so it
      // reflects correctly in Students Management and Student Details pages.
      if (payload.status !== undefined) {
        const targetEnrollment = enrollments.find(e => e.ID === studentId);
        if (targetEnrollment) {
          await updateStudentActiveStatus(targetEnrollment.student.id, payload.status, {
            name: targetEnrollment.student.name,
            email: targetEnrollment.student.email,
            phone: targetEnrollment.student.phone,
          });
        }
      }

      if (response.success) {
        // Find the student.id of the enrollment being updated so we can
        // propagate status changes to all rows belonging to the same student.
        setEnrollments(prev => {
          const targetStudentId = prev.find(e => e.ID === studentId)?.student.id;
          return prev.map(enrollment => {
            const isTargetEnrollment = enrollment.ID === studentId;
            const isSameStudent = payload.status !== undefined && enrollment.student.id === targetStudentId;

            if (isTargetEnrollment) {
              let newPMPPass = enrollment.PMPPass;
              let newEnrollmentProgress = enrollment.enrollmentProgress;
              if (payload.enrollmentProgress) {
                newEnrollmentProgress = payload.enrollmentProgress;
                newPMPPass = payload.enrollmentProgress === 'pass';
              }
              return {
                ...enrollment,
                enrollmentProgress: newEnrollmentProgress,
                PMPPass: newPMPPass,
                pmbok: payload.pmbok !== undefined ? payload.pmbok : enrollment.pmbok,
                status: payload.status !== undefined ? payload.status : enrollment.status,
                MealType: payload.MealType || enrollment.MealType,
                day1Input: payload.day1Input || enrollment.day1Input,
                day2Input: payload.day2Input || enrollment.day2Input,
                day3Input: payload.day3Input || enrollment.day3Input,
                day4Input: payload.day4Input || enrollment.day4Input,
                signatureInput: payload.signatureInput || enrollment.signatureInput
              };
            }

            // For other enrollments of the same student, only sync the status
            if (isSameStudent) {
              return { ...enrollment, status: payload.status };
            }

            return enrollment;
          });
        });
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      setError('Failed to update enrollment');
      console.error('Update failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Calculate summary data
  const grandTotal = enrollments.reduce((sum, enrollment) => sum + Number(enrollment.Price || 0), 0);
  const vegetarianCount = enrollments.filter(e => e.MealType?.toLowerCase() === 'vegetarian').length;
  const nonVegetarianCount = enrollments.filter(e => e.MealType?.toLowerCase() === 'non-vegetarian').length;

  // Handle reschedule - Now just calling the parent component's onReschedule
  const handleRescheduleClick = (studentId: number, enrollmentId: number) => {
    if (onReschedule) {
      onReschedule(studentId, enrollmentId);
    }
  };



  return (
    <div className="w-full overflow-x-auto hideScrollBar border border-zinc-100">
      <ViewStudentModal
        studentId={viewingStudentId}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingStudentId(null);
        }}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <StyledTableHeader>
              <Checkbox
                className="bg-white data-[state=checked]:bg-white"
                checked={selectedItems.length === enrollments.length}
                onCheckedChange={(checked) => {
                  setSelectedItems(checked ? enrollments.map(e => e.ID) : []);
                }}
              />
            </StyledTableHeader>
            <StyledTableHeader>Name</StyledTableHeader>
            <StyledTableHeader>Email</StyledTableHeader>
            <StyledTableHeader>Enrollment on</StyledTableHeader>
            <StyledTableHeader>Progress</StyledTableHeader>
            <StyledTableHeader>PMBOK</StyledTableHeader>
            <StyledTableHeader>Status</StyledTableHeader>
            <StyledTableHeader>Meal Type</StyledTableHeader>
            <StyledTableHeader>Phone</StyledTableHeader>
            <StyledTableHeader>Price</StyledTableHeader>
            <StyledTableHeader>Comments</StyledTableHeader>

            {/* Dynamic day headers */}
            {classdays.map((date, index) => (
              <StyledTableHeader key={date.toISOString()}>
                Day {index + 1}<br />
                10hrs
              </StyledTableHeader>
            ))}

            <StyledTableHeader>Test Date</StyledTableHeader>
            <StyledTableHeader>Signature</StyledTableHeader>
            <StyledTableHeader>Actions</StyledTableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (

            <TableRow key={enrollment.ID} className="hover:bg-zinc-50">
              <StyledTableCell>
                <Checkbox
                  checked={selectedItems.includes(enrollment.ID)}
                  onCheckedChange={(checked) => {
                    setSelectedItems(checked ?
                      [...selectedItems, enrollment.ID] :
                      selectedItems.filter(id => id !== enrollment.ID)
                    );
                  }}
                />
              </StyledTableCell>
              {/* <StyledTableCell>{enrollment.ID}</StyledTableCell> */}
              <StyledTableCell>
                <span
                  className="cursor-pointer transition-colors duration-150"
                  style={{ color: 'inherit' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4CAF50')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                  onClick={() => {
                    setViewingStudentId(enrollment.student.id);
                    setIsViewModalOpen(true);
                  }}
                >
                  {enrollment.student.name}
                </span>
              </StyledTableCell>
              <StyledTableCell>
                <span
                  className="cursor-pointer transition-colors duration-150"
                  style={{ color: 'inherit' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4CAF50')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                  onClick={() => {
                    setViewingStudentId(enrollment.student.id);
                    setIsViewModalOpen(true);
                  }}
                >
                  {enrollment.student.email}
                </span>
              </StyledTableCell>
              <StyledTableCell>
                {new Date(enrollment.EnrollmentDate).toLocaleDateString()}
              </StyledTableCell>
              <StyledTableCell>
                <CompactSelect
                  value={enrollment.enrollmentProgress || (enrollment.PMPPass ? "pass" : "fail")}
                  onChange={(value) => handleUpdate(enrollment.ID, {
                    enrollmentProgress: value
                  })}
                  loading={loading[`${enrollment.ID}-enrollmentProgress`]}
                  options={[
                    { value: "pass", label: "Pass" },
                    { value: "fail", label: "Fail" }
                  ]}
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactSelect
                  value={(enrollment.pmbok ? "yes" : "no")}
                  onChange={(value) => handleUpdate(enrollment.ID, {
                    pmbok: value === "yes"
                  })}
                  loading={loading[`${enrollment.ID}-pmbok`]}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                  ]}
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactSelect
                  value={(enrollment.status ? "active" : "inactive")}
                  onChange={(value) => handleUpdate(enrollment.ID, {
                    status: value === "active"
                  })}
                  loading={loading[`${enrollment.ID}-status`]}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" }
                  ]}
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactSelect
                  value={enrollment.MealType || "non-vegetarian"}
                  onChange={(value) => handleUpdate(enrollment.ID, {
                    MealType: value
                  })}
                  loading={loading[`${enrollment.ID}-MealType`]}
                  options={[
                    { value: "vegetarian", label: "Vegetarian" },
                    { value: "non-vegetarian", label: "Non-Vegetarian" }
                  ]}
                />
              </StyledTableCell>
              <StyledTableCell>{enrollment.student.phone}</StyledTableCell>
              <StyledTableCell>{enrollment.Price}</StyledTableCell>
              <StyledTableCell >
                {enrollment.Comments ? (
                  <CustomTooltip content={(() => {
                    // Format the comments with proper date formatting
                    const formattedComments = enrollment.Comments.split('\n').map((line) => {
                      // Check if the line contains a date pattern (ISO date format)
                      const dateMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
                      if (dateMatch) {
                        const dateStr = dateMatch[1];
                        const date = new Date(dateStr);
                        const formattedDate = date.toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }).replace(/(\d+)(?=(,))/, match => {
                          const num = parseInt(match);
                          let suffix = "th";
                          if (num % 10 === 1 && num % 100 !== 11) suffix = "st";
                          else if (num % 10 === 2 && num % 100 !== 12) suffix = "nd";
                          else if (num % 10 === 3 && num % 100 !== 13) suffix = "rd";
                          return `${num}${suffix}`;
                        });
                        return line.replace(dateStr, formattedDate);
                      }
                      return line;
                    }).join('\n');
                    return formattedComments;
                  })()}>
                    <span className="line-clamp-1 whitespace-pre-wrap">
                      {enrollment.Comments.substring(0, 20)}
                      {enrollment.Comments.length > 20 && '...'}
                    </span>
                  </CustomTooltip>
                ) : "N/A"}
              </StyledTableCell>

              {/* Dynamic day input cells */}
              {classdays.map((date, index) => (
                <StyledTableCell key={date.toISOString()}>
                  <CompactInput
                    value={enrollment[`day${index + 1}Input`] || ""}
                    onChange={(value) => handleUpdate(enrollment.ID, {
                      [`day${index + 1}Input`]: value
                    })}
                    loading={loading[`${enrollment.ID}-day${index + 1}Input`]}
                    placeholder={`Day ${index + 1} Input`}
                  />
                </StyledTableCell>
              ))}

              {/* Test Date and Signature cells */}
              <StyledTableCell>
                <CompactInput
                  value={enrollment.testDate || ""}
                  onChange={(value) => handleUpdate(enrollment.ID, {
                    testDate: value
                  })}
                  loading={loading[`${enrollment.ID}-testDate`]}
                  placeholder="Test Date"
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactInput
                  value={enrollment.signatureInput || ""}
                  onChange={(value) => handleUpdate(enrollment.ID, {
                    signatureInput: value
                  })}
                  loading={loading[`${enrollment.ID}-signatureInput`]}
                  placeholder="Signature"
                />
              </StyledTableCell>
              <StyledTableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRescheduleClick(enrollment.student.id, enrollment.ID)}
                >
                  Reschedule
                </Button>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-zinc-50 font-medium">
            <TableCell colSpan={15} className="text-right pr-4">
              Grand Total:
            </TableCell>
            <TableCell>${grandTotal.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              <div className="flex flex-col gap-1">
                <span className="text-green-600">Vegetarian: {vegetarianCount}</span>
                <span className="text-blue-600">Non-Vegetarian: {nonVegetarianCount}</span>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default EnrollmentTable;