'use client';

import React, { useState, useEffect } from 'react';
import Profile from '../components/Profile/Profile';
// import UserDataDisplay from '../components/Profile/UserDataDisplay';
// 
interface UserData {
  // Define the structure of UserData here
  id: string;
  name: string;
  email: string;
  // Add other fields as necessary
}

const ProfilePage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('https://api.4pmti.com/auth/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
            // Add any authentication headers if required
          },
        });

        const data = await response.json();

        if (data.success) {
          setUserData(data.data);
        } else {
          setError(data.error || 'Failed to fetch user data');
        }
      } catch (err:any) {
        setError(err.message  ||'Failed to connect to the server');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Pass userData to both components */}
        <Profile userData={userData} />
        {/* <UserDataDisplay userData={userData} /> */}
      </div>
    </div>
  );
};

export default ProfilePage;