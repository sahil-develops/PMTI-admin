'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useParams, useRouter } from 'next/navigation';

const EditInstructor = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    emailID: '',
    mobile: '',
    telNo: '',
    billingAddress: '',
    contactAddress: '',
    profile: '',
    active: true
  });

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instructor/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setFormData(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch instructor details');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching instructor details');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instructor/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccessModal(true);
        // Redirect after successful update
        setTimeout(() => {
          router.push(`/instructors/viewInstructor/${id}`);
        }, 2000);
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      active: checked
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <div className="flex min-h-screen items-start max-w-full w-full justify-start">
        <Card className="w-full max-w-full">
          <CardHeader>
            <CardTitle>Edit Instructor</CardTitle>
            <CardDescription>Update instructor information</CardDescription>
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
                      onChange={handleInputChange}
                      required 
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="emailID">Email</Label>
                    <Input 
                      id="emailID" 
                      name="emailID" 
                      type="email" 
                      value={formData.emailID}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input 
                      id="mobile" 
                      name="mobile" 
                      type="tel" 
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telNo">Telephone Number</Label>
                    <Input 
                      id="telNo" 
                      name="telNo" 
                      type="tel" 
                      value={formData.telNo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className='grid lg:grid-cols-2 grid-cols-1 gap-4'>
                  <div className="grid gap-2">
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Textarea 
                      id="billingAddress" 
                      name="billingAddress" 
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactAddress">Contact Address</Label>
                    <Textarea 
                      id="contactAddress" 
                      name="contactAddress" 
                      value={formData.contactAddress}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="profile">Profile Description</Label>
                  <Textarea 
                    id="profile" 
                    name="profile" 
                    value={formData.profile}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="active" 
                    checked={formData.active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Instructor'}
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
              Instructor information has been successfully updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditInstructor; 