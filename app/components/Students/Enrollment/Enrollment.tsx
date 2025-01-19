"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface EnrollmentFormData {
  classId: number;
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
  BillMail: string;
  BillDate: string;
  PMPPass: boolean;
  MealType: string;
  CCNo: string;
  CCExpiry: string;
  pmbok: boolean;
  CreditCardHolder: string;
  CVV: string;
  zipCode: string;
  Promotion?: string;
}

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

const Enrollment = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [sameAsStudent, setSameAsStudent] = useState(false);
  
    const [countries, setCountries] = useState<Array<{ id: number; CountryName: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: number; location: string }>>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");


  const [formData, setFormData] = useState<EnrollmentFormData>({
    classId: 1,
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
    BillDate: new Date().toISOString(),
    PMPPass: false,
    MealType: "Vegetarian",
    CCNo: "",
    CCExpiry: "",
    pmbok: false,
    CreditCardHolder: "",
    CVV: "",
    Promotion: "",
    zipCode: ""
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchLocations(selectedCountry);
    }
  }, [selectedCountry]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://api.4pmti.com/enrollment/class', {
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Class</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Country</Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={(value) => {
                      setSelectedCountry(value);
                      setSelectedLocation("");
                      setLocations([]);
                    }}
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
                    onValueChange={setSelectedLocation}
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
                <div>
                  <Label>Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pmp">PMP Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" />
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
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Payment Mode</Label>
                  <Select value="other">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Payment Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Enrollment Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Comments</Label>
                  <Textarea
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
                  />
                </div>
                <div>
                  <Label>Billing Address</Label>
                  <Textarea
                    value={formData.BillingAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, BillingAddress: e.target.value }))}
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
                  />
                </div>
                <div>
                  <Label>Credit Card Holder Phone</Label>
                  <Input
                    value={formData.BillPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, BillPhone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Credit Card Holder Email</Label>
                  <Input
                    type="email"
                    value={formData.BillMail}
                    onChange={(e) => setFormData(prev => ({ ...prev, BillMail: e.target.value }))}
                  />
                </div>
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

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        © 2019 www.4PMTI.com, All rights reserved.
      </div>
    </div>
  );
};

export default Enrollment;