'use client'
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
    instructorId: 1,
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
    hotelConfirmation: ""
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    setShowError(false);

    try {
      if (!formData.title || !formData.description) {
        throw new Error("Title and description are required");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({
          ...formData,
          categoryId: Number(formData.categoryId),
          classTypeId: Number(formData.classTypeId),
          countryId: Number(formData.countryId),
          locationId: Number(formData.locationId),
          maxStudent: Number(formData.maxStudent),
          minStudent: Number(formData.minStudent),
          price: Number(formData.price),
          addedBy: Number(formData.addedBy),
          updatedBy: Number(formData.updatedBy),
          instructorId: Number(formData.instructorId)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create class");
      }

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
        instructorId: 1,
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
        <div className="flex flex-col lg:px-0 sm:px-2 px-4 pt-4 lg:flex-row gap-4 justify-center">
          <div className="space-y-4 w-full lg:w-1/2">
            {/* Left Column */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category ID</label>
                <input
                  type="number"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Class Type ID</label>
                <input
                  type="number"
                  name="classTypeId"
                  value={formData.classTypeId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country ID</label>
                <input
                  type="number"
                  name="countryId"
                  value={formData.countryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location ID</label>
                <input
                  type="number"
                  name="locationId"
                  value={formData.locationId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="onlineAvailable"
                  checked={formData.onlineAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">Online Available</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isCorpClass"
                  checked={formData.isCorpClass}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">Corporate Class</label>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-4">
            {/* Right Column */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Class Time</label>
              <input
                type="text"
                name="classTime"
                value={formData.classTime}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Online Course ID</label>
              <input
                type="text"
                name="onlineCourseId"
                value={formData.onlineCourseId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Students</label>
                <input
                  type="number"
                  name="maxStudent"
                  value={formData.maxStudent}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Min Students</label>
                <input
                  type="number"
                  name="minStudent"
                  value={formData.minStudent}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hotel</label>
              <input
                type="text"
                name="hotel"
                value={formData.hotel}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hotel Email</label>
                <input
                  type="email"
                  name="hotelEmailId"
                  value={formData.hotelEmailId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hotel Contact</label>
                <input
                  type="tel"
                  name="hotelContactNo"
                  value={formData.hotelContactNo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Flight Confirmation</label>
                <input
                  type="text"
                  name="flightConfirmation"
                  value={formData.flightConfirmation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Car Confirmation</label>
                <input
                  type="text"
                  name="carConfirmation"
                  value={formData.carConfirmation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hotel Confirmation</label>
                <input
                  type="text"
                  name="hotelConfirmation"
                  value={formData.hotelConfirmation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-gray-800 border"
                />
              </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Success!</h3>
            <p className="text-gray-500 text-center">Class has been created successfully.</p>
            <button
              onClick={() => {
                setShowSuccess(false);
                window.location.href = '/classes'; // Redirect to classes list
              }}
              className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-600 text-center mb-2">Error</h3>
            <p className="text-gray-500 text-center">
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