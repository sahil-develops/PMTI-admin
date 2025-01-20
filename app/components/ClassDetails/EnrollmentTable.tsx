import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

// Updated styling components
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

const CompactSelect = ({ value, onChange, options }: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; }[];
}) => (
  <Select value={value} onValueChange={onChange}>
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

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "1":
        return "bg-green-100 text-green-800";
      case "2":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusStyles(status)}`}>
      {status === "1" ? "Active" : status === "2" ? "Pending" : "Inactive"}
    </span>
  );
};

const RescheduleBadge = () => (
  <Link href="#" className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
    Reschedule
  </Link>
);

interface Enrollment {
  id: string;
  student: {
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
}

interface EnrollmentTableProps {
  enrollments: Enrollment[];
}

export const EnrollmentTable = ({ enrollments }: EnrollmentTableProps) => {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

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
                  if (checked) {
                    setSelectedItems(enrollments.map(e => e.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
              />
            </StyledTableHeader>
            <StyledTableHeader>Name</StyledTableHeader>
            <StyledTableHeader>Email</StyledTableHeader>
            <StyledTableHeader>Enrollment on</StyledTableHeader>
            <StyledTableHeader>Mode</StyledTableHeader>
            <StyledTableHeader>PMP Pass</StyledTableHeader>
            <StyledTableHeader>Change</StyledTableHeader>
            <StyledTableHeader>PMBOK</StyledTableHeader>
            <StyledTableHeader>Status</StyledTableHeader>
            <StyledTableHeader>Change Meal</StyledTableHeader>
            <StyledTableHeader>Phone</StyledTableHeader>
            <StyledTableHeader>Price</StyledTableHeader>
            <StyledTableHeader>Com</StyledTableHeader>
            <StyledTableHeader>Reschedule</StyledTableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment, index) => (
            <TableRow key={index} className="hover:bg-zinc-50">
              <StyledTableCell>
                <Checkbox
                  checked={selectedItems.includes(enrollment.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedItems([...selectedItems, enrollment.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== enrollment.id));
                    }
                  }}
                />
              </StyledTableCell>
              <StyledTableCell>{enrollment.student.name}</StyledTableCell>
              <StyledTableCell>{enrollment.student.email}</StyledTableCell>
              <StyledTableCell>
                {new Date(enrollment.EnrollmentDate).toLocaleDateString()}
              </StyledTableCell>
              <StyledTableCell>{enrollment.PaymentMode}</StyledTableCell>
              <StyledTableCell>
                {enrollment.PMPPass ? "Passed" : "In progress"}
              </StyledTableCell>
              <StyledTableCell>
                <CompactSelect
                  value="progress"
                  onChange={() => {}}
                  options={[
                    { value: "progress", label: "Progress" },
                    { value: "complete", label: "Complete" }
                  ]}
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactSelect
                  value={enrollment.pmbok ? "yes" : "no"}
                  onChange={() => {}}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                  ]}
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactSelect
                  value="active"
                  onChange={() => {}}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" }
                  ]}
                />
              </StyledTableCell>
              <StyledTableCell>
                <CompactSelect
                  value={enrollment.MealType || "non-vegetarian"}
                  onChange={() => {}}
                  options={[
                    { value: "vegetarian", label: "Vegetarian" },
                    { value: "non-vegetarian", label: "Non-Vegetarian" }
                  ]}
                />
              </StyledTableCell>
              <StyledTableCell>{enrollment.student.phone}</StyledTableCell>
              <StyledTableCell>${enrollment.Price}</StyledTableCell>
              <StyledTableCell>{enrollment.Comments}</StyledTableCell>
              <StyledTableCell>
                <RescheduleBadge />
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-zinc-50 font-medium">
            <TableCell colSpan={11} className="text-right pr-4">
            Grand Total: 
            </TableCell>
            <TableCell className="text-right">
             ${grandTotal.toFixed(2)}
            </TableCell>
            <TableCell colSpan={2} className="text-right">
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