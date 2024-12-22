"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
const ClassForm = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: 1,
    classTypeId: 2,
    countryId: 1,
    locationId: 2,
    address: "",
    startDate: "",
    endDate: "",
    maxStudent: 30,
    minStudent: 5,
    price: 150.0,
    status: true,
    instructorId: "",
    onlineAvailable: true,
    isCancel: false,
    addedBy: 1,
    updatedBy: 1,
    isDelete: false,
    classTime: "",
    onlineCourseId: "",
    isCorpClass: false,
    hotel: "",
    hotelEmailId: "",
    hotelContactNo: "",
    flightConfirmation: "",
    carConfirmation: "",
    hotelConfirmation: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({
          title: "",
          description: "",
          categoryId: 1,
          classTypeId: 2,
          countryId: 1,
          locationId: 2,
          address: "",
          startDate: "",
          endDate: "",
          maxStudent: 30,
          minStudent: 5,
          price: 150.0,
          status: true,
          instructorId: "",
          onlineAvailable: true,
          isCancel: false,
          addedBy: 1,
          updatedBy: 1,
          isDelete: false,
          classTime: "",
          onlineCourseId: "",
          isCorpClass: false,
          hotel: "",
          hotelEmailId: "",
          hotelContactNo: "",
          flightConfirmation: "",
          carConfirmation: "",
          hotelConfirmation: "",
        });
      } else {
        throw new Error("Failed to create class");
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-0">
              <nav className="flex my-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 text-sm">
          <li>
            <Link href="/" className="text-zinc-500 hover:text-zinc-700">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </li>
          <li className="text-zinc-900 font-medium">
            Add Class
          </li>
        </ol>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight">Add Class</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col lg:px-0 sm:px-2 px-4 pt-4 lg:flex-row gap-4  justify-center">
          <div className="space-y-4 w-full lg:w-1/2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="onlineAvailable"
                checked={formData.onlineAvailable}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Online Available
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Students
                </label>
                <input
                  type="number"
                  name="maxStudent"
                  value={formData.maxStudent}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Min Students
                </label>
                <input
                  type="number"
                  name="minStudent"
                  value={formData.minStudent}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700">
                Instructor Id
              </label>
              <input
                type="number"
                name="instructorId"
                value={formData.instructorId}
                onChange={handleInputChange}
                step="0.01"
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
Online Course Id
              </label>
              <input
                type="text"
                name="onlineCourseId"
                value={formData.onlineCourseId}
                onChange={handleInputChange}
                step="0.01"
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>
         
        
            </div>

           

         
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-y-[17px]">
         <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
          <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Class Time
              </label>
              <input
                type="text"
                name="classTime"
                value={formData.classTime}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hotel
              </label>
              <input
                type="text"
                name="hotel"
                value={formData.hotel}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
              />
            </div>
<div className="grid lg:grid-cols-2 grid-cols-1 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hotel Email
              </label>
              <input
                type="email"
                name="hotelEmailId"
                value={formData.hotelEmailId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hotel Contact
              </label>
              <input
                type="tel"
                name="hotelContactNo"
                value={formData.hotelContactNo}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                />
            </div>
                </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hotel Confirmation
              </label>
              <input
                type="tel"
                name="hotelConfirmation"
                value={formData.hotelConfirmation}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Car Confirmation
              </label>
              <input
                type="tel"
                name="carConfirmation"
                value={formData.carConfirmation}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
Flight Confirmation
              </label>
              <input
                type="text"
                name="flightConfirmation"
                value={formData.flightConfirmation}
                onChange={handleInputChange}
                step="0.01"
                className="mt-1 block w-full rounded-md  shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading ? "bg-gray-400" : "bg-zinc-800 hover:bg-zinc-900"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {loading ? "Creating..." : "Create Class"}
        </button>
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-500">
              Class has been created successfully.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
            <p className="text-gray-500">
              {errorMessage || "Something went wrong. Please try again."}
            </p>
            <button
              onClick={() => setShowError(false)}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassForm;
