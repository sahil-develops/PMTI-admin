'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Instructor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      const response = await fetch('auth/signup/instructor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start max-w-7xl w-full justify-start p-4">
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

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>Successfully signed up! You can now log in.</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Instructor;