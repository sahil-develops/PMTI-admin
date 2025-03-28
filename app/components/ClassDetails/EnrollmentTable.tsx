import React , {useState} from 'react';
import { Table, TableBody, TableCell,  TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
interface Enrollment {
  day4Input: string | undefined;
  day2Input: string | undefined;
  day1Input: string | undefined;
  day3Input: string | undefined;
  signatureInput: string | undefined;
  id: string;
  student: {
    id: any;
    name: string;
    email: string;
    phone: string;
  };
  EnrollmentDate: string;
  PaymentMode: string;
  PMPPass: boolean;
  pmbok: boolean;
  MealType?: string;
  Price: number;
  Comments: string;
  status: boolean;
}

interface EnrollmentTableProps {
  enrollments: Enrollment[];
  onUpdate?: () => void;
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.4pmti.com';
  
  try {
    const response = await fetch(`${baseUrl}/enrollment/${studentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
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

export const EnrollmentTable = ({ enrollments: initialEnrollments, onUpdate }: EnrollmentTableProps) => {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);



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
  const grandTotal = enrollments.reduce((sum, enrollment) => sum + Number(enrollment.Price), 0);
  const vegetarianCount = enrollments.filter(e => e.MealType?.toLowerCase() === 'vegetarian').length;
  const nonVegetarianCount = enrollments.filter(e => e.MealType?.toLowerCase() === 'non-vegetarian').length;

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
                  setSelectedItems(checked ? enrollments.map(e => e.id) : []);
                }}
              />
            </StyledTableHeader>
            <StyledTableHeader>Name</StyledTableHeader>
            <StyledTableHeader>Email</StyledTableHeader>
            <StyledTableHeader>Enrollment on</StyledTableHeader>
            {/* <StyledTableHeader>Mode</StyledTableHeader> */}
            <StyledTableHeader>Progress</StyledTableHeader>
            <StyledTableHeader>PMBOK</StyledTableHeader>
            <StyledTableHeader>Status</StyledTableHeader>
            <StyledTableHeader>Meal Type</StyledTableHeader>
            <StyledTableHeader>Phone</StyledTableHeader>
            {/* <StyledTableHeader>Price</StyledTableHeader> */}
            {/* <StyledTableHeader>Comments</StyledTableHeader> */}
            <StyledTableHeader>Day 1 10hrs</StyledTableHeader>
            <StyledTableHeader>Day 2 10hrs</StyledTableHeader>
            <StyledTableHeader>Day 3 10hrs</StyledTableHeader>
            <StyledTableHeader>Day 4 10hrs</StyledTableHeader>
            <StyledTableHeader>Test Date</StyledTableHeader>
            <StyledTableHeader>Signature</StyledTableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment, index) => (
            <TableRow key={enrollment.id} className="hover:bg-zinc-50">
              <StyledTableCell>
                <Checkbox
                  checked={selectedItems.includes(enrollment.id)}
                  onCheckedChange={(checked) => {
                    setSelectedItems(checked ? 
                      [...selectedItems, enrollment.id] : 
                      selectedItems.filter(id => id !== enrollment.id)
                    );
                  }}
                />
              </StyledTableCell>
              <StyledTableCell>{enrollment.student.name}</StyledTableCell>
              <StyledTableCell>{enrollment.student.email}</StyledTableCell>
              <StyledTableCell>
                {new Date(enrollment.EnrollmentDate).toLocaleDateString()}
              </StyledTableCell>
              {/* <StyledTableCell>{enrollment.PaymentMode}</StyledTableCell> */}
              <StyledTableCell>
         {/* Progress Select */}
<CompactSelect
  value={enrollment.PMPPass ? "pass" : "fail"}
  onChange={(value) => handleUpdate(enrollment.student.id, {
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
              {/* PMBOK Select */}
<CompactSelect
  value={enrollment.pmbok ? "yes" : "no"}
  onChange={(value) => handleUpdate(enrollment.student.id, {
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
             {/* Status Select */}
<CompactSelect
  value={enrollment.status ? "active" : "inactive"}
  onChange={(value) => handleUpdate(enrollment.student.id, {
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
              {/* Meal Type Select */}
<CompactSelect
  value={enrollment.MealType || "non-vegetarian"}
  onChange={(value) => handleUpdate(enrollment.student.id, {
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
              <StyledTableCell>
                <CompactInput 
                  value={enrollment.day1Input || ""}
                  onChange={(value) => handleUpdate(enrollment.student.id, {
                    day1Input: value
                  })}
                  loading={loading[`${enrollment.student.id}-day1Input`]}
                  placeholder="Day 1 Input"
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactInput 
                  value={enrollment.day2Input || ""}
                  onChange={(value) => handleUpdate(enrollment.student.id, {
                    day2Input: value
                  })}
                  loading={loading[`${enrollment.student.id}-day2Input`]}
                  placeholder="Day 2 Input"
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactInput 
                  value={enrollment.day3Input || ""}
                  onChange={(value) => handleUpdate(enrollment.student.id, {
                    day3Input: value
                  })}
                  loading={loading[`${enrollment.student.id}-day3Input`]}
                  placeholder="Day 3 Input"
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactInput 
                  value={enrollment.day4Input || ""}
                  onChange={(value) => handleUpdate(enrollment.student.id, {
                    day4Input: value
                  })}
                  loading={loading[`${enrollment.student.id}-day4Input`]}
                  placeholder="Day 4 Input"
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactInput 
                  value={enrollment.day1Input || ""}
                  onChange={(value) => handleUpdate(enrollment.student.id, {
                    day1Input: value
                  })}
                  loading={loading[`${enrollment.student.id}-EnrollmentDate`]}
                  placeholder="Test Date"
                />
                {/* Test Date column remains unchanged */}
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
              {/* <StyledTableCell>${enrollment.Price}</StyledTableCell> */}
              {/* <StyledTableCell>{enrollment.Comments}</StyledTableCell> */}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-zinc-50 font-medium">
            <TableCell colSpan={13} className="text-right pr-4">
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