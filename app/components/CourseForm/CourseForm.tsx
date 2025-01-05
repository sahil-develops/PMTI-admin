"use client";

import React, { useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create course");
      }

      setShowSuccess(true);
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
              <Label htmlFor="classType" className="text-sm">Class Type</Label>
              <Input
                id="classType"
                name="classType"
                type="number"
                value={formData.classType}
                onChange={handleInputChange}
                required
                className="h-8"
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

            <div className="space-y-1">
              <Label htmlFor="categoryId" className="text-sm">Category ID</Label>
              <Input
                id="categoryId"
                name="categoryId"
                type="number"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="h-8"
              />
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