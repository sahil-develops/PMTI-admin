"use client";

import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Briefcase, Mail, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import api from '@/app/lib/api';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const cityData = [
  {
    country: "USA",
    state: "NY",
    cities: ["New York", "Buffalo", "Albany", "Rochester"]
  },
  {
    country: "USA",
    state: "CA",
    cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose"]
  },
  {
    country: "USA",
    state: "TX",
    cities: ["Houston", "Austin", "Dallas", "San Antonio"]
  }
];

interface Student {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  companyName: string;
  profession: string;
  referredBy?: string;
  email: string;
}

interface StudentResponse {
  message: string;
  error: string;
  success: boolean;
  data: StudentData[];
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
}

const Students = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
    companyName: "",
    profession: "",
    referredBy: "",
    email: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
    companyName: "",
    profession: "",
    referredBy: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`students`);
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === parseInt(studentId));
    if (student) {
      setSelectedStudent(student);
      setEditFormData({
        name: student.name,
        address: student.address,
        city: student.city,
        state: student.state,
        country: student.country,
        zipCode: student.zipCode,
        phone: student.phone,
        companyName: student.companyName,
        profession: student.profession,
        referredBy: student.referredBy || "",
        email: student.email,
      });
      setErrors({});
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}students/${selectedStudent?.id}`, {
        ...editFormData,
        updatedBy: 'admin',
      });

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Student information updated successfully",
          variant: "default",
        });
        await fetchStudents(); // Refresh the list
        setSelectedStudent(null);
        setEditFormData({
          name: "",
          address: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          phone: "",
          companyName: "",
          profession: "",
          referredBy: "",
          email: "",
        });
      }
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update student information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (formData.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (!formData.state) {
      newErrors.state = "State is required";
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
    }
    if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Invalid zip code";
    }
    if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format (XXX-XXX-XXXX)";
    }
    if (!formData.companyName) {
      newErrors.companyName = "Company name is required";
    }
    if (!formData.profession) {
      newErrors.profession = "Profession is required";
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (formData.password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must be at least 8 characters and contain both letters and numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleCitySelect = (city: string) => {
    const locationData = cityData.find((item) => 
      item.cities.includes(city)
    );
    
    if (locationData) {
      setFormData(prev => ({
        ...prev,
        city,
        state: locationData.state,
        country: locationData.country
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}auth/signup/student`, {
        ...formData,
        signupDate: new Date().toISOString(),
        downloadedInfoPac: true,
        addedBy: 'admin',
        updatedBy: 'admin',
        isDelete: false,
        active: true,
        lastLogin: new Date().toISOString(),
      });

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "Success",
          description: "Check your email for a booking confirmation. We'll see you soon!",
          variant: "default",
        });
        // Reset form
        setFormData({
          name: "",
          address: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          phone: "",
          companyName: "",
          profession: "",
          referredBy: "",
          email: "",
          password: "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.status === 500 && error.response?.data?.error === 'This Email Already Exists'
          ? 'This email is already registered. Please try another email address.'
          : 'Something went wrong. Please try again.',
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const studentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid zip code"),
    phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Invalid phone number format (XXX-XXX-XXXX)"),
    companyName: z.string().min(1, "Company name is required"),
    profession: z.string().min(1, "Profession is required"),
    referredBy: z.string().optional(),
  });

  type StudentFormValues = z.infer<typeof studentSchema>;

  const EditStudentForm = ({ student, onCancel, onSuccess }: { 
    student: Student; 
    onCancel: () => void;
    onSuccess: () => void;
  }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<StudentFormValues>({
      resolver: zodResolver(studentSchema),
      defaultValues: {
        name: student.name,
        email: student.email,
        address: student.address,
        city: student.city,
        state: student.state,
        country: student.country,
        zipCode: student.zipCode,
        phone: student.phone,
        companyName: student.companyName,
        profession: student.profession,
        referredBy: student.referredBy || "",
      },
    });

    const onSubmit = async (data: StudentFormValues) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}students/${student.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            ...data,
            updatedBy: 'admin',
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update student');
        }

        toast({
          title: "Success",
          description: "Student information updated successfully",
        });
        onSuccess();
      } catch (error) {
        console.error('Error updating student:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update student",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} className="pl-10" placeholder="Full Name" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} type="email" className="pl-10" placeholder="Email" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} className="pl-10" placeholder="Address" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityData.flatMap(item =>
                        item.cities.map(city => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} className="pl-10 bg-gray-50" readOnly placeholder="State" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} className="pl-10 bg-gray-50" readOnly placeholder="Country" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} className="pl-10" placeholder="Zip Code (e.g., 12345 or 12345-6789)" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} className="pl-10" placeholder="Phone (XXX-XXX-XXXX)" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} className="pl-10" placeholder="Company Name" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} className="pl-10" placeholder="Profession" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referred By</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input {...field} className="pl-10" placeholder="Referred By (Optional)" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Student'
              )}
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  const StudentsTable = () => {
    const [students, setStudents] = useState<StudentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      fetchStudents();
    }, []);

    const fetchStudents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}students`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data: StudentResponse = await response.json();
        if (data.success) {
          setStudents(data.data);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoading) {
      return (
        <div className="w-full mt-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">All Students</h2>
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">UID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Company</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{student.uid}</td>
                    <td className="px-4 py-3 text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-gray-500">{student.email}</td>
                    <td className="px-4 py-3 text-gray-500">{student.companyName}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {`${student.city}, ${student.state}`}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{student.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(student.lastLogin).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Student Registration</CardTitle>
        <CardDescription>Register a new student account</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Student</TabsTrigger>
            <TabsTrigger value="edit">Edit Student</TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-9 h-9"
                      placeholder="Full Name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-9 h-9"
                      placeholder="Email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-9 h-9"
                      placeholder="Password"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="pl-9 h-9"
                      placeholder="Address"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-xs text-red-500">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleCitySelect(value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityData.flatMap(item => 
                        item.cities.map(city => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="text-xs text-red-500">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="pl-9 h-9"
                      placeholder="Zip Code"
                    />
                  </div>
                  {errors.zipCode && (
                    <p className="text-xs text-red-500">{errors.zipCode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-9 h-9"
                      placeholder="XXX-XXX-XXXX"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="pl-9 h-9"
                      placeholder="Company Name"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-xs text-red-500">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="profession"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="pl-9 h-9"
                      placeholder="Profession"
                    />
                  </div>
                  {errors.profession && (
                    <p className="text-xs text-red-500">{errors.profession}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="w-auto px-8">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Student"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="edit" className="space-y-6">
            {!selectedStudent ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Student to Edit</Label>
                  <Select onValueChange={handleStudentSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <EditStudentForm
                student={selectedStudent}
                onCancel={() => {
                  setSelectedStudent(null);
                }}
                onSuccess={() => {
                  setSelectedStudent(null);
                  fetchStudents();
                }}
              />
            )}
          </TabsContent>
        </Tabs>
        
        <StudentsTable />
      </CardContent>
    </Card>
  );
};

export default Students;