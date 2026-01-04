"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Edit2, FileInput, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check } from 'lucide-react';
import { Loader2 } from 'lucide-react';



interface ViewStudentModalProps {
  studentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StudentData {
  id: number;
  uid: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  companyName: string;
  profession: string;
  referredBy: string;
  signupDate: string;
  downloadedInfoPac: boolean;
  isDelete: boolean;
  active: boolean;
  lastLogin: string;
  locationId?: string;
}

interface StudentResponse {
  message: string;
  error: string;
  success: boolean;
  data: StudentData[];
}

interface EditStudentModalProps {
  student: StudentData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: number, data: Partial<StudentData>) => Promise<void>;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <AlertDialogTitle>Success!</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Student information has been successfully updated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  studentName,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {studentName}'s account and all associated data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ViewStudentModal: React.FC<ViewStudentModalProps> = ({
  studentId,
  isOpen,
  onClose,
}) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentDetails();
    }
  }, [isOpen, studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }

      const data = await response.json();
      if (data.success) {
        setStudentData(data.data);
      } else {
        setError(data.error || data.message || 'Failed to fetch student details');
      }
    } catch (error: any) {
      console.error('Error fetching student details:', error);
      setError(error.message || 'Failed to fetch student details');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get location info
  const getLocationInfo = (student: any) => {
    let cityName = 'N/A';
    let stateName = 'N/A';
    let countryName = 'N/A';

    if (student?.city && typeof student.city === 'object' && student.city !== null) {
      const cityObj = student.city as any;
      cityName = cityObj.location || 'N/A';
    } else if (typeof student?.city === 'string' && student.city) {
      cityName = student.city;
    }

    if (student?.state && typeof student.state === 'object' && student.state !== null) {
      const stateObj = student.state as any;
      stateName = stateObj.name || 'N/A';
    } else if (typeof student?.state === 'string' && student.state) {
      stateName = student.state;
    }

    if (student?.country && typeof student.country === 'object' && student.country !== null) {
      const countryObj = student.country as any;
      countryName = countryObj.CountryName || 'N/A';
    } else if (typeof student?.country === 'string' && student.country) {
      countryName = student.country;
    }

    return { cityName, stateName, countryName };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : studentData ? (
          <div className="space-y-6">
            {/* Personal Information Section */}
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
                  <p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${studentData.student.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {studentData.student.active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Last Login</p>
                  <p>{studentData.student.lastLogin ? new Date(studentData.student.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
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
                    {getLocationInfo(studentData.student).cityName !== 'N/A'
                      ? `${getLocationInfo(studentData.student).cityName}, `
                      : ''}
                    {getLocationInfo(studentData.student).stateName !== 'N/A'
                      ? `${getLocationInfo(studentData.student).stateName}, `
                      : ''}
                    {getLocationInfo(studentData.student).countryName !== 'N/A'
                      ? getLocationInfo(studentData.student).countryName
                      : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Zip Code</p>
                  <p>{studentData.student.zipCode || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Information Section */}
            {/* Enrollment Information Section */}
            {/* Enrollment Information Section */}
            {studentData.enrollments && studentData.enrollments.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Enrollment History</h3>
                <div className="space-y-6">
                  {studentData.enrollments.map((enrollment: any, index: number) => (
                    <div key={enrollment.ID} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Course/Class Title</p>
                          <p className="font-medium">
                            {enrollment.course ? enrollment.course.courseName :
                              (enrollment.class ? enrollment.class.title : 'N/A')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Type</p>
                          <p>{enrollment.enrollmentType || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Enrollment Date</p>
                          <p>{enrollment.EnrollmentDate ?
                            new Date(enrollment.EnrollmentDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Payment</p>
                          <p>
                            ${parseFloat(enrollment.Price).toFixed(2)}
                            {enrollment.PaymentMode && ` (${enrollment.PaymentMode})`}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Progress</p>
                          <p className="capitalize">{enrollment.enrollmentProgress || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${enrollment.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {enrollment.status ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Class Details Section */}
                      {enrollment.class && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-md font-medium mb-3">Class Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Start Date</p>
                              <p>{enrollment.class.startDate ?
                                new Date(enrollment.class.startDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">End Date</p>
                              <p>{enrollment.class.endDate ?
                                new Date(enrollment.class.endDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Class Time</p>
                              <p>{enrollment.class.classTime || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Address</p>
                              <p>{enrollment.class.address || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Max Students</p>
                              <p>{enrollment.class.maxStudent || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Online Available</p>
                              <p>{enrollment.class.onlineAvailable ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Instructor Details Section */}
                      {enrollment.class?.instructor && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-md font-medium mb-3">Instructor Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Name</p>
                              <p className="font-medium">{enrollment.class.instructor.name || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p>{enrollment.class.instructor.emailID || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Mobile</p>
                              <p>{enrollment.class.instructor.mobile || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-500">Tel No</p>
                              <p>{enrollment.class.instructor.telNo || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <p className="text-sm font-medium text-gray-500">Address</p>
                              <p>{enrollment.class.instructor.billingAddress || 'N/A'}</p>
                            </div>
                            {enrollment.class.instructor.profile && (
                              <div className="space-y-1 md:col-span-3">
                                <p className="text-sm font-medium text-gray-500">Profile</p>
                                <p className="text-sm">{enrollment.class.instructor.profile}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Comments Section */}
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


const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<StudentData>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countries, setCountries] = useState<{ id: number; CountryName: string }[]>([]);
  const [states, setStates] = useState<{ id: number; name: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Add new state for city input disabled state
  const [isCityInputDisabled, setIsCityInputDisabled] = useState(true);

  // In the EditStudentModal component, update the useEffect that sets initial form data:
  useEffect(() => {
    if (student) {
      // Handle country - can be object or string
      const countryId = student.country && typeof student.country === 'object'
        ? (student.country as { id: number }).id.toString()
        : student.country || "";

      // Handle state - can be object or string
      const stateId = student.state && typeof student.state === 'object'
        ? (student.state as { id: number }).id.toString()
        : student.state || "";

      // Handle city - can be object or string
      const cityValue = student.city && typeof student.city === 'object'
        ? (student.city as { location: string }).location
        : student.city || "";

      setFormData({
        name: student.name,
        address: student.address,
        city: cityValue,
        state: stateId, // Ensure this is the state ID
        country: countryId,
        zipCode: student.zipCode,
        phone: student.phone,
        email: student.email,
        companyName: student.companyName,
        profession: student.profession,
      });

      setSelectedCountry(countryId);
      setSelectedState(stateId);
      // Enable city input if state is selected
      setIsCityInputDisabled(!stateId);
    }
  }, [student]);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/country`);
      const data = await response.json();
      setCountries(data.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/state/?countryId=${countryId}`);
      const data = await response.json();
      setStates(data.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = "Name is required";
    }

    if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.city || formData.city.trim() === '') {
      newErrors.city = "City is required";
    }

    if (!formData.state) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSave(student.id, formData);
      setShowSuccess(true);
      onClose();
    } catch (error) {
      // Error is handled in the onSave function
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setFormData(prev => ({
      ...prev,
      state: stateId,
      city: '' // Clear city when state changes
    }));
    setIsCityInputDisabled(!stateId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            {/* Country selection */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
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

            {/* State selection */}
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={selectedState}
                onValueChange={handleStateChange}
                disabled={!selectedCountry}
              >
                <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                  <SelectValue placeholder={selectedCountry ? "Select State" : "Select Country First"} />
                </SelectTrigger>
                <SelectContent>
                  {states.length > 0 ? (
                    states.map((state) => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-states" disabled>
                      No states available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-xs text-red-500">{errors.state}</p>
              )}
            </div>

            {/* City input field */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder={isCityInputDisabled ? "Select State First" : "Enter city"}
                disabled={isCityInputDisabled}
                className={isCityInputDisabled ? "bg-gray-100" : errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-xs text-red-500">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode || ''}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName || ''}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                value={formData.profession || ''}
                onChange={(e) => handleInputChange('profession', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </Dialog>
  );
};

const Students = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [professionFilter, setProfessionFilter] = useState("all");
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingStudentId, setViewingStudentId] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentData | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const uniqueStates = Array.from(new Set(
    students.map(student => {
      if (student.state && typeof student.state === 'string') {
        return student.state;
      }
      return 'Unknown';
    })
  )).filter(Boolean).sort();
  const uniqueProfessions = Array.from(new Set(students.map(student => student.profession))).sort();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, statusFilter, stateFilter, professionFilter, students]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data: StudentResponse = await response.json();
      if (data.success) {
        setStudents(data.data);
        setFilteredStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        (student.companyName && student.companyName.toLowerCase().includes(searchLower)) ||
        student.uid.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(student =>
        statusFilter === "active" ? student.active : !student.active
      );
    }

    if (stateFilter !== "all") {
      filtered = filtered.filter(student => {
        if (typeof student.state === 'object' && student.state) {
          return (student.state as { name: string }).name === stateFilter;
        }
        return student.state === stateFilter;
      });
    }

    if (professionFilter !== "all") {
      filtered = filtered.filter(student => student.profession === professionFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleEditStudent = async (studentId: number, updatedData: Partial<StudentData>) => {
    try {
      // Create a payload object that will be sent to the API
      const payload: any = { ...updatedData };

      // Convert state to integer if it exists
      if (updatedData.state) {
        payload.state = parseInt(updatedData.state);
        if (isNaN(payload.state)) {
          throw new Error('Invalid state ID');
        }
      }

      // Convert country to integer if it exists
      if (updatedData.country) {
        payload.country = parseInt(updatedData.country);
        if (isNaN(payload.country)) {
          throw new Error('Invalid country ID');
        }
      }

      // Ensure city is not empty
      if (!payload.city || payload.city.trim() === '') {
        throw new Error('City is required');
      }

      console.log("Sending payload to API:", payload);

      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Get specific error message if available
        const errorMessage = data.error || data.message || 'Failed to update student';
        throw new Error(errorMessage);
      }

      // Update local state with the updated data
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId ? { ...student, ...updatedData } : student
        )
      );

      setShowSuccess(true);

      // Refresh student list
      fetchStudents();

    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
    }
  };

  const handleAddStudent = () => {
    router.push('/students/add');
  };

  // Helper function to safely get city, state, country values
  const getLocationInfo = (student: StudentData) => {
    let cityName = 'N/A';
    let stateName = 'N/A';
    let countryName = 'N/A';

    // Check if city exists and is an object before using 'in' operator
    if (student.city && typeof student.city === 'object' && student.city !== null) {
      // Use type assertion with optional chaining to safely access location
      const cityObj = student.city as any;
      cityName = cityObj.location || 'N/A';
    } else if (typeof student.city === 'string' && student.city) {
      cityName = student.city;
    }

    // Check if state exists and is an object before accessing properties
    if (student.state && typeof student.state === 'object' && student.state !== null) {
      // Use type assertion with optional chaining to safely access name
      const stateObj = student.state as any;
      stateName = stateObj.name || 'N/A';
    } else if (typeof student.state === 'string' && student.state) {
      stateName = student.state;
    }

    // Check if country exists and is an object before accessing properties
    if (student.country && typeof student.country === 'object' && student.country !== null) {
      // Use type assertion with optional chaining to safely access CountryName
      const countryObj = student.country as any;
      countryName = countryObj.CountryName || 'N/A';
    } else if (typeof student.country === 'string' && student.country) {
      countryName = student.country;
    }

    return { cityName, stateName, countryName };
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/students/${deletingStudent.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to delete student');
      }

      // Update local state to remove the deleted student
      setStudents(prevStudents =>
        prevStudents.filter(student => student.id !== deletingStudent.id)
      );
      setFilteredStudents(prevFiltered =>
        prevFiltered.filter(student => student.id !== deletingStudent.id)
      );

      toast({
        title: "Success",
        description: `${deletingStudent.name} has been successfully deleted.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeletingStudent(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}


      </div>
    );
  }

  return (
    <Card className="w-full max-w-full mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle>Students Management</CardTitle>
        <Button onClick={handleAddStudent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, company, or UID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={professionFilter} onValueChange={setProfessionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Profession" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Professions</SelectItem>
                  {uniqueProfessions.map(profession => (
                    <SelectItem key={profession} value={profession}>{profession}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredStudents.length} of {students.length} students
          </div>

          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {/* <th className="px-4 py-3 text-left font-medium text-gray-500">ID</th> */}
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Company</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Last Login</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => {
                    const { cityName, stateName } = getLocationInfo(student);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        {/* <td className="px-4 py-3 text-gray-900">{student.id}</td> */}
                        <td className="px-4 py-3 text-gray-900">{student.name}</td>
                        <td className="px-4 py-3 text-gray-500">{student.email}</td>
                        <td className="px-4 py-3 text-gray-500">{student.companyName || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {`${cityName}, ${stateName}`}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{student.phone || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {student.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingStudent(student);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setViewingStudentId(student.id);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                <Search className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  router.push(`students/classEnrollment/${student.id}`);
                                }}
                              >
                                <FileInput className="mr-2 h-4 w-4" />
                                Class  Enrollment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  router.push(`students/courseEnrolllment/${student.id}`);
                                }}
                              >
                                <FileInput className="mr-2 h-4 w-4" />
                                Course  Enrollment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setDeletingStudent(student);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
      <ViewStudentModal
        studentId={viewingStudentId}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingStudentId(null);
        }}
      />
      {/* Edit Student Modal */}
      <EditStudentModal
        student={editingStudent}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleEditStudent}
      />
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingStudent(null);
        }}
        onConfirm={handleDeleteStudent}
        studentName={deletingStudent?.name || ''}
      />
    </Card>
  );
};

export default Students;