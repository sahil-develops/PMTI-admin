'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, Search, Plus, Edit2, Trash2, Eye } from "lucide-react";
import api from '@/app/lib/api';

interface Instructor {
  id: string;
  uid: string;
  name: string;
  emailID: string;
  mobile: string;
  telNo: string;
  active: boolean;
}

const Instructor = () => {
  const router = useRouter();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');

  useEffect(() => {
    fetchInstructors();
  }, []);

  useEffect(() => {
    filterInstructors();
  }, [globalSearch, nameSearch, emailSearch, instructors]);

  const fetchInstructors = async () => {
    try {
      const response = await api.get('instructor');
      const data = await response.data;
      if (data.success) {
        setInstructors(data.data);
        setFilteredInstructors(data.data);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInstructors = () => {
    const filtered = instructors.filter(instructor => {
      // Global search check
      const globalMatch = !globalSearch || 
        instructor.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        instructor.emailID?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        instructor.mobile?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        instructor.uid?.toLowerCase().includes(globalSearch.toLowerCase());

      // Name-specific search check
      const nameMatch = !nameSearch || 
        (instructor.name?.toLowerCase().includes(nameSearch.toLowerCase()));

      // Email-specific search check
      const emailMatch = !emailSearch || 
        (instructor.emailID?.toLowerCase().includes(emailSearch.toLowerCase()));

      // Return true only if all active filters match
      return globalMatch && nameMatch && emailMatch;
    });

    setFilteredInstructors(filtered);
  };

  const ActionDropdown = ({ instructor }: { instructor: Instructor }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (action: string) => {
      switch (action) {
        case 'view':
          router.push(`/instructor/${instructor.id}`);
          break;
        case 'edit':
          router.push(`/editInstructor/${instructor.id}`);
          break;
        case 'delete':
          // Handle delete
          break;
      }
      setIsOpen(false);
    };

    return (
      <div className="relative">
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={() => handleAction('view')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 gap-2"
              >
                <Eye className="h-4 w-4" /> View details
              </button>
              <button
                onClick={() => handleAction('edit')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 gap-2"
              >
                <Edit2 className="h-4 w-4" /> Edit details
              </button>
              <button
                onClick={() => handleAction('delete')}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete instructor
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 w-full bg-white rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Instructors</h2>
        <Button 
          onClick={() => router.push('/instructors/addInstructor')}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4" /> Add Instructor
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search globally..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="relative flex-1">
          <Input
            placeholder="Search by name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
        </div>

        <div className="relative flex-1">
          <Input
            placeholder="Search by email..."
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="text-gray-500">UID</TableHead>
                <TableHead className="text-gray-500">Name</TableHead>
                <TableHead className="text-gray-500">Email</TableHead>
                <TableHead className="text-gray-500">Mobile</TableHead>
                <TableHead className="text-gray-500">Telephone</TableHead>
                <TableHead className="text-gray-500">Status</TableHead>
                <TableHead className="text-gray-500 w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredInstructors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No instructors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInstructors.map((instructor) => (
                  <TableRow key={instructor.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900">{instructor.uid || "N/A"}</TableCell>
                    <TableCell className="text-gray-900 font-medium">{instructor.name || "N/A"}</TableCell>
                    <TableCell className="text-gray-900">{instructor.emailID || "N/A"}</TableCell>
                    <TableCell className="text-gray-900">{instructor.mobile || "N/A"}</TableCell>
                    <TableCell className="text-gray-900">{instructor.telNo || "N/A"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        instructor.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {instructor.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ActionDropdown instructor={instructor} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {filteredInstructors.length} of {instructors.length} instructors
        </span>
      </div>
    </div>
  );
};

export default Instructor;