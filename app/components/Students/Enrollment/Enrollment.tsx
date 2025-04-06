"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
interface State {
  id: number;
  name: string;
  locations: Location[];
  country: {
    id: number;
    CountryName: string;
    currency: string;
    isActive: boolean;
    addedBy: number;
    updatedBy: number | null;
  };
}

interface Location {
  id: number;
  location: string;
  addedBy: string;
  updatedBy: string;
  isDelete: boolean;
  createdAt: string;
  updateAt: string;
}

// First, let's define our interfaces
interface BaseEnrollmentFormData {
  studentId: number;
  Comments: string;
  BillingName: string;
  purchaseOrderId: string;
  cardType: string;
  amount: number;
  BillingAddress: string;
  BillingCity: string;
  BillingState: string;
  BillCountry: string;
  BillPhone: string;
  phone: string;
  BillMail: string;
  BillDate: string;
  PMPPass: boolean;
  MealType: string;
  CCNo: string;
  CCExpiry: string;
  pmbok: boolean;
  name: string;
  CVV: string;
  zipCode: string;
  Promotion?: string;
  companyName: string;
  profession: string;
  email: string;
  downloadedInfoPac: boolean;
  CreditCardHolder: string;
  city: string;
  state: string;
  address: string;
  country: string;
  startDate: string;
  endDate: string;
  enrollmentDate: string;
}

interface ClassEnrollmentFormData extends BaseEnrollmentFormData {
  classId: number;
  courseId?: never;
}

interface CourseEnrollmentFormData extends BaseEnrollmentFormData {
  courseId: number;
  classId?: never;
}

type EnrollmentFormData = ClassEnrollmentFormData | CourseEnrollmentFormData;




interface StudentInfo {
  id: number;
  uid: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  companyName: string;
  profession: string;
  signupDate: string;
  lastLogin: string;
  active: boolean;
}

interface ClassData {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  price: string;
  // Add other fields as needed
}

// Type for items (courses or classes)
interface ItemData {
  id: number;
  title?: string;      // for classes
  courseName?: string; // for courses
  price: string;
  startDate?: string;  // Add this
  endDate?: string;    // Add this
}

