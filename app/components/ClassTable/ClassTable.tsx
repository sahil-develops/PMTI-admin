'use client'
import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Search, Plus, MoreVertical, Edit2, Trash2, User, Eye } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useToast } from "@/hooks/use-toast";

interface ClassType {
  id: number;
  name: string;
  description: string;
  isDelete: boolean;
  active: boolean;
}

interface Location {
  id: number;
  location: string;
  addedBy: string;
  updatedBy: string;
  isDelete: boolean;
  createdAt: string;
  updateAt: string;
}

interface ClassData {
  id: number;
  title: string;
  classType: ClassType;
  startDate: string;
  endDate: string;
  location: Location;
  instructor: string | null;
  status: string;
  maxStudent: number;
  minStudent: number;
  enrolledStudents?: number;
  description: string;
  onlineAvailable: boolean;
  isCancel: boolean;
  isDelete: boolean;
  price: string;
  address: string;
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
  startDateFrom: string;
  startDateTo: string;
  countryId: string;
  locationId: string;
  instructorId: string;
  courseCategoryId: string;
  classTypeId: string;
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
  refreshData,
  classItem,
  onDelete
}: { 
  classId: number;
  refreshData: () => void;
  classItem: ClassData;
  onDelete: (id: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    onDelete(classId);
    
    try {
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
        refreshData();
        throw new Error('Failed to delete class');
      }

      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setIsOpen(false);
    }
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        router.push(`/edit-class/${classId}`);
        break;
      case 'delete':
        setShowDeleteModal(true);
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
    <>
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

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Class"
        message={`Are you sure you want to delete the class "${classItem.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
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
  
  interface Instructor {
    id: number;
    name: string;
  }
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  interface CourseCategory {
    id: number;
    name: string;
  }

  const [courseCategories, setCourseCategories] = useState<CourseCategory[]>([]);
  interface ClassType {
    id: number;
    name: string;
  }

  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  interface Country {
    name: ReactNode;
    id: number;
    CountryName: string;
    currency: string;
    isActive: boolean;
    addedBy: number;
    updatedBy: number | null;
    __locations__: Location[];
  }
  
  const [countries, setCountries] = useState<Country[]>([]);
  
  const [cities, setCities] = useState<Location[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startDateFrom: '',
    startDateTo: '',
    countryId: '',
    locationId: '',
    instructorId: '',
    courseCategoryId: '',
    classTypeId: '',
    showClass: '',
  });


  const fetchDropdownData = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      };
  
      const [
        instructorsRes,
        categoriesRes,
        classTypesRes,
        countriesRes
      ] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}instructor`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}category`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}classtype`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}country`, { headers })
      ]);
  
      const [
        instructorsData,
        categoriesData,
        classTypesData,
        countriesData
      ] = await Promise.all([
        instructorsRes.json(),
        categoriesRes.json(),
        classTypesRes.json(),
        countriesRes.json()
      ]);
  
      setInstructors(instructorsData.data.map((instructor: any) => ({
        id: instructor.id,
        name: instructor.name
      })));
      setCourseCategories(categoriesData.data);
      setClassTypes(classTypesData.data);
      setCountries(countriesData.data.map((country: any) => ({
        id: country.id,
        name: country.CountryName
      })));
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    } finally {
      setIsLoadingDropdowns(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);



  const [globalSearch, setGlobalSearch] = useState('');

  const calculateAvailableSpots = (classItem: ClassData) => {
    const enrolled = classItem.enrolledStudents || 0;
    return classItem.maxStudent - enrolled;
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        sort: 'id:DESC',
        limit: '10'
      });

      // Add filter parameters if they exist
      if (searchParams.courseCategoryId) queryParams.append('courseCategory', searchParams.courseCategoryId);
      if (searchParams.classTypeId) queryParams.append('classType', searchParams.classTypeId);
      if (searchParams.locationId) queryParams.append('locationId', searchParams.locationId);
      if (searchParams.instructorId) queryParams.append('instructorId', searchParams.instructorId);
      if (searchParams.startDateFrom) queryParams.append('startDateFrom', searchParams.startDateFrom);
      if (searchParams.startDateTo) queryParams.append('startDateTo', searchParams.startDateTo);
      if (searchParams.countryId) queryParams.append('countryId', searchParams.countryId); // Add this line
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}class/?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch classes');
      
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
      startDateFrom: '',
      startDateTo: '',
      countryId: '',
      locationId: '',
      instructorId: '',
      courseCategoryId: '',
      classTypeId: '',
      showClass: '',
    });
    setGlobalSearch('');
    setCurrentPage(1);
  };

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = event.target.value;
    setSelectedCountry(countryId);
    setSearchParams(prev => ({ ...prev, countryId }));

    const selectedCountryData = countries.find(country => country.id.toString() === countryId);
    if (selectedCountryData) {
      setCities(selectedCountryData.locations);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = event.target.value;
    setSearchParams(prev => ({ ...prev, locationId }));
  };

  // Loading shimmer component
  const TableShimmer = () => (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-zinc-200 h-16 bg-zinc-50" />
      ))}
    </div>
  );

  const deleteClassLocally = (classId: number) => {
    setClasses(prevClasses => prevClasses.filter(c => c.id !== classId));
  };

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
        <p className="font-semibold leading-none tracking-tight text-xl">Classes</p>
        <button
          onClick={() => router.push('/addclass')}
          className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700"
        >
          <Plus size={20} />
          Add Class
        </button>
      </div>

      {/* Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startDateFrom">Start Date From</Label>
          <Input
            type="date"
            id="startDateFrom"
            value={searchParams.startDateFrom}
            onChange={(e) => setSearchParams({ ...searchParams, startDateFrom: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="startDateTo">Start Date To</Label>
          <Input
            type="date"
            id="startDateTo"
            value={searchParams.startDateTo}
            onChange={(e) => setSearchParams({ ...searchParams, startDateTo: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Country</Label>
          <Select
            value={searchParams.countryId}
            onValueChange={(value) => setSearchParams({ ...searchParams, countryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {countries?.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Instructor</Label>
          <Select
            value={searchParams.instructorId}
            onValueChange={(value) => setSearchParams({ ...searchParams, instructorId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Instructor" />
            </SelectTrigger>
            <SelectContent>
              {instructors?.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.id.toString()}>
                  {instructor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Course Category</Label>
          <Select
            value={searchParams.courseCategoryId}
            onValueChange={(value) => setSearchParams({ ...searchParams, courseCategoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {courseCategories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Class Type</Label>
          <Select
            value={searchParams.classTypeId}
            onValueChange={(value) => setSearchParams({ ...searchParams, classTypeId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Class Type" />
            </SelectTrigger>
            <SelectContent>
              {classTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Show Class</Label>
          <Select
            value={searchParams.showClass}
            onValueChange={(value) => setSearchParams({ ...searchParams, showClass: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
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
            {classes && classes?.length > 0 ? (
  classes.map((classItem) => (
    <tr key={classItem.id} className="hover:bg-zinc-50">
      <TableCell>{classItem.classType?.name || 'N/A'}</TableCell>
      <TableCell className="font-medium text-zinc-900">
        {classItem.title}
      </TableCell>
      <TableCell>
        {classItem.location?.location || 'N/A'}
      </TableCell>
      <TableCell>
        {new Date(classItem.startDate).toLocaleDateString()}
      </TableCell>
      <TableCell>
        {new Date(classItem.endDate).toLocaleDateString()}
      </TableCell>
      <TableCell>{classItem?.instructor || 'Not assigned'}</TableCell>
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
          classItem={classItem}
          onDelete={deleteClassLocally}
        />
      </TableCell>
    </tr>
  ))
) : (
  <tr>
    <td colSpan={10} className="text-center py-4">
      No data found
    </td>
  </tr>
)}
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