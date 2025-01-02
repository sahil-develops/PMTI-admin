'use client'
import React, { useState,useEffect } from 'react';

import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Country {
  id: number;
  CountryName: string;
  currency: string;
}

interface SignupData {
  name: string;
  designation: string;
  phone: string;
  email: string;
  countryId: number;
  isSuperAdmin: boolean;
  isActive: boolean;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  message: string;
}

const NotificationModal: React.FC<ModalProps> = ({ isOpen, onClose, type, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative animate-fadeIn">
        <div className="flex items-center justify-center mb-4">
          {type === 'success' ? (
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
        </div>
        <div className="text-center mb-6">
          <h3 className={`text-lg font-semibold ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {type === 'success' ? 'Success!' : 'Error'}
          </h3>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${type === 'success' 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600'
            }
            transition duration-200`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const SignIn = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const response = await fetch('http://192.252.156.251:25769/country');
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setIsLoadingCountries(false);
    }
  };
  const filteredCountries = countries.filter(country =>
    country.CountryName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const router = useRouter()

  const [signupData, setSignupData] = useState<SignupData>({
    name: '',
    designation: '',
    phone: '',
    email: '',
    countryId: 4,
    isSuperAdmin: true,
    isActive: true,
    password: '',
  });

  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
  });


  const showNotification = (type: 'success' | 'error', message: string) => {
    setModalType(type);
    if (type === 'success') {
      setSuccessMessage(message);
    } else {
      setError(message);
    }
    setShowModal(true);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/signup/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...signupData,
          lastlogin: "2024-12-09T00:00:00Z"
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Signup failed');
      }
      
      showNotification('success', 'Account created successfully! Please log in.');
      setTimeout(() => {
        setIsLogin(true);
        router.push("/login")
      }, 2000);
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('accessToken', data.data.access_token);
      showNotification('success', 'Login successful! Redirecting...');
      // You can redirect here or handle successful login
      setTimeout(() => {
        setIsLogin(true);
        router.push("/students")
        // router.push("/login")
      }, 2000);
      console.log('Login successful!');
    } catch (err) {
      showNotification('error', err instanceof Error ? err.message : 'An error occurred during login');

      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isLogin ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                  Designation
                </label>
                <input
                  id="designation"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  value={signupData.designation}
                  onChange={(e) => setSignupData({ ...signupData, designation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
              <div className="space-y-2">
  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
    Country
  </label>
  <Select 
    value={signupData.countryId.toString()} 
    onValueChange={(value) => setSignupData({ ...signupData, countryId: parseInt(value) })}
  >
    <SelectTrigger className='bg-white'>
      <SelectValue placeholder="Select a country" className='bg-white' />
    </SelectTrigger>
    <SelectContent>
      <div className="sticky top-0 p-2 bg-white">
        <Input
          placeholder="Search countries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 bg-white"
        />
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {isLoadingCountries ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : filteredCountries.length > 0 ? (
          filteredCountries.map((country) => (
            <SelectItem key={country.id} value={country.id.toString()} className='bg-white'>
              {country.CountryName} ({country.currency})
            </SelectItem>
          ))
        ) : (
          <div className="p-2 text-center text-sm text-gray-500">
            No countries found
          </div>
        )}
      </div>
    </SelectContent>
  </Select>
</div>
                
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                />
              </div>
            </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign up'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            className="font-medium text-blue-600 hover:text-blue-500"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
      <NotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        message={modalType === 'success' ? (successMessage || '') : (error || '')}
      />
    </div>
  );
};

export default SignIn;