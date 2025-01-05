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

const Instructor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      emailID: formData.get('emailID'),
      mobile: formData.get('mobile'),
      telNo: formData.get('telNo'),
      password: formData.get('password'),
      billingAddress: formData.get('billingAddress'),
      contactAddress: formData.get('contactAddress'),
      profile: formData.get('profile'),
      isDelete: false,
      active: formData.get('active') === 'true'
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/signup/instructor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      setSuccess(true);
      setShowSuccessModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-start max-w-7xl w-full justify-start px-4">
        <Card className="w-full max-w-7xl">
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
                    <Input id="name" name="name" required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="emailID">Email</Label>
                    <Input id="emailID" name="emailID" type="email" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" name="mobile" type="tel" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telNo">Telephone Number</Label>
                    <Input id="telNo" name="telNo" type="tel" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>

                <div className='grid lg:grid-cols-2 grid-cols-1 gap-4'>
                  <div className="grid gap-2">
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Textarea id="billingAddress" name="billingAddress" required />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactAddress">Contact Address</Label>
                    <Textarea id="contactAddress" name="contactAddress" required />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="profile">Profile Description</Label>
                  <Textarea id="profile" name="profile" required />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="active" name="active" defaultChecked />
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
            <AlertDialogTitle>Success!</AlertDialogTitle>
            <AlertDialogDescription>
              Your instructor account has been successfully created. You can now log in to start using your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>
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

export default Instructor;