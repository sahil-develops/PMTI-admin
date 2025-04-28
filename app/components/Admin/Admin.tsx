"use client";
import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminData {
  countryId: number;
  id: number;
  uid: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  lastlogin: string | null;
  updateAt: string;
}

interface Country {
  id: number;
  CountryName: string;
  currency: string;
  isActive: boolean;
  addedBy: number;
  updatedBy: number | null;
}

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center space-x-3 bg-zinc-50/50 rounded-md px-3 py-2 border border-zinc-200">
    <div className="flex space-x-1">
      <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce"></div>
    </div>
    <span className="text-sm text-zinc-500 font-medium">Loading...</span>
  </div>
);

const ActionDropdown = ({ adminId }: { adminId: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleAction = (action: string) => {
    if (action === 'edit') {
      router.push(`/edit-admin/${adminId}`);
    } else if (action === 'delete') {
      // Handle delete action
      console.log(`Delete admin ${adminId}`);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-zinc-100"
      >
        <MoreVertical size={20} className="text-zinc-600" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white z-20 py-1">
            <button
              onClick={() => handleAction('edit')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2"
            >
              <Edit2 size={16} />
              Edit details
            </button>
            <button
              onClick={() => handleAction('delete')}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete admin
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Admin = () => {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    status: '',
    name: '',
  });
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/admin', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admins');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setAdmins(result.data);
          setFilteredAdmins(result.data);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch('https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/country', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setCountries(result.data);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const handleSearch = () => {
    let filtered = [...admins];

    if (filters.name) {
      filtered = filtered.filter(admin => 
        admin.name.toLowerCase().includes(filters.name.toLowerCase()) ||
        admin.email.toLowerCase().includes(filters.name.toLowerCase()) ||
        admin.designation.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(admin => {
        if (filters.status === 'active') return admin.isActive;
        if (filters.status === 'inactive') return !admin.isActive;
        return true;
      });
    }

    if (filters.country) {
      filtered = filtered.filter(admin => 
        admin.countryId === Number(filters.country)
      );
    }

    setFilteredAdmins(filtered);
  };

  const handleReset = () => {
    setFilters({
      country: '',
      status: '',
      name: '',
    });
    setFilteredAdmins(admins);
  };

  // Loading shimmer component
  const TableShimmer = () => (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-zinc-200 h-16 bg-zinc-50" />
      ))}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold leading-none tracking-tight text-xl">
          Admins
        </p>
        <button
          onClick={() => router.push("/add-admin")}
          className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700"
        >
          <Plus size={20} />
          Add Admin
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-4 mb-6">
        <div className="flex flex-col gap-2 w-full">
          <Label>Country</Label>
          <Select
            value={filters.country}
            onValueChange={(value) => setFilters({ ...filters, country: value })}
          >
            <SelectTrigger className="bg-white">
              {loadingCountries ? (
                <LoadingSpinner />
              ) : (
                <SelectValue placeholder="Select Country" />
              )}
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem 
                  key={country.id} 
                  value={country.id.toString()}
                >
                  {country.CountryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Label>Search</Label>
          <Input
            placeholder="Search by name, email, or designation..."
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>

        <div className="flex items-end gap-2 w-full">
          <button
            onClick={handleSearch}
            className="bg-zinc-800 text-white px-6 py-2 w-full rounded hover:bg-zinc-700"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="border border-zinc-300 px-6 py-2 rounded w-full hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto pb-20">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Designation</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <TableShimmer />
            ) : filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-4 text-sm text-zinc-900 font-medium">
                    {admin.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-600">
                    {admin.email}
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-600">
                    {admin.designation}
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-600">
                    {admin.phone}
                  </td>
                  <td className="px-4 py-4 text-sm text-zinc-600">
                    {admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        admin.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <ActionDropdown adminId={admin.id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-zinc-500">
                  No admins found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;