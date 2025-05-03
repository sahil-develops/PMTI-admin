'use client'
import React, { useState, useRef, FormEvent, ChangeEvent, useCallback, useEffect } from 'react';
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
  // Payment Information
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
  // Add formValues state back
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
  const [focusedField, setFocusedField] = useState<keyof TransactionFormValues | null>(null);

  // Create a ref for the form
  const formRef = useRef<HTMLFormElement>(null);

  // Handle expiry date formatting
// Handle expiry date formatting
const handleExpiryDateChange = (e: ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;
  
  // Remove any non-digit characters
  value = value.replace(/\D/g, '');
  
  // Add slash after first 2 digits
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2);
  }
  
  // Limit to MM/YY format (5 characters)
  value = value.substring(0, 5);
  
  // Use functional update to ensure we're always working with the latest state
  setFormValues(prevValues => ({
    ...prevValues,
    expiryDate: value
  }));
};

  // Add a general change handler
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Use functional update to ensure we're always working with the latest state
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
    
    // Clear any error for this field when user starts typing
    if (errors[name as keyof TransactionFormValues]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name as keyof TransactionFormValues];
        return newErrors;
      });
    }
  }, [errors]);
  // Update validateForm to work with form data
  const validateForm = (formData: FormData): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    // Required field validation - check all fields
    const requiredFields: (keyof TransactionFormValues)[] = [
      'cardNumber', 'expiryDate', 'cvv', 'amount', 'invoiceNumber', 'description', 
      'billingFirstName', 'billingLastName', 'billingCompany', 'billingAddress', 
      'billingCity', 'billingState', 'billingZip', 'billingCountry', 
      'billingPhone', 'billingEmail', 'studentFirstName', 'studentLastName', 
      'studentAddress', 'studentCity', 'studentState', 'studentZip', 
      'studentCountry', 'studentPhone', 'studentEmail'
    ];

    requiredFields.forEach(field => {
      const value = formData.get(field) as string;
      if (!value || value.trim() === '') {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    // Card number validation
    const cardNumber = formData.get('cardNumber') as string;
    if (cardNumber && !/^\d{16}$/.test(cardNumber)) {
      newErrors.cardNumber = "Card number must be 16 digits";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const billingEmail = formData.get('billingEmail') as string;
    const studentEmail = formData.get('studentEmail') as string;

    if (billingEmail && !emailRegex.test(billingEmail)) {
      newErrors.billingEmail = "Please enter a valid email address";
      isValid = false;
    }
    if (studentEmail && !emailRegex.test(studentEmail)) {
      newErrors.studentEmail = "Please enter a valid email address";
      isValid = false;
    }

    // Expiry date validation
    const expiryDate = formData.get('expiryDate') as string;
    if (expiryDate && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = "Format should be MM/YY";
      isValid = false;
    }

    // CVV validation
    const cvv = formData.get('cvv') as string;
    if (cvv && !/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
      isValid = false;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    const billingPhone = formData.get('billingPhone') as string;
    const studentPhone = formData.get('studentPhone') as string;

    if (billingPhone && !phoneRegex.test(billingPhone.replace(/\D/g, ''))) {
      newErrors.billingPhone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }
    if (studentPhone && !phoneRegex.test(studentPhone.replace(/\D/g, ''))) {
      newErrors.studentPhone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    // ZIP code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    const billingZip = formData.get('billingZip') as string;
    const studentZip = formData.get('studentZip') as string;

    if (billingZip && !zipRegex.test(billingZip)) {
      newErrors.billingZip = "Please enter a valid ZIP code (12345 or 12345-6789)";
      isValid = false;
    }
    if (studentZip && !zipRegex.test(studentZip)) {
      newErrors.studentZip = "Please enter a valid ZIP code (12345 or 12345-6789)";
      isValid = false;
    }

    // Amount validation - must be a positive number
    const amount = formData.get('amount') as string;
    if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      newErrors.amount = "Please enter a valid positive amount";
      isValid = false;
    }

    // Name validation - only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[A-Za-z\s\-']+$/;
    const billingFirstName = formData.get('billingFirstName') as string;
    const billingLastName = formData.get('billingLastName') as string;
    const studentFirstName = formData.get('studentFirstName') as string;
    const studentLastName = formData.get('studentLastName') as string;

    if (billingFirstName && !nameRegex.test(billingFirstName)) {
      newErrors.billingFirstName = "Please enter a valid name";
      isValid = false;
    }
    if (billingLastName && !nameRegex.test(billingLastName)) {
      newErrors.billingLastName = "Please enter a valid name";
      isValid = false;
    }
    if (studentFirstName && !nameRegex.test(studentFirstName)) {
      newErrors.studentFirstName = "Please enter a valid name";
      isValid = false;
    }
    if (studentLastName && !nameRegex.test(studentLastName)) {
      newErrors.studentLastName = "Please enter a valid name";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Update handleSubmit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(formRef.current!);
    if (!validateForm(formData)) {
      return; // Don't proceed if validation fails
    }
    
    setIsSubmitting(true);
    
    try {
      // Format the data for the API with proper structure
      const formattedData = {
        // Payment details
        cardNumber: formValues.cardNumber,
        expirationDate: formValues.expiryDate,
        cvv: formValues.cvv,
        amount: Number(formValues.amount),
        
        // Order information
        invoiceNumber: formValues.invoiceNumber,
        description: formValues.description,
        
        // Address information (using billing info)
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
        
        // Student information
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

      console.log("Sending payment data:", formattedData); // Debugging

      const response = await fetch(`https://api.4pmti.com/payment/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formattedData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("API Error:", responseData); // Debugging
        
        // Check if we have validation errors from the API
        if (responseData.error && Array.isArray(responseData.error)) {
          // Map API errors to form fields when possible
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
          
          // Update the errors state with API validation errors
          if (Object.keys(apiErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...apiErrors }));
          }
        }
        
        throw new Error(responseData.message || 'Payment failed. Please try again.');
      }

      // Only reset form values on success
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
      console.error("Submission error:", error); // Debugging
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UUpdate FormInput component to handle special inputs
const FormInput = ({ 
  name, 
  label, 
  placeholder = "", 
  type = "text",
  onChange
}: { 
  name: keyof TransactionFormValues; 
  label: string; 
  placeholder?: string; 
  type?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle focus
  const handleFocus = () => {
    setFocusedField(name);
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label} <span className="text-red-500">*</span></Label>
      <Input 
        ref={inputRef}
        id={name}
        placeholder={placeholder} 
        type={type}
        name={name}
        autoComplete="off"
        className={errors[name] ? "border-red-500" : ""}
        required
        value={formValues[name]}
        onChange={(e) => {
          // Important: Stop propagation if causing issues
          // e.stopPropagation();
          
          if (onChange) {
            onChange(e);
          } else {
            handleInputChange(e);
          }
        }}
        onFocus={handleFocus}
      />
      {errors[name] && <p className="text-sm font-medium text-red-500">{errors[name]}</p>}
    </div>
  );
};

  return (
    <div className="mx-auto py-8 px-4">
      <Card className="w-full max-w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">
              {/* Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    name="cardNumber"
                    label="Card Number"
                    placeholder="Enter number without spaces"
                  />
                  <FormInput
                    name="expiryDate"
                    label="Expiry Date"
                    placeholder="MM/YY"
                    onChange={handleExpiryDateChange}
                  />
                  <FormInput
                    name="cvv"
                    label="CVV Code"
                    placeholder="3 or 4 digit code"
                  />
                  <FormInput
                    name="amount"
                    label="Amount"
                    type="number"
                  />
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormInput
                    name="invoiceNumber"
                    label="Invoice Number"
                  />
                  <FormInput
                    name="description"
                    label="Description"
                  />
                </div>
              </div>

              {/* Billing Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Billing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    name="billingFirstName"
                    label="First Name"
                  />
                  <FormInput
                    name="billingLastName"
                    label="Last Name"
                  />
                  <FormInput
                    name="billingCompany"
                    label="Company"
                  />
                  <FormInput
                    name="billingAddress"
                    label="Address"
                  />
                  <FormInput
                    name="billingCity"
                    label="City"
                  />
                  <FormInput
                    name="billingState"
                    label="State"
                  />
                  <FormInput
                    name="billingZip"
                    label="ZIP Code"
                  />
                  <FormInput
                    name="billingCountry"
                    label="Country"
                  />
                  <FormInput
                    name="billingPhone"
                    label="Phone"
                  />
                  <FormInput
                    name="billingEmail"
                    label="Email"
                    type="email"
                  />
                </div>
              </div>

              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    name="studentFirstName"
                    label="Student First Name"
                  />
                  <FormInput
                    name="studentLastName"
                    label="Student Last Name"
                  />
                  <FormInput
                    name="studentAddress"
                    label="Student Address"
                  />
                  <FormInput
                    name="studentCity"
                    label="Student City"
                  />
                  <FormInput
                    name="studentState"
                    label="Student State"
                  />
                  <FormInput
                    name="studentZip"
                    label="Student ZIP Code"
                  />
                  <FormInput
                    name="studentCountry"
                    label="Student Country"
                  />
                  <FormInput
                    name="studentPhone"
                    label="Student Phone"
                  />
                  <FormInput
                    name="studentEmail"
                    label="Student Email"
                    type="email"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full md:w-auto bg-zinc-700 hover:bg-zinc-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'SUBMIT'}
              </Button>
            </form>
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