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


interface ProfileProps {
  userData: UserData | null;
}

const ProfilePage = () => {



  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Pass userData to both components */}
        <Profile />
        {/* <UserDataDisplay userData={userData} /> */}
      </div>
    </div>
  );
};

export default ProfilePage;