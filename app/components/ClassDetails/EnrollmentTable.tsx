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
} from "@/components/ui/dialog";

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
  <th className={`bg-zinc-100 whitespace-nowrap px-3 py-2 text-left text-sm font-medium text-black ${
    sortable ? 'cursor-pointer hover:bg-zinc-800' : ''
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
      <SelectValue />
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
  const baseUrl = 'https://api.4pmti.com';
  
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

export const EnrollmentTable = ({ 
  enrollments: initialEnrollments, 
  onUpdate,
  startDate,
  endDate,
  onReschedule
}: EnrollmentTableProps) => {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // Changed from string[] to number[]
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);

  const classdays = startDate && endDate ? getDaysBetweenDates(startDate, endDate) : [];

  const handleUpdate = async (studentId: number, payload: UpdatePayload) => {
    
    const loadingKey = `${studentId}-${Object.keys(payload)[0]}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    setError(null);
  
    try {
      const response = await updateEnrollment(studentId, payload);
      if (response.success) {
        setEnrollments(prev => prev.map(enrollment => {
          if (enrollment.student.id === studentId) {
            return {
              ...enrollment,
              PMPPass: payload.enrollmentProgress ? payload.enrollmentProgress === 'pass' : enrollment.PMPPass,
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
          // console.log('Updated enrollment:', { ...enrollment, ...});
          return enrollment;
        }));
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
                Day {index + 1}<br/>
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
              <StyledTableCell>{enrollment.student.name}</StyledTableCell>
              <StyledTableCell>{enrollment.student.email}</StyledTableCell>
              <StyledTableCell>
                {new Date(enrollment.EnrollmentDate).toLocaleDateString()}
              </StyledTableCell>
              <StyledTableCell>
                <CompactSelect
                  value={(enrollment.PMPPass ? "pass" : "fail")}
                  onChange={(value) => handleUpdate(enrollment.ID, {
                    enrollmentProgress: value
                  })}
                  loading={loading[`${enrollment.student.id}-enrollmentProgress`]}
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
                  loading={loading[`${enrollment.student.id}-pmbok`]}
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
                  loading={loading[`${enrollment.student.id}-status`]}
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
                  loading={loading[`${enrollment.student.id}-MealType`]}
                  options={[
                    { value: "vegetarian", label: "Vegetarian" },
                    { value: "non-vegetarian", label: "Non-Vegetarian" }
                  ]}
                />
              </StyledTableCell>
              <StyledTableCell>{enrollment.student.phone}</StyledTableCell>
              <StyledTableCell>{enrollment.Price}</StyledTableCell>
              <StyledTableCell>{enrollment.Comments ? enrollment.Comments : "N/A"}</StyledTableCell>
              
              {/* Dynamic day input cells */}
              {classdays.map((date, index) => (
                <StyledTableCell key={date.toISOString()}>
                  <CompactInput 
                    value={enrollment[`day${index + 1}Input`] || ""}
                    onChange={(value) => handleUpdate(enrollment.student.id, {
                      [`day${index + 1}Input`]: value
                    })}
                    loading={loading[`${enrollment.student.id}-day${index + 1}Input`]}
                    placeholder={`Day ${index + 1} Input`}
                  />
                </StyledTableCell>
              ))}

              {/* Test Date and Signature cells */}
              <StyledTableCell>
                <CompactInput 
                  value={enrollment.testDate || ""}
                  onChange={(value) => handleUpdate(enrollment.student.id, {
                    testDate: value
                  })}
                  loading={loading[`${enrollment.student.id}-testDate`]}
                  placeholder="Test Date"
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactInput 
                  value={enrollment.signatureInput || ""}
                  onChange={(value) => handleUpdate(enrollment.student.id, {
                    signatureInput: value
                  })}
                  loading={loading[`${enrollment.student.id}-signatureInput`]}
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