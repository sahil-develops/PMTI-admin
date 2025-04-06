'use client'
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Validation schema using Zod
const transactionSchema = z.object({
  // Payment Information
  cardNumber: z.string()
    .regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Expiry date must be in MM/YY format"),
  cvv: z.string()
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  amount: z.string()
    .transform((val) => Number(val))
    .refine((val) => val > 0, "Amount must be greater than 0"),

  // Order Information
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  description: z.string().min(1, "Description is required"),

  // Billing Information
  billingFirstName: z.string().min(1, "First name is required"),
  billingLastName: z.string().min(1, "Last name is required"),
  billingCompany: z.string().optional(),
  billingAddress: z.string().min(1, "Address is required"),
  billingCity: z.string().min(1, "City is required"),
  billingState: z.string().min(1, "State is required"),
  billingZip: z.string().min(1, "ZIP code is required"),
  billingCountry: z.string().min(1, "Country is required"),
  billingPhone: z.string()
    .regex(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
  billingEmail: z.string()
    .email("Invalid email address"),

  // Student Information
  studentFirstName: z.string().min(1, "Student first name is required"),
  studentLastName: z.string().min(1, "Student last name is required"),
  studentAddress: z.string().min(1, "Student address is required"),
  studentCity: z.string().min(1, "Student city is required"),
  studentState: z.string().min(1, "Student state is required"),
  studentZip: z.string().min(1, "Student ZIP code is required"),
  studentCountry: z.string().min(1, "Student country is required"),
  studentPhone: z.string()
    .regex(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
  studentEmail: z.string()
    .email("Invalid email address"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const Transaction = () => {
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      // @ts-ignore
      amount: "",
      invoiceNumber: "",
      description: "",
      billingFirstName: "",
      billingLastName: "",
      billingCompany: "",
      billingAddress: "",
      billingCity: "",
      billingState: "",
      billingZip: "",
      billingCountry: "",
      billingPhone: "",
      billingEmail: "",
      studentFirstName: "",
      studentLastName: "",
      studentAddress: "",
      studentCity: "",
      studentState: "",
      studentZip: "",
      studentCountry: "",
      studentPhone: "",
      studentEmail: "",
    },
  });

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          amount: Number(data.amount),
          cardNumber: data.cardNumber,
          expirationDate: data.expiryDate,
          cvv: data.cvv,
          customerEmail: data.billingEmail,
          invoiceNumber: data.invoiceNumber,
          description: data.description,
          studentLastName: data.studentLastName,
          studentFirstName: data.studentFirstName,
          company: data.billingCompany,
          address: data.billingAddress,
          city: data.billingCity,
          state: data.billingState,
          zip: data.billingZip,
          country: data.billingCountry,
          phone: data.billingPhone,
          email: data.billingEmail,
          studentAddress: data.studentAddress,
          studentCity: data.studentCity,
          studentState: data.studentState,
          studentZip: data.studentZip,
          studentCountry: data.studentCountry,
          studentPhone: data.studentPhone,
          studentEmail: data.studentEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed. Please try again.');
      }

      setShowSuccessModal(true);
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setShowErrorModal(true);
    }
  };

  const FormInput = ({ 
    name, 
    label, 
    placeholder = "", 
    type = "text" 
  }: { 
    name: keyof TransactionFormValues; 
    label: string; 
    placeholder?: string; 
    type?: string; 
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              placeholder={placeholder} 
              type={type} 
              {...field}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="mx-auto py-8 px-4">
      <Card className="w-full max-w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Processing...' : 'SUBMIT'}
              </Button>
            </form>
          </Form>
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