const Enrollment = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isCourseEnrollment = pathname?.includes('courseEnrolllment');
  const { toast } = useToast();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [sameAsStudent, setSameAsStudent] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
    const [countries, setCountries] = useState<Array<{ id: number; CountryName: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: number; location: string }>>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  const [items, setItems] = useState<ItemData[]>([])

 const [selectedCountry1, setSelectedCountry1] = useState<string>("52"); // Default to US
  const [selectedState, setSelectedState] = useState<string>("");
  const [cities, setCities] = useState<Location[]>([]);
  const [states, setStates] = useState<State[]>([]);



  const enrollmentType = isCourseEnrollment ? 'Course' : 'Class';
  const typeNameChecker =  isCourseEnrollment ? 'courseId' : 'classId';


  const [selectedItem, setSelectedItem] = useState("");

  // Form data structure updated to handle both types
 

  const fetchStates = async (countryId: string) => {
    try {
      const response = await fetch(
        `https://api.4pmti.com/state/?countryId=${countryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch states');
      }

      const data = await response.json();
      setStates(data.data);
    } catch (error) {
      console.error('Error fetching states:', error);
      toast({
        title: "Error",
        description: "Failed to fetch states",
        variant: "destructive",
      });
    }
  };

   // Add handler for country change with updated naming
   const handleCountryChange1 = async (countryId: string) => {
    setSelectedCountry1(countryId);
    setFormData(prev => ({
      ...prev,
      country: countryId, // Set the country ID
      state: '',
      city: ''
    }));
    
    // Reset states and cities
    setStates([]);
    setCities([]);
    
    // Fetch states for selected country
    fetchStates(countryId);

    // Log to verify the update
    console.log('Updated formData with country:', countryId);
  };


  // Add handler for state change
  const handleStateChange = async (stateId: string) => {
    setSelectedState(stateId);
    setFormData(prev => ({
      ...prev,
      state: stateId,
      city: ''
    }));

    try {
      const response = await fetch(
        `https://api.4pmti.com/location?countryId=${selectedCountry1}&stateId=${stateId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }

      const data = await response.json();
      const sortedCities = [...data.data]
        .filter((city: Location) => !city.isDelete)
        .sort((a, b) => a.location.localeCompare(b.location));
      setCities(sortedCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cities",
        variant: "destructive",
      });
      setCities([]);
    }
  };


  const [errors, setErrors] = useState({
    CCNo: '',
    CCExpiry: '',
    CVV: '',
  });

    // Credit card validation functions
    const validateCreditCard = (number: string) => {
      // Basic Luhn algorithm for credit card validation
      const digits = number.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) return false;
      
      let sum = 0;
      let isEven = false;
      
      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i]);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0;
    };
  
    const validateExpiryDate = (expiry: string) => {
      const [month, year] = expiry.split('/').map(num => parseInt(num.trim()));
      if (!month || !year) return false;
      
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (year < currentYear) return false;
      if (year === currentYear && month < currentMonth) return false;
      if (month < 1 || month > 12) return false;
      
      return true;
    };
  
    const validateCVV = (cvv: string) => {
      const cvvRegex = /^\d{3,4}$/;
      return cvvRegex.test(cvv);
    };
  
    // Format credit card number with spaces
    const formatCreditCard = (value: string) => {
      const digits = value.replace(/\D/g, '');
      const groups = digits.match(/.{1,4}/g) || [];
      return groups.join(' ');
    };
    
    
  
    // Format expiry date
    const formatExpiry = (value: string) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length >= 2) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
      }
      return digits;
    };
  
    const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Remove all non-digit characters and store raw number
      const rawValue = inputValue.replace(/\D/g, '');
      
      // Update form data with raw value (no spaces)
      setFormData(prev => ({ ...prev, CCNo: rawValue }));
      
      // Validate the raw value
      setErrors(prev => ({
        ...prev,
        CCNo: validateCreditCard(rawValue) ? '' : 'Invalid credit card number'
      }));
    };
  
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedValue = formatExpiry(e.target.value);
      setFormData(prev => ({ ...prev, CCExpiry: formattedValue }));
      setErrors(prev => ({
        ...prev,
        CCExpiry: validateExpiryDate(formattedValue) ? '' : 'Invalid expiry date'
      }));
    };
  
    const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '').substr(0, 4);
      setFormData(prev => ({ ...prev, CVV: value }));
      setErrors(prev => ({
        ...prev,
        CVV: validateCVV(value) ? '' : 'Invalid CVV'
      }));
    };
  
    // Modify your existing handleSubmit to include validation
    const handleSubmit11 = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validate all credit card fields
      const newErrors = {
        CCNo: validateCreditCard(formData.CCNo) ? '' : 'Invalid credit card number',
        CCExpiry: validateExpiryDate(formData.CCExpiry) ? '' : 'Invalid expiry date',
        CVV: validateCVV(formData.CVV) ? '' : 'Invalid CVV',
      };
      
      setErrors(newErrors);
      
      // Check if there are any validation errors
      if (Object.values(newErrors).some(error => error !== '')) {
        return;
      }
  
      setLoading(true);
      // ... rest of your submit logic
    };

   // Initialize with properly typed form data
   const [formData, setFormData] = useState<EnrollmentFormData>({
    studentId: parseInt(params.id),
    Comments: "",
    BillingName: "",
    purchaseOrderId: "",
    cardType: "VISA",
    amount: 1000,
    BillingAddress: "",
    BillingCity: "",
    BillingState: "",
    BillCountry: "USA",
    BillPhone: "",
    BillMail: "",
    // @ts-ignore
    Enrollment: isCourseEnrollment ? "Course" : "Class",
    BillDate: new Date().toISOString(),
    PMPPass: false,
    MealType: "Vegetarian",
    CCNo: "",
    CCExpiry: "",
    pmbok: false,
    CVV: "",
    zipCode: "",
    companyName: "",
    profession: "",
    email: "",
    downloadedInfoPac: true,
    CreditCardHolder: "",
    name: "",
    phone: "",
    city: "",
    state: "",
    address: "",
    country: "52",
    ...(isCourseEnrollment ? { courseId: 1 } : { classId: 1 }),
    enrollmentDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchCountries();
    fetchClasses();
    fetchStates("52"); // Fetch US states by default
  }, []);

  
  useEffect(() => {
    if (selectedCountry) {
      fetchLocations(selectedCountry);
    }
  }, [selectedCountry]);


  const fetchItems = async (countryId?: string, locationId?: string) => {
    try {
      const endpoint = isCourseEnrollment ? 'course' : 'class';
      let url = `https://api.4pmti.com/${endpoint}`;
      
      // Add query parameters if both country and location are selected
      if (!isCourseEnrollment && countryId && locationId) {
        url += `?countryId=${countryId}&locationId=${locationId}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const result = await response.json();
      
      if (result.success) {
        setItems(result.data.data);
      } else {
        setItems([]); // Clear items if no results
      }
    } catch (error) {
      console.error(`Error fetching ${enrollmentType.toLowerCase()}:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch ${enrollmentType.toLowerCase()}es`,
        variant: "destructive",
      });
      setItems([]); // Clear items on error
    }
  };

  useEffect(() => {
    if (isCourseEnrollment) {
      fetchItems();
    } else {
      setItems([]); // Clear items when switching to class enrollment
    }
  }, [isCourseEnrollment]);

  // Add a new effect to fetch classes when country and location are selected
  useEffect(() => {
    if (!isCourseEnrollment && selectedCountry && selectedLocation) {
      fetchItems(selectedCountry, selectedLocation);
    }
  }, [selectedCountry, selectedLocation, isCourseEnrollment]);

  


  const fetchCountries = async () => {
    try {
      const response = await fetch('https://api.4pmti.com/country', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCountries(data.data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch countries",
        variant: "destructive",
      });
    }
  };

  const handleItemSelect = (value: string) => {
    const selectedId = parseInt(value);
    const selected = items.find(item => item.id === selectedId);

    if (selected) {
      const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      setFormData(prev => ({
        ...prev,
        ...(isCourseEnrollment 
          ? { courseId: selectedId, classId: undefined }
          : { classId: selectedId, courseId: undefined }
        ),
        amount: parseFloat(selected.price) || 0,
        startDate: selected.startDate || '',
        endDate: selected.endDate || '',
        enrollmentDate: currentDate
      }));
    }
  };

  const fetchLocations = async (countryId: string) => {
    try {
      const response = await fetch(`https://api.4pmti.com/location?countryId=${countryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setLocations(data.data.filter((loc: any) => !loc.isDelete));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch locations",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStudentInfo();
  }, [params.id]);

  const fetchStudentInfo = async () => {
    try {
      const response = await fetch(`https://api.4pmti.com/students/${params.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStudentInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student information",
        variant: "destructive",
      });
    }
  };

  const handleSameAsStudentChange = (checked: boolean) => {
    setSameAsStudent(checked);
    if (checked && studentInfo) {
      setFormData(prev => ({
        ...prev,
        BillingName: studentInfo.name,
        BillingAddress: studentInfo.address,
        BillingCity: studentInfo.city,
        BillingState: studentInfo.state,
        BillCountry: studentInfo.country,
        BillPhone: studentInfo.phone,
        BillMail: studentInfo.email,
      }));
    }
  };

  

   // Add class fetching function
   const fetchClasses = async () => {
    try {
      const response = await fetch('https://api.4pmti.com/class', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const result = await response.json();
      if (result.success && result.data.data) {
        setClasses(result.data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classes",
        variant: "destructive",
      });
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://api.4pmti.com/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccess(true);
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Update the class/course selection JSX
  const renderItemSelection = () => {
    if (isCourseEnrollment) {
      return (
        <div>
          <Label>Select Course</Label>
          <Select
            value={(formData.courseId)?.toString() || ""}
            onValueChange={handleItemSelect}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem 
                  key={item.id} 
                  value={item.id.toString()}
                >
                  {item.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div>
        <Label>Select Class</Label>
        <Select
          value={(formData.classId)?.toString() || ""}
          onValueChange={handleItemSelect}
          required
          disabled={!selectedCountry || !selectedLocation}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !selectedCountry 
                ? "Select a country first" 
                : !selectedLocation 
                  ? "Select a location first"
                  : items.length === 0 
                    ? "No classes available"
                    : "Select Class"
            } />
          </SelectTrigger>
          <SelectContent>
            {items.length > 0 ? (
              items.map((item) => (
                <SelectItem 
                  key={item.id} 
                  value={item.id.toString()}
                >
                  {item.title}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled value="no-classes">
                No classes available for this location
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto p-6">
      {studentInfo && (
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-2 gap-8 p-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Student Information</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Name</Label>
                  <div>{studentInfo.name}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Address</Label>
                  <div>{studentInfo.address}</div>
                </div>
                <div>
                  <Label className="text-gray-500">State</Label>
                  <div>{studentInfo.state}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Last Login</Label>
                  <div>Not Logged in yet</div>
                </div>
                <div>
                  <Label className="text-gray-500">Social Security Number</Label>
                  <div>See Terms for Privacy</div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Email Address</Label>
                  <div>{studentInfo.email}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Tel No.</Label>
                  <div>{studentInfo.phone}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Country</Label>
                  <div>{studentInfo.country}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Company</Label>
                  <div>{studentInfo.companyName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4  pt-4">
      <h3 className="text-lg font-semibold">Credit Card Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Card Number</Label>
          <Input
            type="text"
            value={formData.CCNo ? formatCreditCard(formData.CCNo) : ''}
            onChange={handleCreditCardChange}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={errors.CCNo ? 'border-red-500' : ''}
            required
          />
          {errors.CCNo && (
            <p className="text-sm text-red-500 mt-1">{errors.CCNo}</p>
          )}
        </div>
        <div>
      <Label>Credit Card Holder</Label>
      <Input
        value={formData.CreditCardHolder}
        onChange={(e) => setFormData(prev => ({ ...prev, CreditCardHolder: e.target.value }))}
        placeholder="Enter credit card holder name"
      />
    </div>
       
          <div>
            <Label>Expiry Date</Label>
            <Input
              type="text"
              value={formData.CCExpiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              maxLength={5}
              className={errors.CCExpiry ? 'border-red-500' : ''}
              required
            />
            {errors.CCExpiry && (
              <p className="text-sm text-red-500 mt-1">{errors.CCExpiry}</p>
            )}
          </div>
          
          <div>
            <Label>CVV</Label>
            <Input
              type="text"
              value={formData.CVV}
              onChange={handleCVVChange}
              placeholder="123"
              maxLength={4}
              className={errors.CVV ? 'border-red-500' : ''}
              required
            />
            {errors.CVV && (
              <p className="text-sm text-red-500 mt-1">{errors.CVV}</p>
            )}
          </div>
        </div>


    
           </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select {enrollmentType}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Country</Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={(value) => {
                      setSelectedCountry(value);
                      setSelectedLocation(""); // Reset location when country changes
                      // @ts-ignore
                      setFormData(prev => ({
                        ...prev,
                        classId: isCourseEnrollment ? prev.classId : 1 ,
                        startDate: "",
                        endDate: ""
                      }));
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem 
                          key={country.id} 
                          value={country.id.toString()}
                        >
                          {country.CountryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Select
                    value={selectedLocation}
                    onValueChange={(value) => {
                      setSelectedLocation(value);
                      // @ts-ignore
                      setFormData(prev => ({
                        ...prev,
                        classId: isCourseEnrollment ? prev.classId : 1,
                        startDate: "",
                        endDate: ""
                      }));
                    }}
                    disabled={!selectedCountry || locations.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedCountry 
                          ? "Select a country first" 
                          : locations.length === 0 
                            ? "No locations available" 
                            : "Select Location"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem 
                          key={location.id} 
                          value={location.id.toString()}
                        >
                          {location.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {renderItemSelection()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required 
                    readOnly={!isCourseEnrollment} // Make readonly for class enrollment
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    readOnly={!isCourseEnrollment} // Make readonly for class enrollment
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Purchase Order ID</Label>
                  <Input
                    value={formData.purchaseOrderId}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseOrderId: e.target.value }))}
                 required
                 />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label>Payment Mode</Label>
                  <Select required value="other">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Payment Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem  value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Enrollment Date</Label>
                  <Input 
                    type="date" 
                    value={formData.enrollmentDate}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      enrollmentDate: e.target.value 
                    }))}
                    required
                    readOnly // Make it readonly since it should be the current date
                  />
                </div>
                <div>
                  <Label>Comments</Label>
                  <Textarea
                  required
                    value={formData.Comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, Comments: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Meal Type</Label>
                  <Select
                    value={formData.MealType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, MealType: value }))}
                  required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Meal Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Promotion Code</Label>
                  <Input
                    value={formData.Promotion}
                    onChange={(e) => setFormData(prev => ({ ...prev, Promotion: e.target.value }))}
                  
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Billing Information</h3>
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="sameAsStudent"
                  checked={sameAsStudent}
                  onCheckedChange={handleSameAsStudentChange}
                />
                <label htmlFor="sameAsStudent">Same as Student Information</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Billing Name</Label>
                  <Input
                    value={formData.BillingName}
                    onChange={(e) => setFormData(prev => ({ ...prev, BillingName: e.target.value }))}
                 required
                 />
                </div>
                <div>
                  <Label>Billing Address</Label>
                  <Textarea
                    value={formData.BillingAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, BillingAddress: e.target.value }))}
                 required
                 />
                </div>
                <div>
                  <Label>Select Country</Label>
                  <Select
                    value={formData.BillCountry}
                    onValueChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        BillCountry: value
                      }));
                    }}
                 required
                 >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem 
                          key={country.id} 
                          value={country.id.toString()}
                        >
                          {country.CountryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Zip Code</Label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  required
                  />
                </div>
                <div>
                  <Label>Credit Card Holder Phone</Label>
                  <Input
                    value={formData.BillPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, BillPhone: e.target.value }))}
                  required
                  />
                </div>
                <div>
                  <Label>Credit Card Holder Email</Label>
                  <Input
                    type="email"
                    value={formData.BillMail}
                    onChange={(e) => setFormData(prev => ({ ...prev, BillMail: e.target.value }))}
                  required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
  <h3 className="text-lg font-semibold">Additional Information</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label>Name</Label>
      <Input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Enter name"
        required
        />
    </div>
    
    <div>
      <Label>Company Name</Label>
      <Input
        value={formData.companyName}
        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
        placeholder="Enter company name"
    required
    />
    </div>
    <div>
      <Label>Profession</Label>
      <Input
        value={formData.profession}
        onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
        placeholder="Enter profession"
   required
   />
    </div>
    <div>
      <Label>Email</Label>
      <Input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="Enter email address"
    required
    />
    </div>
    
   <div>
      <Label>Phone</Label>
      <Input
        value={formData.phone}
        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        placeholder="Enter phone number"
    required
    />
 
   </div>

 

   <div>
            <Label>Country</Label>
            <Select
              value={selectedCountry1}
              onValueChange={handleCountryChange1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem 
                    key={country.id} 
                    value={country.id.toString()}
                  >
                    {country.CountryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>State</Label>
            <Select
              value={selectedState}
              onValueChange={handleStateChange}
              disabled={!selectedCountry1}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCountry1 ? "Select State" : "Select Country First"} />
              </SelectTrigger>
              <SelectContent>
                {states.length > 0 ? (
                  states.map((state) => (
                    <SelectItem 
                      key={state.id} 
                      value={state.id.toString()}
                    >
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
          </div>

          <div>
            <Label>City</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, city: value }));
              }}
              disabled={!selectedState}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedCountry1 
                    ? "Select Country First" 
                    : !selectedState 
                      ? "Select State First"
                      : "Select City"
                } />
              </SelectTrigger>
              <SelectContent>
                {cities && cities.length > 0 ? (
                  cities.map((city) => (
                    <SelectItem 
                      key={city.id} 
                      value={city.id.toString()}
                    >
                      {city.location}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-cities" disabled>
                    No cities available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter address"
            />
          </div>
        </div>
      

    <div className="col-span-2">
      {/* <div className="flex items-center space-x-2">
        <Checkbox
          id="downloadedInfoPac"
          checked={formData.downloadedInfoPac}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ 
              ...prev, 
              downloadedInfoPac: checked as boolean 
            }))
          }
        />
        <label htmlFor="downloadedInfoPac">
          I have downloaded and read the information package
        </label>
      </div> */}
    </div>
  </div>


            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Enrolling..." : "Enroll Now"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <AlertDialogTitle>Enrollment Successful!</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              The student has been successfully enrolled in the class.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccess(false);
                router.push('/students');
              }}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Modal */}
      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <AlertDialogTitle>Enrollment Failed</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              There was an error processing the enrollment. Please try again or contact support if the problem persists.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowError(false)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
};

export default Enrollment;