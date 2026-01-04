'use client'
import React, { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

// Define the form values type
type TransactionFormValues = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: string;
  invoiceNumber: string;
  description: string;
  billingFirstName: string;
  billingLastName: string;
  billingCompany: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  billingPhone: string;
  billingEmail: string;
  studentFirstName: string;
  studentLastName: string;
  studentAddress: string;
  studentCity: string;
  studentState: string;
  studentZip: string;
  studentCountry: string;
  studentPhone: string;
  studentEmail: string;
}

// Define validation errors type
type ValidationErrors = {
  [K in keyof TransactionFormValues]?: string;
}

const Transaction = () => {
  const [formValues, setFormValues] = useState<TransactionFormValues>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: '',
    invoiceNumber: '',
    description: '',
    billingFirstName: '',
    billingLastName: '',
    billingCompany: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
    billingPhone: '',
    billingEmail: '',
    studentFirstName: '',
    studentLastName: '',
    studentAddress: '',
    studentCity: '',
    studentState: '',
    studentZip: '',
    studentCountry: '',
    studentPhone: '',
    studentEmail: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  // Single input change handler
  const handleInputChange = (fieldName: keyof TransactionFormValues, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Special handler for expiry date formatting
  const handleExpiryChange = (value: string) => {
    // Remove any non-digit characters
    let cleanValue = value.replace(/\D/g, '');

    // Add slash after first 2 digits
    if (cleanValue.length >= 2) {
      cleanValue = cleanValue.substring(0, 2) + '/' + cleanValue.substring(2);
    }

    // Limit to MM/YY format (5 characters)
    cleanValue = cleanValue.substring(0, 5);

    handleInputChange('expiryDate', cleanValue);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Required field validation
    const requiredFields: (keyof TransactionFormValues)[] = [
      'cardNumber', 'expiryDate', 'cvv', 'amount', 'invoiceNumber', 'description',
      'billingFirstName', 'billingLastName', 'billingCompany', 'billingAddress',
      'billingCity', 'billingState', 'billingZip', 'billingCountry',
      'billingPhone', 'billingEmail', 'studentFirstName', 'studentLastName',
      'studentAddress', 'studentCity', 'studentState', 'studentZip',
      'studentCountry', 'studentPhone', 'studentEmail'
    ];

    requiredFields.forEach(field => {
      if (!formValues[field] || formValues[field].trim() === '') {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    // Card number validation
    if (formValues.cardNumber && !/^\d{16}$/.test(formValues.cardNumber)) {
      newErrors.cardNumber = "Card number must be 16 digits";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formValues.billingEmail && !emailRegex.test(formValues.billingEmail)) {
      newErrors.billingEmail = "Please enter a valid email address";
      isValid = false;
    }
    if (formValues.studentEmail && !emailRegex.test(formValues.studentEmail)) {
      newErrors.studentEmail = "Please enter a valid email address";
      isValid = false;
    }

    // Expiry date validation
    if (formValues.expiryDate && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formValues.expiryDate)) {
      newErrors.expiryDate = "Format should be MM/YY";
      isValid = false;
    }

    // CVV validation
    if (formValues.cvv && !/^\d{3,4}$/.test(formValues.cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
      isValid = false;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (formValues.billingPhone && !phoneRegex.test(formValues.billingPhone.replace(/\D/g, ''))) {
      newErrors.billingPhone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }
    if (formValues.studentPhone && !phoneRegex.test(formValues.studentPhone.replace(/\D/g, ''))) {
      newErrors.studentPhone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    // ZIP code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (formValues.billingZip && !zipRegex.test(formValues.billingZip)) {
      newErrors.billingZip = "Please enter a valid ZIP code (12345 or 12345-6789)";
      isValid = false;
    }
    if (formValues.studentZip && !zipRegex.test(formValues.studentZip)) {
      newErrors.studentZip = "Please enter a valid ZIP code (12345 or 12345-6789)";
      isValid = false;
    }

    // Amount validation
    if (formValues.amount && (isNaN(Number(formValues.amount)) || Number(formValues.amount) <= 0)) {
      newErrors.amount = "Please enter a valid positive amount";
      isValid = false;
    }

    // Name validation
    const nameRegex = /^[A-Za-z\s\-']+$/;
    if (formValues.billingFirstName && !nameRegex.test(formValues.billingFirstName)) {
      newErrors.billingFirstName = "Please enter a valid name";
      isValid = false;
    }
    if (formValues.billingLastName && !nameRegex.test(formValues.billingLastName)) {
      newErrors.billingLastName = "Please enter a valid name";
      isValid = false;
    }
    if (formValues.studentFirstName && !nameRegex.test(formValues.studentFirstName)) {
      newErrors.studentFirstName = "Please enter a valid name";
      isValid = false;
    }
    if (formValues.studentLastName && !nameRegex.test(formValues.studentLastName)) {
      newErrors.studentLastName = "Please enter a valid name";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedData = {
        cardNumber: formValues.cardNumber,
        expirationDate: formValues.expiryDate,
        cvv: formValues.cvv,
        amount: Number(formValues.amount),
        invoiceNumber: formValues.invoiceNumber,
        description: formValues.description,
        firstName: formValues.billingFirstName,
        lastName: formValues.billingLastName,
        company: formValues.billingCompany,
        address: formValues.billingAddress,
        city: formValues.billingCity,
        state: formValues.billingState,
        zip: formValues.billingZip,
        country: formValues.billingCountry,
        phone: formValues.billingPhone,
        email: formValues.billingEmail,
        studentFirstName: formValues.studentFirstName,
        studentLastName: formValues.studentLastName,
        studentAddress: formValues.studentAddress,
        studentCity: formValues.studentCity,
        studentState: formValues.studentState,
        studentZip: formValues.studentZip,
        studentCountry: formValues.studentCountry,
        studentPhone: formValues.studentPhone,
        studentEmail: formValues.studentEmail
      };

      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/payment/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.error && Array.isArray(responseData.error)) {
          const apiErrors: ValidationErrors = {};

          responseData.error.forEach((error: string) => {
            if (error.includes('amount')) apiErrors.amount = error;
            if (error.includes('expirationDate')) apiErrors.expiryDate = error;
            if (error.includes('studentFirstName')) apiErrors.studentFirstName = error;
            if (error.includes('studentLastName')) apiErrors.studentLastName = error;
            if (error.includes('studentAddress')) apiErrors.studentAddress = error;
            if (error.includes('studentCity')) apiErrors.studentCity = error;
            if (error.includes('studentState')) apiErrors.studentState = error;
            if (error.includes('studentZip')) apiErrors.studentZip = error;
            if (error.includes('studentCountry')) apiErrors.studentCountry = error;
            if (error.includes('studentPhone')) apiErrors.studentPhone = error;
            if (error.includes('studentEmail')) apiErrors.studentEmail = error;
          });

          if (Object.keys(apiErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...apiErrors }));
          }
        }

        throw new Error(responseData.message || 'Payment failed. Please try again.');
      }

      setShowSuccessModal(true);
      setFormValues({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        amount: '',
        invoiceNumber: '',
        description: '',
        billingFirstName: '',
        billingLastName: '',
        billingCompany: '',
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        billingCountry: '',
        billingPhone: '',
        billingEmail: '',
        studentFirstName: '',
        studentLastName: '',
        studentAddress: '',
        studentCity: '',
        studentState: '',
        studentZip: '',
        studentCountry: '',
        studentPhone: '',
        studentEmail: '',
      });
      setErrors({});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto py-8 px-4">
      <Card className="w-full max-w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="cardNumber"
                    placeholder="Enter number without spaces"
                    type="text"
                    autoComplete="off"
                    className={errors.cardNumber ? "border-red-500" : ""}
                    value={formValues.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  />
                  {errors.cardNumber && <p className="text-sm font-medium text-red-500">{errors.cardNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    type="text"
                    autoComplete="off"
                    className={errors.expiryDate ? "border-red-500" : ""}
                    value={formValues.expiryDate}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                  />
                  {errors.expiryDate && <p className="text-sm font-medium text-red-500">{errors.expiryDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="cvv"
                    placeholder="3 or 4 digit code"
                    type="text"
                    autoComplete="off"
                    className={errors.cvv ? "border-red-500" : ""}
                    value={formValues.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                  />
                  {errors.cvv && <p className="text-sm font-medium text-red-500">{errors.cvv}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount <span className="text-red-500">*</span></Label>
                  <Input
                    id="amount"
                    type="number"
                    autoComplete="off"
                    className={errors.amount ? "border-red-500" : ""}
                    value={formValues.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                  {errors.amount && <p className="text-sm font-medium text-red-500">{errors.amount}</p>}
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="invoiceNumber"
                    autoComplete="off"
                    className={errors.invoiceNumber ? "border-red-500" : ""}
                    value={formValues.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  />
                  {errors.invoiceNumber && <p className="text-sm font-medium text-red-500">{errors.invoiceNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Input
                    id="description"
                    autoComplete="off"
                    className={errors.description ? "border-red-500" : ""}
                    value={formValues.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                  {errors.description && <p className="text-sm font-medium text-red-500">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Customer Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="billingFirstName">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingFirstName"
                    autoComplete="off"
                    className={errors.billingFirstName ? "border-red-500" : ""}
                    value={formValues.billingFirstName}
                    onChange={(e) => handleInputChange('billingFirstName', e.target.value)}
                  />
                  {errors.billingFirstName && <p className="text-sm font-medium text-red-500">{errors.billingFirstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingLastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingLastName"
                    autoComplete="off"
                    className={errors.billingLastName ? "border-red-500" : ""}
                    value={formValues.billingLastName}
                    onChange={(e) => handleInputChange('billingLastName', e.target.value)}
                  />
                  {errors.billingLastName && <p className="text-sm font-medium text-red-500">{errors.billingLastName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingCompany">Company <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingCompany"
                    autoComplete="off"
                    className={errors.billingCompany ? "border-red-500" : ""}
                    value={formValues.billingCompany}
                    onChange={(e) => handleInputChange('billingCompany', e.target.value)}
                  />
                  {errors.billingCompany && <p className="text-sm font-medium text-red-500">{errors.billingCompany}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingAddress"
                    autoComplete="off"
                    className={errors.billingAddress ? "border-red-500" : ""}
                    value={formValues.billingAddress}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  />
                  {errors.billingAddress && <p className="text-sm font-medium text-red-500">{errors.billingAddress}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingCity">City <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingCity"
                    autoComplete="off"
                    className={errors.billingCity ? "border-red-500" : ""}
                    value={formValues.billingCity}
                    onChange={(e) => handleInputChange('billingCity', e.target.value)}
                  />
                  {errors.billingCity && <p className="text-sm font-medium text-red-500">{errors.billingCity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingState">State <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingState"
                    autoComplete="off"
                    className={errors.billingState ? "border-red-500" : ""}
                    value={formValues.billingState}
                    onChange={(e) => handleInputChange('billingState', e.target.value)}
                  />
                  {errors.billingState && <p className="text-sm font-medium text-red-500">{errors.billingState}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingZip">ZIP Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingZip"
                    autoComplete="off"
                    className={errors.billingZip ? "border-red-500" : ""}
                    value={formValues.billingZip}
                    onChange={(e) => handleInputChange('billingZip', e.target.value)}
                  />
                  {errors.billingZip && <p className="text-sm font-medium text-red-500">{errors.billingZip}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingCountry">Country <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingCountry"
                    autoComplete="off"
                    className={errors.billingCountry ? "border-red-500" : ""}
                    value={formValues.billingCountry}
                    onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                  />
                  {errors.billingCountry && <p className="text-sm font-medium text-red-500">{errors.billingCountry}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingPhone">Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingPhone"
                    autoComplete="off"
                    className={errors.billingPhone ? "border-red-500" : ""}
                    value={formValues.billingPhone}
                    onChange={(e) => handleInputChange('billingPhone', e.target.value)}
                  />
                  {errors.billingPhone && <p className="text-sm font-medium text-red-500">{errors.billingPhone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="billingEmail"
                    type="email"
                    autoComplete="off"
                    className={errors.billingEmail ? "border-red-500" : ""}
                    value={formValues.billingEmail}
                    onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                  />
                  {errors.billingEmail && <p className="text-sm font-medium text-red-500">{errors.billingEmail}</p>}
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="studentFirstName">Student First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentFirstName"
                    autoComplete="off"
                    className={errors.studentFirstName ? "border-red-500" : ""}
                    value={formValues.studentFirstName}
                    onChange={(e) => handleInputChange('studentFirstName', e.target.value)}
                  />
                  {errors.studentFirstName && <p className="text-sm font-medium text-red-500">{errors.studentFirstName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentLastName">Student Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentLastName"
                    autoComplete="off"
                    className={errors.studentLastName ? "border-red-500" : ""}
                    value={formValues.studentLastName}
                    onChange={(e) => handleInputChange('studentLastName', e.target.value)}
                  />
                  {errors.studentLastName && <p className="text-sm font-medium text-red-500">{errors.studentLastName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentAddress">Student Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentAddress"
                    autoComplete="off"
                    className={errors.studentAddress ? "border-red-500" : ""}
                    value={formValues.studentAddress}
                    onChange={(e) => handleInputChange('studentAddress', e.target.value)}
                  />
                  {errors.studentAddress && <p className="text-sm font-medium text-red-500">{errors.studentAddress}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentCity">Student City <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentCity"
                    autoComplete="off"
                    className={errors.studentCity ? "border-red-500" : ""}
                    value={formValues.studentCity}
                    onChange={(e) => handleInputChange('studentCity', e.target.value)}
                  />
                  {errors.studentCity && <p className="text-sm font-medium text-red-500">{errors.studentCity}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentState">Student State <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentState"
                    autoComplete="off"
                    className={errors.studentState ? "border-red-500" : ""}
                    value={formValues.studentState}
                    onChange={(e) => handleInputChange('studentState', e.target.value)}
                  />
                  {errors.studentState && <p className="text-sm font-medium text-red-500">{errors.studentState}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentZip">Student ZIP Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentZip"
                    autoComplete="off"
                    className={errors.studentZip ? "border-red-500" : ""}
                    value={formValues.studentZip}
                    onChange={(e) => handleInputChange('studentZip', e.target.value)}
                  />
                  {errors.studentZip && <p className="text-sm font-medium text-red-500">{errors.studentZip}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentCountry">Student Country <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentCountry"
                    autoComplete="off"
                    className={errors.studentCountry ? "border-red-500" : ""}
                    value={formValues.studentCountry}
                    onChange={(e) => handleInputChange('studentCountry', e.target.value)}
                  />
                  {errors.studentCountry && <p className="text-sm font-medium text-red-500">{errors.studentCountry}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentPhone">Student Phone <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentPhone"
                    autoComplete="off"
                    className={errors.studentPhone ? "border-red-500" : ""}
                    value={formValues.studentPhone}
                    onChange={(e) => handleInputChange('studentPhone', e.target.value)}
                  />
                  {errors.studentPhone && <p className="text-sm font-medium text-red-500">{errors.studentPhone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentEmail">Student Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    autoComplete="off"
                    className={errors.studentEmail ? "border-red-500" : ""}
                    value={formValues.studentEmail}
                    onChange={(e) => handleInputChange('studentEmail', e.target.value)}
                  />
                  {errors.studentEmail && <p className="text-sm font-medium text-red-500">{errors.studentEmail}</p>}
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full md:w-auto bg-zinc-700 hover:bg-zinc-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'SUBMIT'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Successful</AlertDialogTitle>
            <AlertDialogDescription>
              Your payment has been processed successfully. A confirmation email has been sent to your email address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Modal */}
      <AlertDialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Failed</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage || 'An error occurred while processing your payment. Please try again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorModal(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transaction;