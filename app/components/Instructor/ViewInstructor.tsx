'use client'
import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useParams } from 'next/navigation';

const ViewInstructor = () => {
  const { id } = useParams();
  interface Instructor {
    name: string;
    uid: string;
    emailID: string;
    mobile: string;
    telNo: string;
    billingAddress: string;
    contactAddress: string;
    profile?: string;
    active: boolean;
  }

  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const response = await fetch(`https://api.projectmanagementtraininginstitute.com/instructor/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        const data = await response.json();

        if (data.success) {
          setInstructor(data.data);
        } else {
          setError(data.error || 'Failed to fetch instructor details');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching instructor details');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!instructor) {
    return (
      <Alert className="max-w-2xl mx-auto mt-8">
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>Instructor details not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <User className="h-6 w-6" />
            {instructor.name}
          </CardTitle>
          <p className="text-gray-500">ID: {instructor.uid}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{instructor.emailID}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p>{instructor.mobile}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Telephone</p>
                  <p>{instructor.telNo}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Billing Address</p>
                  <p className="whitespace-pre-line">{instructor.billingAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Contact Address</p>
                  <p className="whitespace-pre-line">{instructor.contactAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {instructor.profile && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Profile</h3>
              <p className="text-gray-700">{instructor.profile}</p>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${instructor.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {instructor.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewInstructor;