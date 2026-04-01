'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/app/lib/api';
import { Check, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

const Breadcrumb = () => {
  return (
    <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <Link href="/instructors" className="ml-2 text-gray-500 hover:text-gray-700">
              Instructors
            </Link>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-500" />
            <span className="ml-2 text-gray-900 font-medium">Add Instructor</span>
          </div>
        </li>
      </ol>
    </nav>
  );
};

const Confetti = () => {
  const confettiCount = 50;
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  return (
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(confettiCount)].map((_, i) => {
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 2;
        const randomDuration = 2 + Math.random() * 2;
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomRotation = Math.random() * 360;
        const size = 8 + Math.random() * 8;

        return (
          <motion.div
            key={i}
            initial={{
              x: `${randomX}vw`,
              y: -20,
              scale: 0,
              rotate: 0
            }}
            animate={{
              y: '100vh',
              scale: 1,
              rotate: randomRotation * 5
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: randomColor,
              borderRadius: '2px',
            }}
          />
        );
      })}
    </div>
  );
};

const AddInstructor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    emailID: '',
    mobile: '',
    telNo: '',
    billingAddress: '',
    contactAddress: '',
    profile: '',
    active: false,
  });

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const patterns = {
    name: /^[A-Za-z\s]{2,50}$/,
    emailID: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
    mobile: /^[1-9]\d{9}$/,
    telNo: /^[0-9]{10,12}$/,
    address: /^[A-Za-z0-9\s,.'&\-<>\/]{10,200}$/,
    profile: /^[A-Za-z0-9\s,.!?-]{20,500}$/,
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value) error = 'Full name is required';
        else if (!patterns.name.test(value)) error = 'Name should only contain letters and spaces (2-50 chars)';
        break;
      case 'emailID':
        if (!value) error = 'Email is required';
        else if (!patterns.emailID.test(value)) error = 'Please enter a valid email address';
        break;
      case 'mobile':
        if (!value) error = 'Mobile number is required';
        else if (!patterns.mobile.test(value)) error = 'Enter a valid 10-digit mobile number (not starting with 0)';
        break;
      case 'telNo':
        if (!value) error = 'Telephone number is required';
        else if (!patterns.telNo.test(value)) error = 'Telephone should be 10-12 digits';
        break;
      case 'billingAddress':
        if (!value) error = 'Billing address is required';
        else if (value.length < 10) error = 'Address must be at least 10 characters';
        else if (value.length > 200) error = 'Address must not exceed 200 characters';
        else if (!patterns.address.test(value)) error = 'Address contains invalid characters';
        break;
      case 'contactAddress':
        if (!value) error = 'Contact address is required';
        else if (value.length < 10) error = 'Address must be at least 10 characters';
        else if (value.length > 200) error = 'Address must not exceed 200 characters';
        else if (!patterns.address.test(value)) error = 'Address contains invalid characters';
        break;
      case 'profile':
        if (!value) error = 'Profile description is required';
        else if (value.length < 20) error = 'Profile must be at least 20 characters';
        else if (value.length > 500) error = 'Profile must not exceed 500 characters';
        else if (!patterns.profile.test(value)) error = 'Profile contains invalid characters';
        break;
    }
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'active') {
        const error = validateField(key, formData[key as keyof typeof formData] as string);
        if (error) newErrors[key] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    setError('');

    const data = {
      ...formData,
      password: 'Default@123',
      isDelete: false,
    };

    try {
      const response = await api.post('/auth/signup/instructor', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Signup failed');
      }

      setSuccess(true);
      setShowSuccessModal(true);
      window.location.href = '/instructors';
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = 'Something went wrong. Please try again.';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen w-full p-4 space-y-4">
        <Breadcrumb />

        <Card className="w-full max-w-full">
          <CardHeader>
            <CardTitle>Instructor Signup</CardTitle>
            <CardDescription>Create your instructor account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className='grid lg:grid-cols-2 grid-cols-1 gap-4'>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="emailID">Email</Label>
                    <Input
                      id="emailID"
                      name="emailID"
                      type="email"
                      value={formData.emailID}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={errors.emailID ? "border-red-500" : ""}
                    />
                    {errors.emailID && <span className="text-xs text-red-500">{errors.emailID}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <span className="text-xs text-muted-foreground">10 digits</span>
                    </div>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      placeholder="Enter 10 digit mobile number"
                      className={errors.mobile ? "border-red-500" : ""}
                    />
                    {errors.mobile && <span className="text-xs text-red-500">{errors.mobile}</span>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telNo">Telephone Number</Label>
                    <Input
                      id="telNo"
                      name="telNo"
                      type="tel"
                      value={formData.telNo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={errors.telNo ? "border-red-500" : ""}
                    />
                    {errors.telNo && <span className="text-xs text-red-500">{errors.telNo}</span>}
                  </div>
                </div>

                <div className='grid lg:grid-cols-2 grid-cols-1 gap-4'>
                  <div className="grid gap-2">
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Textarea
                      id="billingAddress"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={200}
                      className={errors.billingAddress ? "border-red-500" : ""}
                    />
                    {errors.billingAddress && <span className="text-xs text-red-500">{errors.billingAddress}</span>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactAddress">Contact Address</Label>
                    <Textarea
                      id="contactAddress"
                      name="contactAddress"
                      value={formData.contactAddress}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      maxLength={200}
                      className={errors.contactAddress ? "border-red-500" : ""}
                    />
                    {errors.contactAddress && <span className="text-xs text-red-500">{errors.contactAddress}</span>}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="profile">Profile Description</Label>
                  <Textarea
                    id="profile"
                    name="profile"
                    value={formData.profile}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    maxLength={500}
                    className={errors.profile ? "border-red-500" : ""}
                  />
                  {errors.profile && <span className="text-xs text-red-500">{errors.profile}</span>}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    name="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Active Account</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorModal(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <AlertDialogTitle className="text-green-600">Success!</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-green-600">
              Your instructor account has been successfully created. You can now log in to start using your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence>
        {showSuccessModal && <Confetti />}
      </AnimatePresence>
    </>
  );
};

export default AddInstructor;