'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Search, Plus, MoreVertical, Edit2, Trash2, User, Eye } from 'lucide-react';

interface ClassData {
  id: number;
  title: string;
  classType: string;
  startDate: string;
  endDate: string;
  location: string;
  instructor: string;
  status: string;
  maxStudent: number;
  minStudent: number;
  enrolledStudents?: number;
}

interface Metadata {
  total: number;
  totalPages: number;
  currentPage: string;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: string;
}

interface SearchParams {
  startDate: string;
  endDate: string;
  country: string;
  location: string;
  instructor: string;
  courseCategory: string;
  classType: string;
  showClass: string;
}


// Custom Alert Component
const Alert = ({ message, type = 'error', onClose }: { message: string; type?: 'error' | 'success'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
    type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
  }`}>
    <div className="flex justify-between items-center">
      <p>{message}</p>
      <button onClick={onClose} className="ml-4 text-sm hover:text-opacity-75">×</button>
    </div>
  </div>
);

// Custom Dropdown Component
const ActionDropdown = ({ 
  classId, 
  refreshData 
}: { 
  classId: number;
  refreshData: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}class/${classId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete class');
      }

      alert('Class deleted successfully');
      refreshData(); // Refresh the table data
    } catch (error) {
      alert('Failed to delete class');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        router.push(`/edit-class/${classId}`);
        break;
      case 'delete':
        handleDelete();
        break;
      case 'details':
        router.push(`/class-details/${classId}`);
        break;
      case 'roster':
        router.push(`/class-roster/${classId}`);
        break;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-zinc-100"
        disabled={isDeleting}
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
              onClick={() => handleAction('details')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2"
              disabled={isDeleting}
            >
              <Eye size={16} />
              View details
            </button>
            <button
              onClick={() => handleAction('edit')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2"
              disabled={isDeleting}
            >
              <Edit2 size={16} />
              Edit details
            </button>
            <button
              onClick={() => handleAction('roster')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 flex items-center gap-2"
              disabled={isDeleting}
            >
              <User size={16} />
              View roster
            </button>
            <button
              onClick={() => handleAction('delete')}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              disabled={isDeleting}
            >
              <Trash2 size={16} />
              {isDeleting ? 'Deleting...' : 'Delete class'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap">{children}</th>
);

const TableCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-4 text-sm text-zinc-600 ${className}`}>{children}</td>
);

  
const ClassTable = () => {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startDate: '',
    endDate: '',
    country: '',
    location: '',
    instructor: '',
    courseCategory: '',
    classType: '',
    showClass: '',
  });
  const [globalSearch, setGlobalSearch] = useState('');

  const calculateAvailableSpots = (classItem: ClassData) => {
    const enrolled = classItem.enrolledStudents || 0;
    return classItem.maxStudent - enrolled;
  };


  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}class/?page=${currentPage}&sort=id:DESC`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      setClasses(data.data.data);
      setMetadata(data.data.metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchClasses();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClasses();
  };

  const handleReset = () => {
    setSearchParams({
      startDate: '',
      endDate: '',
      country: '',
      location: '',
      instructor: '',
      courseCategory: '',
      classType: '',
      showClass: '',
    });
    setGlobalSearch('');
    setCurrentPage(1);
  };

  // Loading shimmer component
  const TableShimmer = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b border-zinc-200 h-16 bg-zinc-50 mb-2" />
      ))}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {error && (
        <Alert
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-zinc-800">Classes</h2>
        <button
          onClick={() => router.push('/add-class')}
          className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700"
        >
          <Plus size={20} />
          Add Class
        </button>
      </div>

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm text-zinc-600 mb-1">Start Date From</label>
          <div className="relative">
            <input
              type="date"
              value={searchParams.startDate}
              onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
              className="w-full p-2 border border-zinc-300 rounded date-input"
            />

          </div>
        </div>

        {/* Add other search inputs similarly */}
        <div className="flex flex-col">
          <label className="text-sm text-zinc-600 mb-1">Country</label>
          <select
            value={searchParams.country}
            onChange={(e) => setSearchParams({ ...searchParams, country: e.target.value })}
            className="w-full p-2 border border-zinc-300 rounded"
          >
            <option value="">Select Country</option>
            {/* Add country options */}
          </select>
        </div>

        {/* Global Search */}
        <div className="lg:col-span-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search classes..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full p-2 pl-10 border border-zinc-300 rounded"
            />
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={20} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleSearch}
          className="bg-zinc-800 text-white px-6 py-2 rounded hover:bg-zinc-700"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="border border-zinc-300 px-6 py-2 rounded hover:bg-zinc-50"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <TableShimmer />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                <TableHeader>Type</TableHeader>
                <TableHeader>Title</TableHeader>
                <TableHeader>Location</TableHeader>
                <TableHeader>Start Date</TableHeader>
                <TableHeader>End Date</TableHeader>
                <TableHeader>Instructor</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Enrolled</TableHeader>
                <TableHeader>Left</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {classes.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-zinc-50">
                  <TableCell>{classItem.classType || 'N/A'}</TableCell>
                  <TableCell className="font-medium text-zinc-900">
                    {classItem.title}
                  </TableCell>
                  <TableCell>{classItem.location}</TableCell>
                  <TableCell>
                    {new Date(classItem.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(classItem.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{classItem.instructor || 'Not assigned'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      classItem.status === '1' 
                        ? 'bg-green-100 text-green-800' 
                        : classItem.status === '2'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {classItem.status === '1' ? 'Active' : classItem.status === '2' ? 'Pending' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {classItem.enrolledStudents || 0}
                  </TableCell>
                  <TableCell>
                    {calculateAvailableSpots(classItem)}
                  </TableCell>
                  <TableCell>
                  <ActionDropdown 
                      classId={classItem.id}
                      refreshData={fetchClasses}
                    />
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination */}
      {metadata && (
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm text-zinc-600">
            Showing page {metadata.currentPage} of {metadata.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={!metadata.hasPrevious}
              className="px-4 py-2 border border-zinc-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 hover:bg-zinc-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!metadata.hasNext}
              className="px-4 py-2 border border-zinc-300 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 hover:bg-zinc-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTable;