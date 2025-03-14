"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClassTypeDropdown from "../DropDown/ClassTypeDropdown1";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

// Add this interface with your other interfaces
interface Category {
  id: number;
  name: string;
  description: string;
  isDelete: boolean;
  active: boolean;
}



interface ClassType {
  id: number;
  name: string;
}

interface CourseFormData {
  courseName: string;
  shortName: string;
  description: string;
  isGuestAccess: boolean;
  createdBy: number;
  isVisible: boolean;
  isDelete: boolean;
  courseDuration: number;
  classType: number;
  price: number;
  extPrice: number;
  categoryId: number;
}

interface CourseFormProps {
  onSuccess?: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [formData, setFormData] = useState<CourseFormData>({
    courseName: "",
    shortName: "",
    description: "",
    isGuestAccess: false,
    createdBy: 1,
    isVisible: true,
    isDelete: false,
    courseDuration: 40,
    classType: 2,
    price: 199.99,
    extPrice: 299.99,
    categoryId: 3
  });
   // Add this state with your other states
   const [categories, setCategories] = useState<Category[]>([]);
   const [coverImage, setCoverImage] = useState<File | null>(null);
   const [isCoverImageUploading, setIsCoverImageUploading] = useState(false);
   const [coverImageError, setCoverImageError] = useState<string>('');
   const [coverImageUrl, setCoverImageUrl] = useState<string>('');
   const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  

     // Add this function with your other fetch functions
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://api.4pmti.com/category', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.data || []); // Set categories from the data property
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  // Function to fetch class types
  const fetchClassTypes = async () => {
    try {
      const response = await fetch('https://api.4pmti.com/classtype', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch class types');
      const data = await response.json();
      // Update this line to access the data property
      setClassTypes(data.data || []); // Add fallback to empty array
    } catch (error) {
      console.error('Error fetching class types:', error);
      setClassTypes([]); // Set empty array on error
    }
  };

  // Add fetchCategories to your useEffect
  useEffect(() => {
    fetchClassTypes();
    fetchCategories(); // Add this line
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSwitchChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name as keyof CourseFormData],
    }));
  };

  const handleClassTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      classType: Number(value)
    }));
  };

  const handleCoverImageUpload = async (file: File) => {
    const allowedTypes = ['png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setCoverImageError('Only PNG, JPG, and JPEG files are allowed.');
      return;
    }

    setIsCoverImageUploading(true);
    setCoverImageError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://api.4pmti.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setCoverImageUrl(data.data.url);
      setIsPreviewVisible(true);
    } catch (error) {
      setCoverImageError('Failed to upload cover image. Please try again.');
    } finally {
      setIsCoverImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate cover image
      if (!coverImageUrl) {
        setErrorMessage("Cover image is required");
        setShowError(true);
        setLoading(false);
        return;
      }

      // Convert the form data to match API expectations
      const apiFormData = {
        ...formData,
        price: formData.price.toFixed(2),      // Convert to string with 2 decimal places
        extPrice: formData.extPrice.toFixed(2), // Convert to string with 2 decimal places
        coverImage: coverImageUrl              // Add the cover image URL
      };

      const response = await fetch(`https://api.4pmti.com/course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(apiFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create course");
      }

      setShowSuccess(true);
      router.push('/courses');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg">Create New Course</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="courseName" className="text-sm">Course Name</Label>
              <Input
                id="courseName"
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
                required
                className="h-8"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="shortName" className="text-sm">Short Name</Label>
              <Input
                id="shortName"
                name="shortName"
                value={formData.shortName}
                onChange={handleInputChange}
                required
                className="h-8"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="courseDuration" className="text-sm">Duration (hours)</Label>
              <Input
                id="courseDuration"
                name="courseDuration"
                type="number"
                value={formData.courseDuration}
                onChange={handleInputChange}
                required
                className="h-8"
              />
            </div>

            <div className="space-y-1">
            <ClassTypeDropdown
    searchParams={{ classTypeId: formData.classType.toString() }}
    setSearchParams={(params) => {
      setFormData(prev => ({
        ...prev,
        classType: Number(params.classTypeId)
      }));
    }}
    classTypes={classTypes}
    refreshClassTypes={fetchClassTypes}
  />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price" className="text-sm">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="h-8"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="extPrice" className="text-sm">External Price ($)</Label>
              <Input
                id="extPrice"
                name="extPrice"
                type="number"
                step="0.01"
                value={formData.extPrice}
                onChange={handleInputChange}
                required
                className="h-8"
              />
            </div>

            {/* // Replace the categoryId Input component with this Select component */}
  <div className="space-y-1">
    <Label>Category</Label>
    <Select
      value={formData.categoryId.toString()}
      onValueChange={(value) => {
        setFormData(prev => ({
          ...prev,
          categoryId: Number(value)
        }));
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem 
            key={category.id} 
            value={category.id.toString()}
          >
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="isGuestAccess" className="text-sm">Guest Access</Label>
              <Switch
                id="isGuestAccess"
                checked={formData.isGuestAccess}
                onCheckedChange={() => handleSwitchChange("isGuestAccess")}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="isVisible" className="text-sm">Visible</Label>
              <Switch
                id="isVisible"
                checked={formData.isVisible}
                onCheckedChange={() => handleSwitchChange("isVisible")}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="h-20 resize-none"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Cover Image <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setCoverImage(e.target.files[0]);
                  handleCoverImageUpload(e.target.files[0]);
                }
              }}
              className={`mt-1 block w-full rounded-md shadow-sm p-2 text-gray-800 border ${
                coverImageError ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
            />
            {coverImageError && (
              <p className="mt-1 text-sm text-red-500">{coverImageError}</p>
            )}
            {isCoverImageUploading && (
              <p className="mt-1 text-sm text-gray-500">Uploading cover image...</p>
            )}

            {isPreviewVisible && coverImageUrl && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Image Preview:</h3>
                <img
                  src={coverImageUrl}
                  alt="Cover Preview"
                  className="mt-2 w-1/3 h-auto rounded-md border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverImageUrl('');
                    setIsPreviewVisible(false);
                  }}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Image
                </button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-9"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </form>
      </CardContent>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              Course has been created successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => window.location.href = '/courses'}>
              View Courses
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Error</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="destructive" onClick={() => setShowError(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CourseForm;